// DEBUGGING VERSION - Replace your entire SessionDetailsPage.js with this

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";

import { useCallback, useState, useEffect } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "../../components/Icon";
import { Colors } from "../../constants/colors";

const { width } = Dimensions.get("window");

export default function SessionDetailsPage() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    session: initialSession,
    isFavorite: initialIsFavorite,
    onToggleFavorite,
    onDelete,
    onSave,
    isedit,
    candelete,
  } = route.params || {};

  const [session, setSession] = useState(initialSession);
  const [favorite, setFavorite] = useState(initialIsFavorite);

  const canEdit = Boolean(isedit);
  const canDelete = Boolean(candelete);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.session) {
        setSession(route.params.session);
      }
      if (route.params?.isFavorite !== undefined) {
        setFavorite(route.params.isFavorite);
      }
    }, [route.params?.session, route.params?.isFavorite])
  );

  const difficultyColors = {
    Easy: { bg: "#10b981", text: "#10b981" },
    Medium: { bg: "#eab308", text: "#eab308" },
    Hard: { bg: "#ef4444", text: "#ef4444" },
  };

  const colors = difficultyColors[session.difficulty];

  const handleToggleFavorite = () => {
    setFavorite(!favorite);
    onToggleFavorite(session.id);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this session?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(session.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    console.log("=== EDIT BUTTON PRESSED ===");
    console.log("Session data:", session);
    console.log("Can edit (owned by user):", canEdit);

    // Navigate to CreateSession with proper mode
    navigation.navigate("CreateSession", {
      mode: "edit",
      session: session,
      onSave: (updatedSession, isEditMode) => {
        console.log("Session updated:", updatedSession);
        setSession(updatedSession);

        // Update route params so data persists
        navigation.setParams({
          session: updatedSession,
          isFavorite: favorite,
        });

        // Call parent onSave callback if provided
        if (onSave) {
          onSave(updatedSession, isEditMode);
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ImageBackground
          source={session.image}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            style={styles.heroGradient}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <LottieView
                source={require("../../assets/animations/Back.json")}
                autoPlay
                loop
                style={{ width: 45, height: 45 }}
              />
            </TouchableOpacity>
            {canDelete === true && (
              <TouchableOpacity
                style={[
                  styles.favoriteButtonLarge,
                  favorite && styles.favoriteButtonActive,
                ]}
                onPress={handleToggleFavorite}
                activeOpacity={0.7}
              >
                <Icon
                  icon="heart"
                  size={24}
                  iconColor={favorite ? Colors.orange : Colors.white}
                  backgroundColor="transparent"
                />
              </TouchableOpacity>
            )}
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{session.title}</Text>
              <View style={styles.heroBadges}>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: colors.bg },
                  ]}
                >
                  <Icon
                    icon="fire"
                    size={30}
                    iconColor="orange"
                    backgroundColor="transparent"
                  />
                  <Text style={styles.badgeText}>{session.difficulty}</Text>
                </View>
                <View style={styles.typeBadge}>
                  <Icon
                    icon="target"
                    size={30}
                    iconColor={Colors.orange}
                    backgroundColor="transparent"
                  />
                  <Text style={styles.typeBadgeText}>{session.type}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {session.progress !== null && session.progress !== undefined && (
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${session.progress}%`, backgroundColor: colors.bg },
                ]}
              />
            </View>
          )}
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Icon
                icon="clock-outline"
                size={42}
                iconColor={Colors.orange}
                backgroundColor="transparent"
              />
              <Text style={styles.statValue}>{session.duration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statCard}>
              <Icon
                icon="lightning-bolt-outline"
                size={42}
                iconColor={Colors.orange}
                backgroundColor="transparent"
              />
              <Text style={styles.statValue}>{session.intensity}/10</Text>
              <Text style={styles.statLabel}>Intensity</Text>
            </View>
          </View>

          {session.progress !== null && session.progress !== undefined && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBarFull}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${session.progress}%`,
                        backgroundColor: colors.bg,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {session.progress}% Complete
                </Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{session.description}</Text>
          </View>

          <View style={styles.actionButtons}>
            {canEdit === true && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <Icon
                  icon="pencil"
                  size={30}
                  iconColor={Colors.white}
                  backgroundColor="transparent"
                />
                <Text style={styles.editButtonText}>Edit Session</Text>
              </TouchableOpacity>
            )}

            {canDelete === true && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Icon
                  icon="delete"
                  size={30}
                  iconColor={Colors.white}
                  backgroundColor="transparent"
                />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
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
  heroImage: {
    width: "100%",
    height: 400,
  },
  heroImageStyle: {
    resizeMode: "cover",
  },
  heroGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 40,
  },
  favoriteButtonLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    top: 60,
    right: 20,
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  heroContent: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: "anton",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroBadges: {
    flexDirection: "row",
    gap: 10,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    gap: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  typeBadgeText: {
    color: Colors.darkblue,
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressBar: {
    height: "100%",
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.darkblue,
    marginTop: 4,
    fontFamily: "anton",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontFamily: "secondary",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 12,
    fontFamily: "anton",
  },
  progressContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  progressBarFull: {
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkblue,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.white,
    lineHeight: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 12,
    fontFamily: "secondary",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.darkblue,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
