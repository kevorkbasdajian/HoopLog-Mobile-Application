import { useNavigation } from "@react-navigation/native";
import { Audio, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { fonts, useHoopBold } from "../../constants/fonts";
import { useAuth } from "../../context/AuthContext";
export default function EntrySuccessPage() {
  const fontsLoaded = useHoopBold();
  const navigation = useNavigation();

  const blurOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const subtitleopacity = useRef(new Animated.Value(0)).current;
  const blurIntensity = useRef(new Animated.Value(0)).current;
  const videoRef = useRef(null);
  const soundRef = useRef(new Audio.Sound());
  const IntroRef = useRef(new Audio.Sound());

  const [videoReady, setVideoReady] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const { completeAuth } = useAuth();

  useEffect(() => {
    if (!fontsLoaded) return;

    const prepareMedia = async () => {
      try {
        await IntroRef.current.loadAsync(
          require("../../assets/Sounds/Intro.mp3")
        );
        await soundRef.current.loadAsync(
          require("../../assets/Sounds/Announcement.mp3")
        );

        setVideoReady(true);
      } catch (error) {
        console.log("Error loading audio:", error);
      }
    };

    prepareMedia();

    return () => {
      soundRef.current.unloadAsync();
      IntroRef.current.unloadAsync();
    };
  }, [fontsLoaded]);

  const handleVideoStart = async () => {
    if (videoStarted) return;
    setVideoStarted(true);

    try {
      await IntroRef.current.playAsync();
    } catch (error) {
      console.log("Error playing Intro:", error);
    }

    setTimeout(() => {
      Animated.timing(blurIntensity, {
        toValue: 80,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      setTimeout(async () => {
        try {
          await soundRef.current.replayAsync();
        } catch (error) {
          console.log("Error playing audio:", error);
        }

        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleopacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2100);
    }, 1500);

    // Keep the existing navigation (lines 89-96) as is
    const timer = setTimeout(async () => {
      await completeAuth(); // Store token and trigger navigation to MainStack
    }, 9000);

    return () => clearTimeout(timer);
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require("../../assets/animations/above.mp4")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay={videoReady}
        isLooping={false}
        isMuted
        volume={0}
        onPlaybackStatusUpdate={(status) => {
          if (status.isPlaying && !videoStarted) {
            handleVideoStart();
          }
        }}
      />

      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: blurOpacity }]}
      >
        <AnimatedBlurView
          intensity={blurIntensity}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.contentContainer}>
        <Animated.Text style={[styles.logo, { opacity: logoOpacity }]}>
          HoopLog
        </Animated.Text>

        <Animated.View
          style={[styles.subtitleContainer, { opacity: subtitleopacity }]}
        >
          <Text style={styles.subtitle}>
            Where <Text style={styles.highlightText}>Passion</Text> meets
            <Text style={styles.highlightText}> Precision</Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 50,
    color: Colors.orange,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    fontFamily: fonts.hoop || "HoopBold",
    textAlign: "center",
  },
  subtitleContainer: {
    alignItems: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    fontFamily: "primary",
    marginBottom: 20,
  },
  highlightText: {
    color: Colors.orange,
    fontFamily: "primary",
  },
});
