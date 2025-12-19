import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../context/AuthContext";

import { Formik } from "formik";
import * as Yup from "yup";

import LottieView from "lottie-react-native";
import { useState } from "react";

import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { Colors } from "../../constants/colors";
import { fonts, useHoopBold } from "../../constants/fonts";

const SignUpSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

const fieldHints = {
  fullName:
    "Enter your full name (minimum 2 characters). This will be displayed on your profile.",
  email:
    "Enter a valid email address. This will be used for login and notifications.",
  password:
    "Create a strong password with at least 6 characters. Include letters, numbers, and special characters for better security.",
  confirmPassword: "Re-enter your password to confirm it matches exactly.",
};

export default function SignUpPage() {
  const navigation = useNavigation();
  const [focusedField, setFocusedField] = useState(null);
  const [expandedHint, setExpandedHint] = useState(null);
  const { signup } = useAuth();

  const fontsLoaded = useHoopBold();
  if (!fontsLoaded) {
    return null;
  }

  const handleSignUp = async (values, { resetForm, setFieldError }) => {
    try {
      const result = await signup(
        values.fullName,
        values.email,
        values.password
      );

      if (!result.success) {
        setFieldError("email", result.error);
        return;
      }
      console.log("Success", `Account created for ${values.email}`);
      resetForm();
      navigation.navigate("Success");
    } catch (error) {
      console.log("Signup error:", error);
      setFieldError("email", "An error occurred. Please try again.");
    }
  };

  const toggleHint = (fieldName) => {
    setExpandedHint(expandedHint === fieldName ? null : fieldName);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/images/arena.png")}
          style={styles.arena}
          blurRadius={2}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.card}>
                <View
                  style={{
                    justifyContent: "flex-start",
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => navigation.goBack()}
                    style={{
                      alignSelf: "flex-start",
                    }}
                  >
                    <LottieView
                      source={require("../../assets/animations/Back.json")}
                      autoPlay
                      loop
                      style={{ width: 45, height: 45 }}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 10,
                      justifyContent: "center",
                    }}
                  >
                    <LottieView
                      source={require("../../assets/animations/player.json")}
                      autoPlay
                      loop
                      style={{ width: 230, height: 230 }}
                    />
                  </View>

                  <Text style={styles.message}>Join the Team</Text>
                  <Text style={styles.subtitle}>
                    Create your account to get started
                  </Text>
                </View>
                <Formik
                  initialValues={{
                    fullName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  }}
                  validationSchema={SignUpSchema}
                  onSubmit={(values, actions) => handleSignUp(values, actions)}
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
                    <View style={{ width: "100%" }}>
                      <View
                        style={[
                          styles.conforemail,
                          {
                            marginTop: 35,
                          },
                        ]}
                      >
                        <View style={styles.inputIconContainer}>
                          <Icon
                            icon="account"
                            size={45}
                            iconColor={
                              touched.fullName && errors.fullName
                                ? "red"
                                : focusedField === "fullName"
                                ? Colors.orange
                                : "#747373ff"
                            }
                            backgroundColor="00FFFFFF"
                          />
                        </View>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              borderColor:
                                touched.fullName && errors.fullName
                                  ? "red"
                                  : focusedField === "fullName"
                                  ? Colors.orange
                                  : "#ccc",
                            },
                          ]}
                          placeholder="Full Name"
                          placeholderTextColor="#aaa"
                          autoCapitalize="words"
                          onFocus={() => setFocusedField("fullName")}
                          onChangeText={handleChange("fullName")}
                          onBlur={(e) => {
                            handleBlur("fullName")(e);
                            setFocusedField(null);
                          }}
                          value={values.fullName}
                        />
                        <TouchableOpacity
                          style={styles.infoIconContainer}
                          onPress={() => toggleHint("fullName")}
                          activeOpacity={0.7}
                        >
                          <Icon
                            icon="information"
                            size={35}
                            iconColor={Colors.orange}
                            backgroundColor="00FFFFFF"
                          />
                        </TouchableOpacity>
                        {touched.fullName && errors.fullName && (
                          <Text style={styles.errorText}>
                            {errors.fullName}
                          </Text>
                        )}
                        {expandedHint === "fullName" && (
                          <View style={styles.hintContainer}>
                            <Text style={styles.hintText}>
                              {fieldHints.fullName}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.conforemail}>
                        <View style={styles.inputIconContainer}>
                          <Icon
                            icon="email"
                            size={45}
                            iconColor={
                              touched.email && errors.email
                                ? "red"
                                : focusedField === "email"
                                ? Colors.orange
                                : "#747373ff"
                            }
                            backgroundColor="00FFFFFF"
                          />
                        </View>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              borderColor:
                                touched.email && errors.email
                                  ? "red"
                                  : focusedField === "email"
                                  ? Colors.orange
                                  : "#ccc",
                            },
                          ]}
                          placeholder="Email"
                          placeholderTextColor="#aaa"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          onFocus={() => setFocusedField("email")}
                          onChangeText={handleChange("email")}
                          onBlur={(e) => {
                            handleBlur("email")(e);
                            setFocusedField(null);
                          }}
                          value={values.email}
                        />
                        <TouchableOpacity
                          style={styles.infoIconContainer}
                          onPress={() => toggleHint("email")}
                          activeOpacity={0.7}
                        >
                          <Icon
                            icon="information"
                            size={35}
                            iconColor={Colors.orange}
                            backgroundColor="00FFFFFF"
                          />
                        </TouchableOpacity>
                        {touched.email && errors.email && (
                          <Text style={styles.errorText}>{errors.email}</Text>
                        )}
                        {expandedHint === "email" && (
                          <View style={styles.hintContainer}>
                            <Text style={styles.hintText}>
                              {fieldHints.email}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.conforemail}>
                        <View style={styles.inputIconContainer}>
                          <Icon
                            icon="key"
                            size={45}
                            style={styles.icon}
                            iconColor={
                              touched.password && errors.password
                                ? "red"
                                : focusedField === "password"
                                ? Colors.orange
                                : "#747373ff"
                            }
                            backgroundColor="00FFFFFF"
                          />
                        </View>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              borderColor:
                                touched.password && errors.password
                                  ? "red"
                                  : focusedField === "password"
                                  ? Colors.orange
                                  : "#ccc",
                            },
                          ]}
                          placeholder="Password"
                          placeholderTextColor="#aaa"
                          secureTextEntry
                          onChangeText={handleChange("password")}
                          onFocus={() => setFocusedField("password")}
                          onBlur={(e) => {
                            handleBlur("password")(e);
                            setFocusedField(null);
                          }}
                          value={values.password}
                        />
                        <TouchableOpacity
                          style={styles.infoIconContainer}
                          onPress={() => toggleHint("password")}
                          activeOpacity={0.7}
                        >
                          <Icon
                            icon="information"
                            size={35}
                            iconColor={Colors.orange}
                            backgroundColor="00FFFFFF"
                          />
                        </TouchableOpacity>
                        {touched.password && errors.password && (
                          <Text style={styles.errorText}>
                            {errors.password}
                          </Text>
                        )}
                        {expandedHint === "password" && (
                          <View style={styles.hintContainer}>
                            <Text style={styles.hintText}>
                              {fieldHints.password}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.conforemail}>
                        <View style={styles.inputIconContainer}>
                          <Icon
                            icon="lock-check"
                            size={45}
                            style={styles.icon}
                            iconColor={
                              touched.confirmPassword && errors.confirmPassword
                                ? "red"
                                : focusedField === "confirmPassword"
                                ? Colors.orange
                                : "#747373ff"
                            }
                            backgroundColor="00FFFFFF"
                          />
                        </View>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              borderColor:
                                touched.confirmPassword &&
                                errors.confirmPassword
                                  ? "red"
                                  : focusedField === "confirmPassword"
                                  ? Colors.orange
                                  : "#ccc",
                            },
                          ]}
                          placeholder="Confirm Password"
                          placeholderTextColor="#aaa"
                          secureTextEntry
                          onChangeText={handleChange("confirmPassword")}
                          onFocus={() => setFocusedField("confirmPassword")}
                          onBlur={(e) => {
                            handleBlur("confirmPassword")(e);
                            setFocusedField(null);
                          }}
                          value={values.confirmPassword}
                        />
                        <TouchableOpacity
                          style={styles.infoIconContainer}
                          onPress={() => toggleHint("confirmPassword")}
                          activeOpacity={0.7}
                        >
                          <Icon
                            icon="information"
                            size={35}
                            iconColor={Colors.orange}
                            backgroundColor="00FFFFFF"
                          />
                        </TouchableOpacity>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <Text style={styles.errorText}>
                            {errors.confirmPassword}
                          </Text>
                        )}
                        {expandedHint === "confirmPassword" && (
                          <View style={styles.hintContainer}>
                            <Text style={styles.hintText}>
                              {fieldHints.confirmPassword}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={{ width: "100%", marginTop: 20 }}>
                        <Button
                          text={
                            isSubmitting ? "Creating Account..." : "Sign Up"
                          }
                          onPress={handleSubmit}
                          disabled={isSubmitting}
                        />
                      </View>
                      <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Already a member?</Text>
                        <Text
                          style={styles.signupLink}
                          onPress={() => navigation.navigate("Login")}
                        >
                          Log in here
                        </Text>
                      </View>
                    </View>
                  )}
                </Formik>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arena: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    backgroundColor: "#eeececff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    alignSelf: "center",
    width: "85%",
    justifyContent: "center",
  },
  maintitle: {
    fontSize: 30,
    color: Colors.orange,
    fontFamily: fonts.hoop,
  },
  message: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: fonts.primary2,
  },
  subtitle: {
    fontFamily: "secondary",
    fontSize: 14,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingLeft: 60,
    paddingRight: 50,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.secondary,
  },
  errorText: {
    marginTop: 10,
    marginLeft: 15,
    color: "red",
    fontFamily: "secondary",
    fontSize: 12,
  },
  conforemail: {
    width: "100%",
    marginBottom: 16,
    position: "relative",
    height: "auto",
  },
  inputIconContainer: {
    position: "absolute",
    top: 2,
    left: 5,
    zIndex: 1,
  },
  infoIconContainer: {
    position: "absolute",
    top: 5,
    right: 10,
    zIndex: 1,
  },
  hintContainer: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.orange,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hintText: {
    fontSize: 12,
    fontFamily: "tertiary2",
    color: "#555",
    lineHeight: 20,
  },
  signupContainer: {
    marginTop: 0,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  signupText: {
    fontSize: 13,
    color: "#555",
    fontFamily: "tertiary2",
  },

  signupLink: {
    color: Colors.orange,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginLeft: 5,
  },
});
