import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingPage from "../Screens/LandingPage";
import LoginPage from "../Screens/LoginPage";
import SignUpPage from "../Screens/SignUpPage";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingPage} />
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="SignUp" component={SignUpPage} />
    </Stack.Navigator>
  );
}
