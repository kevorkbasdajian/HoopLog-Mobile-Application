import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

import Icon from "../../components/Icon";
import Quotes from "../../components/Quotes";
import SearchAndFilter from "../../components/SearchAndFilter";
import SessionCard from "../../components/SessionCard";
import { Colors } from "../../constants/colors";
import { useHoopBold } from "../../constants/fonts";
import { useAuth } from "../../context/AuthContext";
import { sessionsAPI, API_URL, transformSessionData } from "../../config/api";

export default function HomePage() {
  const navigation = useNavigation();
  const { settings, user } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fonts = useHoopBold();
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState({});

  const [workoutReminders, setWorkoutReminders] = useState(false);
  const [quotemodal, setquotemodal] = useState(false);
  const [error, setError] = useState(null);

  const [vibration, setvibrations] = useState(false);
  const isLoadingRef = useRef(false);
  const screenWidth = Dimensions.get("window").width;

  if (!fonts) {
    return null;
  }

  useEffect(() => {
    if (settings) {
      setWorkoutReminders(settings.motivationalQuotes);
      setvibrations(settings.vibrationEffects);
    }
  }, [settings]);

  useFocusEffect(
    useCallback(() => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;

      const loadData = async () => {
        try {
          await loadSessions();
          await loadAvatar();
        } finally {
          isLoadingRef.current = false;
        }
      };

      loadData();
    }, [user])
  );

  // Load Sessions using centralized API
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await sessionsAPI.getMyList();

      if (!result.success) {
        throw new Error(result.error);
      }

      const transformedSessions = result.data.map((item) => ({
        ...transformSessionData(item.session),
        progress: item.progress,
        isFavorite: item.favorite,
      }));

      setSessions(transformedSessions);
      setFilteredSessions(transformedSessions);

      const favoriteIds = transformedSessions
        .filter((s) => s.isFavorite)
        .map((s) => s.id);
      setFavorites(favoriteIds);
    } catch (e) {
      console.log("Error loading sessions:", e);
      if (e.message?.includes("Network")) {
        setError(
          "Cannot connect to server. Please check your internet connection."
        );
      } else if (e.message?.includes("timeout")) {
        setError("Request timed out. Please try again.");
      } else if (
        e.message?.includes("401") ||
        e.message?.includes("Unauthorized")
      ) {
        setError("Session expired. Please log in again.");
      } else {
        setError(e.message || "Failed to load sessions. Please try again.");
      }
      setSessions([]);
      setFilteredSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Avatar
  const loadAvatar = async () => {
    try {
      if (user?.avatar) {
        const avatarUrl = user.avatar.startsWith("http")
          ? user.avatar
          : `${API_URL}${user.avatar}`;
        setAvatar({ uri: avatarUrl });
      } else {
        setAvatar(null);
      }
    } catch (e) {
      console.log("Error loading avatar:", e);
    }
  };

  // Delete Session using centralized API
  const handleDeleteSession = async (sessionId) => {
    try {
      const session = sessions.find((s) => s.id === sessionId);

      let result;
      if (session.ownerId === user.id) {
        result = await sessionsAPI.delete(sessionId);
      } else {
        result = await sessionsAPI.unsubscribe(sessionId);
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);
      setFilteredSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.log("Error deleting session:", error);
      alert(error.message || "Failed to delete session");
    }
  };

  const toggleFavorite = async (sessionId) => {
    try {
      setFavoriteLoading((prev) => ({ ...prev, [sessionId]: true }));
      const isFavorite = favorites.includes(sessionId);

      const result = await sessionsAPI.toggleFavorite(sessionId, !isFavorite);

      if (!result.success) {
        throw new Error(result.error);
      }

      setFavorites((prev) =>
        isFavorite
          ? prev.filter((id) => id !== sessionId)
          : [...prev, sessionId]
      );
    } catch (error) {
      console.log("Error toggling favorite:", error);
      alert(error.message || "Failed to update favorite");
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleSaveSession = async (sessionData, isEdit = false) => {
    try {
      if (isEdit) {
        setSessions((prevSessions) =>
          prevSessions.map((s) => (s.id === sessionData.id ? sessionData : s))
        );
        setFilteredSessions((prevFiltered) =>
          prevFiltered.map((s) => (s.id === sessionData.id ? sessionData : s))
        );
      } else {
        await loadSessions();
      }
    } catch (error) {
      console.log("Error saving session:", error);
    }
  };

  const handleSessionPress = (session) => {
    navigation.navigate("Detail", {
      session: session,
      isFavorite: favorites.includes(session.id),
      onToggleFavorite: toggleFavorite,
      onDelete: handleDeleteSession,
      onSave: handleSaveSession,
      isedit: true,
      candelete: true,
    });
  };

  const handleCreateSession = () => {
    navigation.navigate("CreateSession", {
      mode: "create",
      onSave: handleSaveSession,
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <LottieView
          source={require("../../assets/animations/rolling.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={[styles.loadingText, { color: Colors.orange }]}>
          Loading your sessions...
        </Text>
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
          onPress={() => loadSessions()}
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>HoopLog</Text>
            <Text style={styles.tagline}>Track. Train. Dominate.</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Image
              source={
                avatar ? avatar : require("../../assets/images/avatar.png")
              }
              style={{ height: "100%", width: "100%", borderRadius: 24 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.quickActionSection}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={{ width: "100%" }}
          >
            <LinearGradient
              colors={["#F55A00", "#7EC8E3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.exploreCard, { width: screenWidth - 24 }]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Explore Drills</Text>
                <Text style={styles.cardsubTitle}>
                  Pre-built sessions for every skill level
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (vibration) Vibration.vibrate(250);
                  navigation.navigate("Explore");
                }}
                activeOpacity={0.85}
                style={{
                  width: 50,
                  height: 50,
                  position: "absolute",
                  marginTop: 14,
                  right: 0,
                }}
              >
                <Icon
                  icon="arrow-right"
                  style={styles.icon}
                  iconColor={Colors.white}
                  backgroundColor="transparent"
                  size={52}
                />
              </TouchableOpacity>
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
            <LinearGradient
              colors={["#7EC8E3", "#1B4B5A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.exploreCard, { width: screenWidth - 24 }]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Create Sessions</Text>
                <Text style={styles.cardsubTitle}>
                  Build your custom workout
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (vibration) Vibration.vibrate(250);
                  handleCreateSession();
                }}
                activeOpacity={0.85}
                style={{
                  width: 50,
                  height: 50,
                  position: "absolute",
                  marginTop: 14,
                  right: 0,
                }}
              >
                <Icon
                  icon="arrow-right"
                  style={styles.icon}
                  iconColor={Colors.white}
                  backgroundColor="transparent"
                  size={52}
                />
              </TouchableOpacity>
              <View
                style={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  position: "absolute",
                  bottom: 0,
                  right: -15,
                }}
              >
                <LottieView
                  source={require("../../assets/animations/rolling.json")}
                  autoPlay
                  loop
                  style={{
                    width: 150,
                    height: 150,
                  }}
                />
              </View>
            </LinearGradient>
          </ScrollView>
        </View>
        <SearchAndFilter
          sessions={sessions}
          onFilteredSessionsChange={setFilteredSessions}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
        <View style={styles.toggleSection}>
          <Text style={styles.sectionTitle}>My Sessions</Text>

          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {showDetails ? "Detailed" : "Minimal"}
            </Text>
            <Switch
              value={showDetails}
              onValueChange={() => {
                setShowDetails(!showDetails);
              }}
              trackColor={{ false: "#E5E7EB", true: Colors.orange }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.sessionsList}>
          {filteredSessions.length > 0 ? (
            <>
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  showDetails={showDetails}
                  isFavorite={favorites.includes(session.id)}
                  onToggleFavorite={() => toggleFavorite(session.id)}
                  onPress={() => handleSessionPress(session)}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon
                icon="magnify-remove-outline"
                size={84}
                iconColor="rgba(255,255,255,0.6)"
                backgroundColor="transparent"
              />
              <Text style={styles.emptyStateText}>No sessions found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your filters or create a new session
              </Text>
            </View>
          )}
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#789ca9",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "secondary",
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    color: Colors.orange,
    fontSize: 28,
    fontWeight: "bold",
  },
  tagline: {
    color: "#004#64",
    fontSize: 13,
    marginTop: 4,
    fontFamily: "tertiary",
  },
  profileButton: {
    width: 54,
    height: 54,
    backgroundColor: Colors.orange,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2.5,
    borderColor: Colors.orange,
  },
  quickActionSection: {
    borderWidth: 2,
    borderColor: Colors.white,
    marginTop: 25,
    marginInline: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
  exploretitle: {
    fontSize: 20,
    fontFamily: "secondary2",
    color: Colors.white,
    marginBottom: 10,
  },
  exploreCard: {
    height: 250,
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  cardContent: {
    padding: 20,
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
  icon: { paddingRight: 10, right: 0 },
  toggleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "white",
    fontSize: 30,
    fontFamily: "anton",
    marginInline: 10,
  },
  toggleButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  toggleTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleThumb: {
    position: "absolute",
    top: 4,
    width: 16,
    height: 16,
    backgroundColor: "white",
    borderRadius: 8,
  },
  addSessionText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    marginTop: 8,
  },
  addSessionCard: {
    height: 160,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  sessionsList: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
    marginTop: 16,
    fontFamily: "anton",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
    fontFamily: "secondary",
    textAlign: "center",
    paddingHorizontal: 40,
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
});
