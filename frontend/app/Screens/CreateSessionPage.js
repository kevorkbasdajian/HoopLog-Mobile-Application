import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Formik } from "formik";
import LottieView from "lottie-react-native";
import { useState } from "react";

import {
  Alert,
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
  View,
  Keyboard,
} from "react-native";
import * as Yup from "yup";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { sessionsAPI, API_URL } from "../../config/api";
import * as SecureStore from "expo-secure-store";
// Validation Schema
const SessionSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be less than 50 characters"),
  type: Yup.string()
    .oneOf(
      [
        "Shooting",
        "Dribbling Skills",
        "Defense",
        "Physical Stamina",
        "Layup",
        "Technical Skills",
      ],
      "Invalid session type"
    )
    .required("Session type is required"),
  difficulty: Yup.string()
    .required("Difficulty is required")
    .oneOf(["Easy", "Medium", "Hard"], "Invalid difficulty"),
  duration: Yup.number()
    .min(5, "Duration must be at least 5 minutes")
    .max(300, "Duration must be less than 300 minutes")
    .required("Duration is required")
    .typeError("Duration must be a number"),
  intensity: Yup.number()
    .min(1, "Intensity must be between 1 and 10")
    .max(10, "Intensity must be between 1 and 10")
    .required("Intensity is required")
    .typeError("Intensity must be a number"),
  progress: Yup.number()
    .min(0, "Progress must be between 0 and 100")
    .max(100, "Progress must be between 0 and 100")
    .required(),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .required("Description is required"),
  image: Yup.mixed().required("Image is required"),
});

export default function CreateSessionPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode = "create", session = null, onSave } = route.params || {};
  const { user } = useAuth();
  const isEditMode = Boolean(mode === "edit" && session);

  const isProgressOnlyEdit = Boolean(
    mode === "edit" && session && session.ownerId !== user?.id
  );

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const initialValues = {
    title: session?.title || "",
    type: session?.type || "",
    difficulty: session?.difficulty || "",
    duration: session?.duration?.toString() || "",
    intensity: session?.intensity?.toString() || "",
    progress:
      session?.progress !== null && session?.progress !== undefined
        ? session.progress
        : 0,
    description: session?.description || "",
    image: session?.image || null,
  };

  const [selectedImage, setSelectedImage] = useState(session?.image || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSetFieldValue, setCurrentSetFieldValue] = useState(null);
  const [currentSetFieldTouched, setCurrentSetFieldTouched] = useState(null);

  const openImagePicker = async (source) => {
    try {
      let permissionResult;
      let result;

      if (source === "camera") {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert(
            "Permission Required",
            "Camera access is required to take a photo.",
            [{ text: "OK" }]
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });
      } else {
        permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert(
            "Permission Required",
            "Photo library access is required to select an image.",
            [{ text: "OK" }]
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage({ uri: imageUri });
        if (currentSetFieldValue) {
          currentSetFieldValue("image", { uri: imageUri });
        }
        if (currentSetFieldTouched) {
          currentSetFieldTouched("image", true);
        }
      }
    } catch (error) {
      console.log("Image picker error:", error);
    } finally {
      setModalVisible(false);
    }
  };
  const findIcon = (type) => {
    switch (type) {
      case "Shooting":
        return "target";
      case "Dribbling Skills":
        return "basketball";
      case "Defense":
        return "shield";
      case "Layup":
        return "basketball-hoop";
      case "Physical Stamina":
        return "run";
      case "Technical Skills":
        return "brain";
    }
  };
  const showImageOptions = (setFieldValue, setFieldTouched) => {
    setCurrentSetFieldValue(() => setFieldValue);
    setCurrentSetFieldTouched(() => setFieldTouched);
    setModalVisible(true);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Dismiss keyboard
      Keyboard.dismiss();

      if (isProgressOnlyEdit) {
        // Only update progress for sessions not owned by user
        const result = await sessionsAPI.updateProgress(
          session.id,
          values.progress
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        const updatedSession = {
          ...session,
          progress: values.progress,
        };

        setSuccess("Progress updated successfully!");

        setTimeout(() => {
          if (onSave) {
            onSave(updatedSession, true);
          }
          navigation.goBack();
        }, 1500);
      } else if (isEditMode) {
        // Update full session (only for owned sessions)
        const result = await sessionsAPI.update(session.id, {
          title: values.title,
          type: values.type,
          difficulty: values.difficulty,
          duration: parseInt(values.duration),
          intensity: parseInt(values.intensity),
          description: values.description,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        // Update progress separately
        const progressResult = await sessionsAPI.updateProgress(
          session.id,
          values.progress
        );

        if (!progressResult.success) {
          throw new Error(progressResult.error);
        }

        const updatedSession = {
          id: session.id,
          title: values.title,
          type: values.type,
          difficulty: values.difficulty,
          duration: parseInt(values.duration),
          intensity: parseInt(values.intensity),
          description: values.description,
          image: session.image,
          progress: values.progress,
          ownerId: session.ownerId,
          isFavorite: session.isFavorite,
        };

        setSuccess("Session updated successfully!");

        setTimeout(() => {
          if (onSave) {
            onSave(updatedSession, true);
          }
          navigation.goBack();
        }, 1500);
      } else {
        // Create new session
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("type", values.type);
        formData.append("difficulty", values.difficulty);
        formData.append("duration", parseInt(values.duration));
        formData.append("intensity", parseInt(values.intensity));
        formData.append("description", values.description);

        if (selectedImage && selectedImage.uri) {
          const uriParts = selectedImage.uri.split(".");
          const fileType = uriParts[uriParts.length - 1];

          formData.append("image", {
            uri:
              Platform.OS === "ios"
                ? selectedImage.uri.replace("file://", "")
                : selectedImage.uri,
            type: `image/${fileType}`,
            name: `session-${Date.now()}.${fileType}`,
          });
        }

        const token = await SecureStore.getItemAsync("userToken");
        const response = await fetch(`${API_URL}/sessions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create session");
        }

        // Subscribe to newly created session
        const subscribeResult = await sessionsAPI.subscribe(data.id);

        if (subscribeResult.success) {
          await sessionsAPI.updateProgress(data.id, values.progress);
        }

        setSuccess("Session created successfully!");

        setTimeout(() => {
          if (onSave) {
            onSave(data, false);
          }
          navigation.goBack();
        }, 1500);
      }
    } catch (error) {
      console.log("Error saving session:", error);
      setError(error.message || "Failed to save session. Please try again.");

      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  const types = [
    "Shooting",
    "Dribbling Skills",
    "Defense",
    "Physical Stamina",
    "Layup",
    "Technical Skills",
  ];
  const difficulties = ["Easy", "Medium", "Hard"];

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <LottieView
              source={require("../../assets/animations/rolling.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
            <Text style={styles.loadingText}>
              {isProgressOnlyEdit
                ? "Updating progress..."
                : isEditMode
                ? "Updating session..."
                : "Creating session..."}
            </Text>
          </View>
        </View>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <LottieView
                source={require("../../assets/animations/Back.json")}
                autoPlay
                loop
                style={{ width: 45, height: 45 }}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isProgressOnlyEdit
                ? "Update Progress"
                : isEditMode
                ? "Edit Session"
                : "Create Session"}
            </Text>
            <View style={{ width: 44 }} />
          </View>
          {success && (
            <View style={styles.successContainer}>
              <Icon
                icon="check-circle"
                size={24}
                iconColor="#10B981"
                backgroundColor="transparent"
              />
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

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
            validationSchema={SessionSchema}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
              setFieldTouched,
              isValid,
              isSubmitting,
            }) => (
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Session Image <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.imagePicker,
                      touched.image && errors.image && styles.imagePickerError,
                      (isEditMode || isProgressOnlyEdit) &&
                        styles.imagePickerDisabled,
                    ]}
                    onPress={() => {
                      if (!isEditMode && !isProgressOnlyEdit) {
                        showImageOptions(setFieldValue, setFieldTouched);
                      }
                    }}
                    activeOpacity={isEditMode || isProgressOnlyEdit ? 1 : 0.8}
                    disabled={isEditMode || isProgressOnlyEdit}
                  >
                    {selectedImage ? (
                      <>
                        <Image
                          source={selectedImage}
                          style={styles.selectedImage}
                        />
                        {!isEditMode && (
                          <View style={styles.imageOverlay}>
                            <Icon
                              icon="pencil"
                              size={32}
                              iconColor={Colors.white}
                              backgroundColor="rgba(0,0,0,0.5)"
                            />
                            <Text style={styles.imageOverlayText}>
                              Change Image
                            </Text>
                          </View>
                        )}
                        {isEditMode && (
                          <View style={styles.imageOverlay}>
                            <Icon
                              icon="lock"
                              size={32}
                              iconColor={Colors.white}
                              backgroundColor="rgba(0,0,0,0.5)"
                            />
                            <Text style={styles.imageOverlayText}>
                              Image cannot be changed when editing
                            </Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={styles.imagePickerPlaceholder}>
                        <Icon
                          icon="image"
                          size={48}
                          iconColor="rgba(255,255,255,0.6)"
                          backgroundColor="transparent"
                        />
                        <Text style={styles.imagePickerText}>
                          Tap to select image
                        </Text>
                        <Text style={styles.imagePickerSubtext}>
                          Recommended: 16:9 aspect ratio
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {touched.image && errors.image && !values.image && (
                    <Text style={styles.errorText}>{errors.image}</Text>
                  )}
                </View>

                {isProgressOnlyEdit && (
                  <View style={styles.progressOnlyNotice}>
                    <Icon
                      icon="information"
                      size={34}
                      iconColor={Colors.orange}
                      backgroundColor="transparent"
                    />
                    <Text style={styles.progressOnlyText}>
                      You can only update the progress for this session. All
                      other fields are locked.
                    </Text>
                  </View>
                )}

                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)}
                >
                  <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                  >
                    <View style={styles.modalContainer}>
                      <Text style={styles.modalTitle}>
                        Select Session Image
                      </Text>

                      <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => openImagePicker("camera")}
                      >
                        <Icon
                          icon="camera"
                          style={styles.modalicon}
                          size={45}
                          iconColor={Colors.white}
                          backgroundColor="transparent"
                        />
                        <Text style={styles.optionText}>Take Photo</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => openImagePicker("library")}
                      >
                        <Icon
                          icon="image-multiple"
                          style={styles.modalicon}
                          size={45}
                          iconColor={Colors.white}
                          backgroundColor="transparent"
                        />
                        <Text style={styles.optionText}>
                          Choose from Library
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.optionButton, styles.cancelButton2]}
                        onPress={() => setModalVisible(false)}
                      >
                        <Icon
                          icon="close"
                          style={styles.modalicon}
                          size={45}
                          iconColor={Colors.white}
                          backgroundColor="transparent"
                        />
                        <Text style={styles.optionText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                </Modal>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Title <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.title && errors.title && styles.inputError,
                      isProgressOnlyEdit && styles.inputDisabled,
                    ]}
                    placeholder="e.g., 3-Point Shooting Drill"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={values.title}
                    onChangeText={(text) => {
                      if (!isProgressOnlyEdit) setFieldValue("title", text);
                    }}
                    onBlur={() => {
                      handleBlur("title");
                      setFieldTouched("title", true);
                    }}
                    editable={!isProgressOnlyEdit}
                  />
                  {touched.title && errors.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Session Type <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.optionsContainer}>
                    {types.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.optionButtonType,
                          values.type === type && styles.optionButtonActive,
                          isProgressOnlyEdit && styles.optionDisabled,
                        ]}
                        onPress={() => {
                          if (!isProgressOnlyEdit) setFieldValue("type", type);
                        }}
                        activeOpacity={isProgressOnlyEdit ? 1 : 0.7}
                        disabled={isProgressOnlyEdit}
                      >
                        <Icon
                          icon={findIcon(type)}
                          size={30}
                          iconColor={
                            values.type === type
                              ? Colors.white
                              : "rgba(255,255,255,0.6)"
                          }
                          backgroundColor="transparent"
                        />
                        <Text
                          style={[
                            styles.optionText2,
                            values.type === type && styles.optionTextActive,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {touched.type && !values.type && errors.type && (
                    <Text style={styles.errorText}>{errors.type}</Text>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Difficulty <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.optionsContainer}>
                    {difficulties.map((difficulty) => {
                      const difficultyColors = {
                        Easy: "#10b981",
                        Medium: "#eab308",
                        Hard: "#ef4444",
                      };
                      return (
                        <TouchableOpacity
                          key={difficulty}
                          style={[
                            styles.optionButtonType,
                            values.difficulty === difficulty && [
                              styles.optionButtonActive,
                              { backgroundColor: difficultyColors[difficulty] },
                            ],
                            isProgressOnlyEdit && styles.optionDisabled,
                          ]}
                          onPress={() => {
                            if (!isProgressOnlyEdit)
                              setFieldValue("difficulty", difficulty);
                          }}
                          activeOpacity={isProgressOnlyEdit ? 1 : 0.7}
                          disabled={isProgressOnlyEdit}
                        >
                          <Icon
                            icon={
                              difficulty === "Easy"
                                ? "lightbulb"
                                : difficulty === "Medium"
                                ? "flash"
                                : "fire"
                            }
                            size={30}
                            iconColor={
                              values.difficulty === difficulty
                                ? Colors.white
                                : "rgba(255,255,255,0.6)"
                            }
                            backgroundColor="transparent"
                          />
                          <Text
                            style={[
                              styles.optionText2,
                              values.difficulty === difficulty &&
                                styles.optionTextActive,
                            ]}
                          >
                            {difficulty}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {touched.difficulty &&
                    !values.difficulty &&
                    errors.difficulty && (
                      <Text style={styles.errorText}>{errors.difficulty}</Text>
                    )}
                </View>

                <View style={styles.rowContainer}>
                  <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>
                      Duration (min) <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.inputWithIcon}>
                      <Icon
                        icon="clock-outline"
                        size={20}
                        iconColor="rgba(255,255,255,0.6)"
                        backgroundColor="transparent"
                      />
                      <TextInput
                        style={[
                          styles.inputSmall,
                          touched.duration &&
                            errors.duration &&
                            styles.inputError,
                          isProgressOnlyEdit && styles.inputDisabled,
                        ]}
                        placeholder="45"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={values.duration}
                        onChangeText={(text) => {
                          if (!isProgressOnlyEdit)
                            setFieldValue("duration", text);
                        }}
                        onBlur={() => {
                          handleBlur("duration");
                          setFieldTouched("duration", true);
                        }}
                        keyboardType="numeric"
                        editable={!isProgressOnlyEdit}
                      />
                    </View>
                    {touched.duration && errors.duration && (
                      <Text style={styles.errorText}>{errors.duration}</Text>
                    )}
                  </View>

                  <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>
                      Intensity (1-10) <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.inputWithIcon}>
                      <Icon
                        icon="lightning-bolt-outline"
                        size={20}
                        iconColor="rgba(255,255,255,0.6)"
                        backgroundColor="transparent"
                      />
                      <TextInput
                        style={[
                          styles.inputSmall,
                          touched.intensity &&
                            errors.intensity &&
                            styles.inputError,
                          isProgressOnlyEdit && styles.inputDisabled,
                        ]}
                        placeholder="8"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={values.intensity}
                        onChangeText={(text) => {
                          if (!isProgressOnlyEdit)
                            setFieldValue("intensity", text);
                        }}
                        onBlur={() => {
                          handleBlur("intensity");
                          setFieldTouched("intensity", true);
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                        editable={!isProgressOnlyEdit}
                      />
                    </View>
                    {touched.intensity && errors.intensity && (
                      <Text style={styles.errorText}>{errors.intensity}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.label}>Session Progress</Text>
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressBadgeText}>
                        {values.progress}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.labelSmall}>
                    Track how much of this session you've completed
                  </Text>

                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          {
                            width: `${values.progress}%`,
                            backgroundColor:
                              values.progress === 0
                                ? "#666"
                                : values.progress < 33
                                ? "#ef4444"
                                : values.progress < 66
                                ? "#eab308"
                                : values.progress < 100
                                ? "#10b981"
                                : Colors.orange,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.progressButtonsContainer}>
                      {[0, 25, 50, 75, 100].map((percent) => (
                        <TouchableOpacity
                          key={percent}
                          style={[
                            styles.progressButton,
                            values.progress === percent &&
                              styles.progressButtonActive,
                          ]}
                          onPress={() => {
                            setFieldValue("progress", percent);
                            setFieldTouched("progress", true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.progressButtonText,
                              values.progress === percent &&
                                styles.progressButtonTextActive,
                            ]}
                          >
                            {percent}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.fineControlContainer}>
                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => {
                          const newValue = Math.max(0, values.progress - 5);
                          setFieldValue("progress", newValue);
                          setFieldTouched("progress", true);
                        }}
                      >
                        <Icon
                          icon="minus"
                          size={20}
                          iconColor={Colors.white}
                          backgroundColor="transparent"
                        />
                      </TouchableOpacity>

                      <TextInput
                        style={styles.progressInput}
                        value={values.progress.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text) || 0;
                          const clamped = Math.min(100, Math.max(0, num));
                          setFieldValue("progress", clamped);
                        }}
                        onBlur={() => setFieldTouched("progress", true)}
                        keyboardType="numeric"
                        maxLength={3}
                      />

                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => {
                          const newValue = Math.min(100, values.progress + 5);
                          setFieldValue("progress", newValue);
                          setFieldTouched("progress", true);
                        }}
                      >
                        <Icon
                          icon="plus"
                          size={20}
                          iconColor={Colors.white}
                          backgroundColor="transparent"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {values.progress === 0 && (
                    <View style={styles.progressMessage}>
                      <Icon
                        icon="information"
                        size={36}
                        iconColor="rgba(255,255,255,0.6)"
                        backgroundColor="transparent"
                      />
                      <Text style={styles.progressMessageText}>
                        Not started yet
                      </Text>
                    </View>
                  )}
                  {values.progress > 0 && values.progress < 100 && (
                    <View style={styles.progressMessage}>
                      <Icon
                        icon="progress-clock"
                        size={16}
                        iconColor="#eab308"
                        backgroundColor="transparent"
                      />
                      <Text style={styles.progressMessageText}>
                        In progress
                      </Text>
                    </View>
                  )}
                  {values.progress === 100 && (
                    <View style={styles.progressMessage}>
                      <Icon
                        icon="check-circle"
                        size={16}
                        iconColor="#10b981"
                        backgroundColor="transparent"
                      />
                      <Text style={styles.progressMessageText}>Completed!</Text>
                    </View>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Description <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      touched.description &&
                        errors.description &&
                        styles.inputError,
                      isProgressOnlyEdit && styles.inputDisabled,
                    ]}
                    placeholder="Describe your session in detail..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={values.description}
                    onChangeText={(text) => {
                      if (!isProgressOnlyEdit)
                        setFieldValue("description", text);
                    }}
                    onBlur={() => {
                      handleBlur("description");
                      setFieldTouched("description", true);
                    }}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isProgressOnlyEdit}
                  />
                  <Text style={styles.characterCount}>
                    {values.description.length}/500 characters
                  </Text>
                  {touched.description && errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!isValid || isSubmitting) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={!isValid || isSubmitting}
                >
                  <LinearGradient
                    colors={
                      isValid && !isSubmitting
                        ? [Colors.orange, "#ff8c5a"]
                        : ["#999", "#666"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <Icon
                      icon={isEditMode ? "check" : "plus"}
                      size={24}
                      iconColor={Colors.white}
                      backgroundColor="transparent"
                    />
                    <Text style={styles.submitButtonText}>
                      {isSubmitting
                        ? "Saving..."
                        : isProgressOnlyEdit
                        ? "Update Progress"
                        : isEditMode
                        ? "Update Session"
                        : "Create Session"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Button
                  style={styles.cancelButton}
                  onPress={() => navigation.goBack()}
                  text="Cancel"
                />
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#789ca9",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.orange,
    fontFamily: "anton",
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: 8,
    fontFamily: "secondary",
  },
  labelSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
    fontFamily: "secondary",
  },
  required: {
    color: Colors.orange,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.white,
    borderWidth: 2,
    borderColor: "transparent",
    fontFamily: "secondary",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  textArea: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.white,
    minHeight: 120,
    borderWidth: 2,
    borderColor: "transparent",
    fontFamily: "secondary",
  },
  characterCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    textAlign: "right",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
    fontFamily: "secondary",
  },
  imagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
  },
  imagePickerError: {
    borderColor: "#ef4444",
    borderStyle: "solid",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlayText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    marginTop: 8,
    fontWeight: "600",
  },
  imagePickerSubtext: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 4,
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
  cancelButton2: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  modalicon: {
    position: "absolute",
    left: 20,
    marginBottom: 5,
    marginTop: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButtonType: {
    flex: 1,
    minWidth: "35%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  optionButtonActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  optionText2: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
  optionTextActive: {
    color: Colors.white,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputSmall: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.white,
    fontFamily: "secondary",
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "anton",
  },
  cancelButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
    backgroundColor: "transparent",
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  progressBadge: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "anton",
  },
  sliderContainer: {
    marginTop: 12,
  },
  sliderTrack: {
    height: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  sliderFill: {
    height: "100%",
    borderRadius: 6,
    transition: "width 0.3s ease",
  },
  progressButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  progressButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  progressButtonActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  progressButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
  progressButtonTextActive: {
    color: Colors.white,
    fontWeight: "bold",
  },
  fineControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  progressInput: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 18,
    color: Colors.white,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    textAlign: "center",
    fontWeight: "bold",
    minWidth: 80,
    fontFamily: "anton",
  },
  progressMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  progressMessageText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "secondary",
  },
  imagePickerDisabled: {
    opacity: 0.6,
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
    fontFamily: "secondary",
    marginTop: 10,
    textAlign: "center",
  },
  successContainer: {
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
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
    fontFamily: "secondary",
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
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
    fontFamily: "secondary",
    fontWeight: "500",
  },
  inputDisabled: {
    backgroundColor: "rgba(255,255,255,0.05)",
    opacity: 0.6,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  progressOnlyNotice: {
    backgroundColor: Colors.darkblue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.blue,
  },
  progressOnlyText: {
    flex: 1,
    color: Colors.orange,
    fontSize: 14,
    fontFamily: "secondary",
    fontWeight: "500",
    lineHeight: 20,
  },
});
