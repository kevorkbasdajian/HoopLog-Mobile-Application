import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "../../components/Button";
import { Colors } from "../../constants/colors";
import { useHoopBold } from "../../constants/fonts";

export default function LandingPage() {
  const navigation = useNavigation();
  const fontsLoaded = useHoopBold();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(-20)).current;
  const ballRotate = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(30)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!fontsLoaded) return;

    Animated.sequence([
      Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(buttonsTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Loop animations (rotation + glow)
    Animated.loop(
      Animated.timing(ballRotate, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fontsLoaded]);

  // Prevent UI render before fonts are ready
  if (!fontsLoaded) return null;

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/Sounds/Swish.mp3")
      );
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log("Error playing sound", error);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../../assets/images/LandingImage.jpg")}
        blurRadius={5}
      >
        <View style={styles.box}>
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <LottieView
              source={require("../../assets/animations/bbb.json")}
              autoPlay
              loop
              style={{ width: 230, height: 230 }}
            />
          </Animated.View>

          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            }}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.maintitle}>HoopLog</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: subtitleOpacity }}>
            <Text style={styles.subtitle}>
              Track every <Text style={styles.highlight}>shot</Text>, every{" "}
              <Text style={styles.highlight}>game</Text>, every{" "}
              <Text style={styles.highlight}>improvement</Text>.{"\n"}Your
              basketball journey starts here.
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              width: "100%",
              marginTop: 120,
              opacity: buttonsOpacity,
              transform: [{ translateY: buttonsTranslateY }],
            }}
          >
            <Button
              text="Get Started"
              icon="rocket-launch"
              onPress={async () => {
                await playSound();
                navigation.navigate("Login");
              }}
            />
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    position: "absolute",
    top: 80,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  maintitle: {
    fontSize: 40,
    color: Colors.orange,
    textShadowColor: "rgba(255, 140, 0, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    zIndex: 2,
    fontFamily: "HoopBold",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 17,
    color: "#F0F0F0",
    fontFamily: "secondary2",
    textAlign: "center",
    marginHorizontal: 10,
    lineHeight: 22,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  highlight: {
    color: Colors.orange,
    fontWeight: "600",
  },
});
