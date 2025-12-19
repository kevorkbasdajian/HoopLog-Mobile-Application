import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Colors } from "../constants/colors";

function Icon({
  icon,
  style,
  size = 60,
  backgroundColor = "#ffffffff",
  iconColor = Colors.darkblue,
}) {
  return (
    <View
      style={[
        styles.container,
        style,
        {
          backgroundColor: backgroundColor,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} color={iconColor} size={size / 2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default Icon;
