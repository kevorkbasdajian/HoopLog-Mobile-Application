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

const LoginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [focusedField, setFocusedField] = useState(null);

  const fontsLoaded = useHoopBold();
  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = async (values, { resetForm, setFieldError }) => {
    try {
      const result = await login(values.email, values.password);

      if (!result.success) {
        const errorMsg = result.error.toLowerCase();
        if (
          errorMsg.includes("email") ||
          errorMsg.includes("account") ||
          errorMsg.includes("found")
        ) {
          setFieldError("email", result.error);
        } else if (errorMsg.includes("password")) {
          setFieldError("password", result.error);
        } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
          setFieldError(
            "password",
            "Network error. Please check your connection."
          );
        } else {
          setFieldError("password", result.error);
        }
        return;
      }

      console.log("Success", `Logged in as ${values.email}`);
      resetForm();
      navigation.navigate("Success");
    } catch (error) {
      console.log("Login error:", error);
      setFieldError("password", "An error occurred. Please try again.");
    }
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
                  <Text style={styles.maintitle}>HoopLog</Text>

                  <Text style={styles.message}>Welcome Back</Text>
                  <Text style={styles.subtitle}>
                    Login to continue your journey
                  </Text>
                </View>
                <Formik
                  initialValues={{ email: "", password: "" }}
                  validationSchema={LoginSchema}
                  onSubmit={(values, actions) => handleLogin(values, actions)}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldError,
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
                        {touched.email && errors.email && (
                          <Text style={styles.errorText}>{errors.email}</Text>
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
                        {touched.password && errors.password && (
                          <Text style={styles.errorText}>
                            {errors.password}
                          </Text>
                        )}
                      </View>
                      <View style={{ width: "100%", marginTop: 20 }}>
                        <Button
                          text={isSubmitting ? "Logging in..." : "Login"}
                          onPress={handleSubmit}
                          disabled={isSubmitting}
                        />
                      </View>
                      <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>
                          Don't have an account?
                        </Text>
                        <Text
                          style={styles.signupLink}
                          onPress={() => navigation.navigate("SignUp")}
                        >
                          Sign up here
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
    fontFamily: "primary2",
    fontWeight: "bold",
    fontSize: 20,
  },
  subtitle: {
    fontFamily: "tertiary2",
    fontSize: 14,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingLeft: 60,
    paddingRight: 30,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.secondary,
  },
  errorText: {
    marginTop: 10,
    marginLeft: 15,
    color: "red",
    fontFamily: fonts.secondary,
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
