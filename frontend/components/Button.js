import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import { useHoopBold } from "../constants/fonts";
import Icon from "./Icon";

function Button({
  text,
  icon,
  onPress,
  style = {},
  iconColor,
  disabled = false,
}) {
  const hoopbold = useHoopBold();
  if (!hoopbold) {
    return null;
  }
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.5}
      onPress={disabled ? null : onPress}
      disabled={disabled}
    >
      <View
        style={[styles.container, style, disabled && styles.containerDisabled]}
      >
        {icon && (
          <Icon
            size={40}
            style={styles.icon}
            icon={icon}
            backgroundColor="#dacfcfff"
            iconColor={disabled ? "#999" : iconColor}
          />
        )}
        <Text style={[styles.text, disabled && styles.textDisabled]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 30,
    backgroundColor: Colors.orange,
  },
  containerDisabled: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  icon: {
    position: "absolute",
    left: 5,
    marginLeft: 10,
  },
  text: {
    fontSize: 18,
    color: "#F0F0F0",
    fontWeight: "bold",
    fontFamily: "tertiary2",
  },
  textDisabled: {
    color: "#ccc",
  },
});

export default Button;
