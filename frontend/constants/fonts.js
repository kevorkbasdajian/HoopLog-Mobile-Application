import { useFonts } from "expo-font";

export const fonts = {
  primary: "Montserrat_700Bold", // Strong, modern headline font
  secondary: "Inter_400Regular", // Clean, readable body text
  accent: "BebasNeue_400Regular", // Sporty / logo-style font
  tertiary: "Anton_400Regular",
  hoop: "HoopBold",
  primary2: "primary2",
  secondary2: "secondary2",
};

export const useHoopBold = () => {
  const [fontsLoaded] = useFonts({
    HoopBold: require("../assets/fonts/Amsterdam-ZVGqm.ttf"),
    primary: require("../assets/fonts/Montserrat-Bold.ttf"),
    secondary: require("../assets/fonts/Inter_18pt-Regular.ttf"),
    tertiary: require("../assets/fonts/Roboto_Condensed-Regular.ttf"),
    anton: require("../assets/fonts/BebasNeue-Regular.ttf"),
    primary2: require("../assets/fonts/Oswald-Bold.ttf"),
    secondary2: require("../assets/fonts/Poppins-Regular.ttf"),
  });

  return fontsLoaded;
};
