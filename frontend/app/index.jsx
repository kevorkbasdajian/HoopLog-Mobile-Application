import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "../context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";

export default function index() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
