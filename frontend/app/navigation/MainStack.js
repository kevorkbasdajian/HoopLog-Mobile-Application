import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { Colors } from "../../constants/colors";
import { useHoopBold } from "../../constants/fonts";

import CreateSessionPage from "../Screens/CreateSessionPage";
import ExploreSessionsPage from "../Screens/ExploreSessionsPage";
import HomePage from "../Screens/HomePage";
import ProfilePage from "../Screens/ProfilePage";
import SessionDetailsPage from "../Screens/SessionDetailsPage";
import SettingsPage from "../Screens/SettingsPage";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  const font = useHoopBold();
  if (!font) {
    return null;
  }
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.darkblue,
          borderTopWidth: 0,
          height: 100,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#f57c00",
        tabBarInactiveTintColor: "#e2d7c5ff",
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "primary",
          letterSpacing: 0.5,
        },
        tabBarIconStyle: {
          height: 40,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "basketball" : "basketball";
          } else if (route.name === "Explore") {
            iconName = focused ? "basketball-hoop" : "basketball-hoop-outline";
          } else if (route.name === "Custom") {
            iconName = focused ? "brush" : "brush-outline";
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={focused ? 30 : 22}
              color={color}
              style={{ marginTop: 5 }}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                fontSize: focused ? 13 : 11,
                fontFamily: "primary",
                color: color,
                letterSpacing: 0.5,
              }}
            >
              Home
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreSessionsPage}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                fontSize: focused ? 13 : 11,
                fontFamily: "primary",
                color: color,
                letterSpacing: 0.5,
              }}
            >
              Explore
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="Settings" component={SettingsPage} />
      <Stack.Screen name="Detail" component={SessionDetailsPage} />
      <Stack.Screen name="CreateSession" component={CreateSessionPage} />
    </Stack.Navigator>
  );
}
