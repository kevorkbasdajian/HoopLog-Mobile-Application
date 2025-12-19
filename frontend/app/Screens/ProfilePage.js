import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";

import * as SecureStore from "expo-secure-store";
import { Formik } from "formik";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
  Keyboard,
  Alert,
} from "react-native";
import * as Yup from "yup";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { Colors } from "../../constants/colors";
import { fonts } from "../../constants/fonts";
import { useAuth } from "../../context/AuthContext";
import { userAPI, API_URL } from "../../config/api";

export default function ProfilePage() {
  const navigation = useNavigation();

  const [success, setSuccess] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [vibration, setvibration] = useState(false);
  const { user: authUser, updateUser, settings } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);

  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [focusedField, setFocusedField] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (authUser) {
        setInitialValues({
          name: authUser.fullName || "",
          email: authUser.email || "",
          phone: authUser.phone || "",
        });
        console.log("Loaded user profile from auth context");
      }
    } catch (e) {
      console.log("Error loading user info:", e);
    }
  }, [authUser]);

  const loadAvatar = useCallback(async () => {
    try {
      if (authUser?.avatar) {
        if (authUser.avatar.startsWith("http")) {
          setAvatar({ uri: authUser.avatar });
        } else {
          setAvatar({ uri: `${API_URL}${authUser.avatar}` });
        }
      } else {
        setAvatar(null);
      }
    } catch (e) {
      console.log("Error loading avatar:", e);
    }
  }, [authUser]);
  const loadvibration = useCallback(() => {
    setvibration(settings?.vibrationEffects || false);
  }, [settings]);

  useEffect(() => {
    loadData();
    loadAvatar();
  }, [loadData, loadAvatar]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadAvatar();
      loadvibration();
    }, [loadData, loadAvatar, loadvibration])
  );

  const openImagePicker = async (source) => {
    try {
      let permissionResult;
      let result;

      if (source === "camera") {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          alert("Camera access is required to take a photo.");
          setModalVisible(false);
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          alert("Photo library access is required to select an image.");
          setModalVisible(false);
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }

      setModalVisible(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        await uploadAvatar(uri);
      }
    } catch (error) {
      console.log("Image picker error:", error);
      setModalVisible(false);
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      setUploadingAvatar(true);
      setError(null);
      setSuccess(null);
      console.log("Uploading avatar from URI:", uri);

      const token = await SecureStore.getItemAsync("userToken");
      const fileExtension = uri.split(".").pop();
      const mimeType = `image/${
        fileExtension === "jpg" ? "jpeg" : fileExtension
      }`;

      const formData = new FormData();
      formData.append("avatar", {
        uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
        type: mimeType,
        name: `avatar-${Date.now()}.${fileExtension}`,
      });

      const response = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload avatar");
      }

      const avatarUrl = data.avatar || data.user?.avatar;
      if (avatarUrl) {
        const fullAvatarUrl = avatarUrl.startsWith("http")
          ? avatarUrl
          : `${API_URL}${avatarUrl}`;

        setAvatar({ uri: fullAvatarUrl });
        await updateUser({ avatar: avatarUrl });
      }

      // Show success message instead of alert
      setSuccess("Avatar updated successfully!");

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.log("Error uploading avatar:", error);
      setError(error.message || "Failed to upload avatar");

      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setUploadingAvatar(false);
    }
  };
  const handleEditPhoto = () => {
    setModalVisible(true);
  };

  const LoginSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().matches(/^\d+$/, "Must be a number"),
  });

  const handleUpdateProfile = async (values, { resetForm, setSubmitting }) => {
    try {
      setSubmitting(true);
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Dismiss keyboard before processing
      Keyboard.dismiss();

      const result = await userAPI.updateProfile({
        fullName: values.name,
        phone: values.phone,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      await updateUser({
        fullName: values.name,
        phone: values.phone,
      });

      // Clear focus from any input
      setFocusedField(null);

      // Show success message
      setSuccess("Profile updated successfully!");

      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      resetForm({ values });
    } catch (error) {
      console.log("Error updating profile:", error);
      setError(error.message || "Failed to update profile");

      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {(isLoading || uploadingAvatar) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <LottieView
              source={require("../../assets/animations/rolling.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
            <Text style={styles.loadingText}>
              {uploadingAvatar ? "Uploading avatar..." : "Updating profile..."}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.topborder}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigation.goBack()}
        >
          <LottieView
            source={require("../../assets/animations/Back.json")}
            autoPlay
            loop
            style={{ width: 45, height: 45 }}
          />
        </TouchableOpacity>
        <Text style={styles.text}>Edit Account</Text>
        <View style={{ marginLeft: "auto" }}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => navigation.navigate("Settings")}
          >
            <Icon
              icon="cog"
              style={styles.settings}
              size={45}
              backgroundColor={Colors.white}
              iconColor={Colors.orange}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                avatar ? avatar : require("../../assets/images/avatar.png")
              }
              style={styles.image}
            />
            <View style={styles.cameraBadge}>
              <Icon
                icon="camera"
                size={30}
                iconColor={Colors.white}
                backgroundColor={Colors.orange}
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleEditPhoto}
            style={styles.editPhotoButton}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <LottieView
                source={require("../../assets/animations/rolling.json")}
                autoPlay
                loop
                style={{ width: 28, height: 28 }}
              />
            ) : (
              <Icon
                icon="image-edit"
                size={28}
                iconColor={Colors.orange}
                backgroundColor="transparent"
              />
            )}
            <Text style={styles.editPhotoText}>
              {uploadingAvatar ? "Uploading..." : "Change Photo"}
            </Text>
          </TouchableOpacity>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => !uploadingAvatar && setModalVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => !uploadingAvatar && setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Change Profile Photo</Text>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => openImagePicker("camera")}
                  disabled={uploadingAvatar}
                >
                  <Icon
                    icon="camera"
                    style={styles.modalicon}
                    size={45}
                    iconColor={Colors.white}
                    backgroundColor="#00000000"
                  />
                  <Text
                    style={[
                      styles.optionText,
                      uploadingAvatar && { opacity: 0.5 },
                    ]}
                  >
                    {" "}
                    Take Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => openImagePicker("library")}
                  disabled={uploadingAvatar}
                >
                  <Icon
                    icon="image-multiple"
                    style={styles.modalicon}
                    size={45}
                    iconColor={Colors.white}
                    backgroundColor="#00000000"
                  />
                  <Text
                    style={[
                      styles.optionText,
                      uploadingAvatar && { opacity: 0.5 },
                    ]}
                  >
                    {" "}
                    Choose from Library
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, styles.cancelButton]}
                  onPress={() => !uploadingAvatar && setModalVisible(false)}
                  disabled={uploadingAvatar}
                >
                  <Icon
                    icon="close"
                    style={styles.modalicon}
                    size={45}
                    iconColor={Colors.white}
                    backgroundColor="#00000000"
                  />
                  <Text
                    style={[
                      styles.optionText,
                      uploadingAvatar && { opacity: 0.5 },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        </View>

        {/* SUCCESS BANNER - Shows after successful update */}
        {success && (
          <View style={styles.successContainer}>
            <Icon
              icon="check-circle"
              size={24}
              iconColor="#10B981"
              backgroundColor="transparent"
            />
            <Text style={styles.successText}>{success}</Text>
            <TouchableOpacity onPress={() => setSuccess(null)}>
              <Icon
                icon="close"
                size={20}
                iconColor="#10B981"
                backgroundColor="transparent"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* ERROR BANNER - Shows when something goes wrong */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon
              icon="alert-circle"
              size={24}
              iconColor="#EF4444"
              backgroundColor="transparent"
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Icon
                icon="close"
                size={20}
                iconColor="#EF4444"
                backgroundColor="transparent"
              />
            </TouchableOpacity>
          </View>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleUpdateProfile}
          enableReinitialize={true}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Icon
                    icon="account"
                    size={30}
                    iconColor={
                      touched.name && errors.name
                        ? "red"
                        : focusedField === "name"
                        ? Colors.orange
                        : Colors.white
                    }
                    backgroundColor="transparent"
                  />
                </View>
                <TextInput
                  placeholder="Full Name"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => {
                    handleBlur("name");
                    setFocusedField(null);
                  }}
                  style={[
                    styles.textinput,
                    {
                      borderColor:
                        touched.name && errors.name
                          ? "red"
                          : focusedField === "name"
                          ? Colors.orange
                          : Colors.white,
                    },
                  ]}
                  placeholderTextColor="#b0c4cb"
                  returnKeyType="next"
                />
                {errors.name && touched.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Icon
                    icon="email"
                    size={30}
                    iconColor={Colors.white}
                    backgroundColor="transparent"
                  />
                </View>
                <TextInput
                  placeholder="Email Address"
                  value={values.email}
                  editable={false}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  style={[styles.textinput, styles.disabledInput]}
                  placeholderTextColor="#b0c4cb"
                />
                <View style={styles.lockIconContainer}>
                  <Icon
                    icon="lock"
                    size={24}
                    iconColor="#b0c4cb"
                    backgroundColor="transparent"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Icon
                    icon="phone"
                    size={30}
                    iconColor={
                      touched.phone && errors.phone
                        ? "red"
                        : focusedField === "phone"
                        ? Colors.orange
                        : Colors.white
                    }
                    backgroundColor="transparent"
                  />
                </View>
                <TextInput
                  placeholder="Phone Number"
                  value={values.phone}
                  onChangeText={handleChange("phone")}
                  onFocus={() => setFocusedField("phone")}
                  returnKeyType="done"
                  onBlur={() => {
                    handleBlur("phone");
                    setFocusedField(null);
                  }}
                  keyboardType="phone-pad"
                  style={[
                    styles.textinput,
                    {
                      borderColor:
                        touched.phone && errors.phone
                          ? "red"
                          : focusedField === "phone"
                          ? Colors.orange
                          : Colors.white,
                    },
                  ]}
                  placeholderTextColor="#b0c4cb"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                {errors.phone && touched.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  text={isSubmitting ? "Saving Changes..." : "Save Changes"}
                  onPress={() => {
                    Keyboard.dismiss();
                    handleSubmit();
                    if (vibration) {
                      Vibration.vibrate(200);
                    }
                  }}
                  icon="content-save"
                  iconColor={Colors.orange}
                  disabled={isSubmitting}
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#789ca9ff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  icon: {
    transform: [{ scale: 1.5 }],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: fonts.secondary,
    marginBottom: 20,
  },
  text: {
    fontSize: 21,
    color: Colors.orange,
    marginLeft: 16,
    fontFamily: fonts.secondary,
    fontWeight: "bold",
  },
  image: {
    height: 150,
    width: 150,
    borderRadius: 150 / 2,
    borderColor: Colors.white,
    borderWidth: 4,
  },
  edit: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 22,
  },
  textinput: {
    width: "90%",
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: fonts.secondary,
    backgroundColor: "#789ca9ff",
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    color: Colors.white,
  },
  topborder: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orange,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
  },
  editPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  editPhotoText: {
    color: Colors.orange,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: fonts.secondary,
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  inputWrapper: {
    marginBottom: 20,
    position: "relative",
  },
  inputIconContainer: {
    position: "absolute",
    left: 15,
    top: 14,
    zIndex: 1,
  },
  lockIconContainer: {
    position: "absolute",
    right: 15,
    top: 16,
    zIndex: 1,
  },
  textinput: {
    width: "100%",
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 15,
    paddingLeft: 50,
    paddingRight: 20,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: fonts.secondary,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: Colors.white,
  },
  disabledInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    opacity: 0.7,
    paddingRight: 50,
  },
  errorText: {
    color: "#ff6b6b",
    fontFamily: fonts.secondary,
    marginTop: 6,
    marginLeft: 15,
    fontSize: 13,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: Colors.darkblue,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    fontFamily: "tertiary",
    color: Colors.orange,
  },
  optionButton: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: Colors.orange,
  },
  optionText: {
    fontSize: 15,
    fontFamily: "secondary",
    color: Colors.white,
  },
  cancelButton: {
    borderBottomWidth: 0,
    marginTop: 10,
    color: Colors.gray,
  },
  modalicon: {
    position: "absolute",
    left: 20,
    marginBottom: 5,
    marginTop: 10,
  },
  settings: {
    marginBottom: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    minWidth: 200,
  },
  loadingText: {
    color: Colors.orange,
    fontSize: 16,
    fontFamily: fonts.secondary,
    marginTop: 10,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 14,
    fontFamily: fonts.secondary,
    fontWeight: "500",
  },
  successContainer: {
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#6EE7B7",
  },
  successText: {
    flex: 1,
    color: "#047857",
    fontSize: 14,
    fontFamily: fonts.secondary,
    fontWeight: "500",
  },
});
