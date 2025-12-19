import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import EntrySuccessPage from "../Screens/EntrySuccessPage";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1E1E1E",
        }}
      >
        <ActivityIndicator size="large" color="#F55A00" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        <Stack.Screen name="MainStack" component={MainStack} />
      ) : (
        <>
          <Stack.Screen name="AuthStack" component={AuthStack} />
          <Stack.Screen name="Success" component={EntrySuccessPage} />
        </>
      )}
    </Stack.Navigator>
  );
}
