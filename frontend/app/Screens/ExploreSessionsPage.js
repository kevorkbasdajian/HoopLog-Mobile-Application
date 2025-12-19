import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Icon from "../../components/Icon";
import Quotes from "../../components/Quotes";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
// Import centralized API
import { sessionsAPI, transformSessionData } from "../../config/api";

export default function ExploreSessionsPage() {
  const navigation = useNavigation();
  const { settings, user } = useAuth();
  const screenWidth = Dimensions.get("window").width;
  const [isLoading, setIsLoading] = useState(true);
  const [userSubscribedIds, setUserSubscribedIds] = useState([]);
  const [prebuiltSessions, setPrebuiltSessions] = useState([]);
  const [addingSessionId, setAddingSessionId] = useState(null);

  const [workoutReminders, setWorkoutReminders] = useState(false);
  const [quotemodal, setquotemodal] = useState(false);
  const [vibration, setvibration] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPrebuiltSessions();
  }, []);

  useEffect(() => {
    if (settings) {
      setWorkoutReminders(settings.motivationalQuotes);
      setvibration(settings.vibrationEffects);
    }
  }, [settings]);

  // Load prebuilt sessions using centralized API
  const loadPrebuiltSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await sessionsAPI.getPrebuilt();

      if (!result.success) {
        throw new Error(result.error);
      }

      const transformedSessions = result.data.map((session) =>
        transformSessionData(session)
      );

      setPrebuiltSessions(transformedSessions);
    } catch (error) {
      console.log("Error loading prebuilt sessions:", error);
      if (error.message?.includes("Network")) {
        setError(
          "Cannot connect to server. Please check your internet connection."
        );
      } else if (error.message?.includes("timeout")) {
        setError("Request timed out. Please try again.");
      } else if (
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        setError("Session expired. Please log in again.");
      } else {
        setError(error.message || "Failed to load sessions. Please try again.");
      }
      setPrebuiltSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user subscribed sessions using centralized API
  const loadUserSubscribedSessions = async () => {
    try {
      const result = await sessionsAPI.getMyList();

      if (result.success) {
        const subscribedIds = result.data.map((item) => item.session.id);
        setUserSubscribedIds(subscribedIds);
      }
    } catch (error) {
      console.log("Error loading subscribed sessions:", error);
    }
  };

  const isSessionAdded = (sessionId) => {
    return userSubscribedIds.includes(sessionId);
  };

  // Add session using centralized API
  const handleAddSession = async (session) => {
    try {
      if (isSessionAdded(session.id)) {
        Alert.alert(
          "Already Added",
          "This session is already in your collection.",
          [{ text: "OK" }]
        );
        return;
      }

      // Set loading state for this specific session
      setAddingSessionId(session.id);

      const result = await sessionsAPI.subscribe(session.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      setUserSubscribedIds((prev) => [...prev, session.id]);

      Alert.alert(
        "Session Added!",
        `"${session.title}" has been added to your sessions.`,
        [
          {
            text: "View My Sessions",
            onPress: () => navigation.navigate("Home"),
          },
          { text: "OK" },
        ]
      );
    } catch (error) {
      console.log("Error adding session:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to add session. Please try again."
      );
    } finally {
      // Clear loading state
      setAddingSessionId(null);
    }
  };

  const handleSessionPress = (session) => {
    navigation.navigate("Detail", {
      session: session,
      isedit: false,
      candelete: false,
    });
  };

  const difficultyColors = {
    Easy: "#10b981",
    Medium: "#eab308",
    Hard: "#ef4444",
  };

  useFocusEffect(
    useCallback(() => {
      loadUserSubscribedSessions();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <LottieView
          source={require("../../assets/animations/rolling.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={styles.loadingText}>Discovering drills...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon
          icon="alert-circle"
          size={80}
          iconColor={Colors.orange}
          backgroundColor="transparent"
        />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadPrebuiltSessions()}
          activeOpacity={0.7}
        >
          <Icon
            icon="refresh"
            size={24}
            iconColor={Colors.white}
            backgroundColor="transparent"
          />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {addingSessionId && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <LottieView
              source={require("../../assets/animations/rolling.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
            <Text style={styles.loadingText}>Adding session...</Text>
          </View>
        </View>
      )}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Explore Drills</Text>
            <Text style={styles.headerSubtitle}>
              {prebuiltSessions.length} Pre-built Sessions
            </Text>
          </View>
          <View />
        </View>

        <LinearGradient
          colors={["#F55A00", "#7EC8E3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.exploreCard, { width: screenWidth - 24 }]}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Ready to Level Up?</Text>
            <Text style={styles.cardsubTitle}>
              Discover professionally designed basketball drills for every skill
              level
            </Text>
          </View>

          <View
            style={{
              justifyContent: "flex-end",
              alignItems: "center",
              position: "absolute",
              bottom: 10,
              right: 10,
            }}
          >
            <LottieView
              source={require("../../assets/animations/basket.json")}
              autoPlay
              loop
              style={{
                width: 120,
                height: 120,
              }}
            />
          </View>
        </LinearGradient>

        <View style={styles.sessionsContainer}>
          <Text style={styles.sectionTitle}>All Drills</Text>

          {prebuiltSessions.map((session) => {
            const isAdded = isSessionAdded(session.id);
            const difficultyColor = difficultyColors[session.difficulty];

            return (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                onPress={() => handleSessionPress(session)}
                activeOpacity={0.9}
              >
                <Image source={session.image} style={styles.sessionImage} />

                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.cardGradient}
                />

                {isAdded && (
                  <View style={styles.addedBadge}>
                    <Icon
                      icon="check-circle"
                      size={25}
                      iconColor={Colors.white}
                      backgroundColor="transparent"
                    />
                    <Text style={styles.addedBadgeText}>Added</Text>
                  </View>
                )}

                <View style={styles.cardContent}>
                  <Text style={styles.sessionTitle} numberOfLines={2}>
                    {session.title}
                  </Text>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <View
                        style={[
                          styles.difficultyBadge,
                          { backgroundColor: difficultyColor },
                        ]}
                      >
                        <Icon
                          icon={
                            session.difficulty === "Easy"
                              ? "lightbulb"
                              : session.difficulty === "Medium"
                              ? "flash"
                              : "fire"
                          }
                          size={26}
                          iconColor={Colors.white}
                          backgroundColor="transparent"
                        />
                        <Text style={styles.difficultyText}>
                          {session.difficulty}
                        </Text>
                      </View>

                      <View style={styles.typeBadge}>
                        <Icon
                          icon={
                            session.type === "Dribbling Skills"
                              ? "basketball"
                              : session.type === "Defense"
                              ? "shield"
                              : session.type === "Layup"
                              ? "basketball-hoop"
                              : session.type === "Physical Stamina"
                              ? "run"
                              : session.type === "Technical Skills"
                              ? "brain"
                              : session.type === "Shooting"
                              ? "target"
                              : "help-circle"
                          }
                          size={26}
                          iconColor={Colors.orange}
                          backgroundColor="transparent"
                        />
                        <Text style={styles.typeText}>{session.type}</Text>
                      </View>
                    </View>

                    <View style={styles.statsRow}>
                      <View style={styles.stat}>
                        <Icon
                          icon="clock-outline"
                          size={28}
                          iconColor={Colors.white}
                          backgroundColor="transparent"
                        />
                        <Text style={styles.statText}>
                          {session.duration} min
                        </Text>
                      </View>
                      <View style={styles.stat}>
                        <Icon
                          icon="lightning-bolt"
                          size={28}
                          iconColor={Colors.white}
                          backgroundColor="transparent"
                        />
                        <Text style={styles.statText}>
                          {session.intensity}/10
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      isAdded && styles.addButtonDisabled,
                      addingSessionId === session.id && styles.addButtonLoading,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (!isAdded && !addingSessionId) {
                        if (vibration) Vibration.vibrate(250);
                        handleAddSession(session);
                      }
                    }}
                    disabled={isAdded || addingSessionId === session.id}
                  >
                    {addingSessionId === session.id ? (
                      <>
                        <LottieView
                          source={require("../../assets/animations/rolling.json")}
                          autoPlay
                          loop
                          style={{ width: 20, height: 20 }}
                        />
                        <Text style={styles.addButtonText}>Adding...</Text>
                      </>
                    ) : (
                      <>
                        <Icon
                          icon={isAdded ? "check" : "plus"}
                          size={20}
                          iconColor={Colors.white}
                          backgroundColor="transparent"
                        />
                        <Text style={styles.addButtonText}>
                          {isAdded ? "Added" : "Add to My Sessions"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      {workoutReminders && (
        <TouchableOpacity
          onPress={() => setquotemodal(true)}
          activeOpacity={0.5}
          style={styles.motivationalicon}
        >
          <Icon
            icon="format-quote-close"
            size={60}
            backgroundColor={Colors.darkblue}
            iconColor="#ccc"
          />
        </TouchableOpacity>
      )}
      {quotemodal && <Quotes onRequestClose={() => setquotemodal(false)} />}
    </View>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#789ca9",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.orange,
    fontFamily: "anton",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
    fontFamily: "secondary",
  },
  heroBanner: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerContent: {
    flex: 1,
    paddingRight: 20,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: "anton",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  bannerText: {
    fontSize: 14,
    color: "#E3F2FD",
    fontFamily: "secondary",
    lineHeight: 20,
  },
  bannerAnimation: {
    width: 100,
    height: 100,
    position: "absolute",
    right: -10,
    bottom: -10,
  },
  sessionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: "anton",
    marginBottom: 20,
  },
  sessionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sessionImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  addedBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addedBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "secondary",
  },
  cardContent: {
    padding: 16,
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.darkblue,
    fontFamily: "anton",
    marginBottom: 12,
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  difficultyText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "secondary",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    gap: 4,
  },
  typeText: {
    color: Colors.darkblue,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "secondary",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkblue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "secondary",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.orange,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#10b981",
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "secondary",
  },
  cardTitle: {
    color: "#fff",
    fontFamily: "anton",
    fontSize: 32,
    letterSpacing: 1,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  cardsubTitle: {
    color: "#E3F2FD",
    fontFamily: "secondary",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
    lineHeight: 22,
    maxWidth: "85%",
  },
  exploreCard: {
    height: 250,
    justifyContent: "flex-start",
    flexDirection: "row",
    marginTop: 20,
    marginInline: 10,
    borderRadius: 20,
  },
  motivationalicon: {
    left: 15,
    bottom: 20,
    position: "absolute",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "secondary",
    marginTop: 16,
  },
  errorTitle: {
    color: Colors.white,
    fontSize: 28,
    fontFamily: "anton",
    marginTop: 16,
  },
  errorText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontFamily: "secondary",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.orange,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "secondary",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    minWidth: 200,
  },
  loadingText: {
    color: Colors.orange,
    fontSize: 16,
    fontFamily: "secondary",
    marginTop: 10,
    textAlign: "center",
  },
  addButtonLoading: {
    backgroundColor: "#FF8C5A",
    opacity: 0.8,
  },
});
