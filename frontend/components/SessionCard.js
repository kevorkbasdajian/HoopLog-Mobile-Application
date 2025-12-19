import { useRef } from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "./Icon";

export default function SessionCard({
  session,
  showDetails,
  onPress,
  isFavorite = false,
  onToggleFavorite,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const difficultyColors = {
    Easy: { bg: "#10b981", text: "#10b981", border: "#10b981" },
    Medium: { bg: "#eab308", text: "#eab308", border: "#eab308" },
    Hard: { bg: "#ef4444", text: "#ef4444", border: "#ef4444" },
  };

  const colors = difficultyColors[session.difficulty];

  const handleFavoritePress = (e) => {
    e.stopPropagation();

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleFavorite();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.sessionCard}
    >
      <ImageBackground
        source={session.image}
        style={styles.sessionCardBackground}
        imageStyle={styles.sessionCardImage}
      >
        <View style={styles.gradientOverlay} />

        {session.progress !== null && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${session.progress}%`, backgroundColor: colors.bg },
              ]}
            />
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.topSection}>
            <View style={styles.badgeContainer}>
              <View
                style={[styles.difficultyBadge, { backgroundColor: colors.bg }]}
              >
                <Icon icon="fire" size={24} iconColor="orange" />
                <Text style={styles.difficultyText}>{session.difficulty}</Text>
              </View>

              <View style={styles.typeBadge}>
                <Icon
                  icon="target"
                  size={24}
                  iconColor="#FF6B35"
                  backgroundColor="transparent"
                />
                <Text style={styles.typeText}>{session.type}</Text>
              </View>
            </View>

            <View style={styles.rightBadges}>
              <TouchableOpacity
                style={[
                  styles.favoriteButton,
                  isFavorite && styles.favoriteButtonActive,
                ]}
                onPress={handleFavoritePress}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Icon
                    icon="heart"
                    size={20}
                    iconColor={isFavorite ? "#FF6B35" : "white"}
                    backgroundColor="transparent"
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={styles.sessionTitle} numberOfLines={2}>
              {session.title}
            </Text>

            {showDetails ? (
              <View style={styles.detailsContainer}>
                <Text style={styles.description} numberOfLines={2}>
                  {session.description}
                </Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statBadge}>
                    <Icon
                      icon="clock-outline"
                      size={24}
                      color="white"
                      backgroundColor="white"
                    />
                    <Text style={styles.statText}>{session.duration} min</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Icon
                      icon="lightning-bolt-outline"
                      size={24}
                      iconColor="#FF6B35"
                    />

                    <Text style={styles.statText}>
                      Intensity {session.intensity}/10
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.minimalStats}>
                <View style={styles.minimalStatItem}>
                  <Icon
                    icon="clock-outline"
                    size={30}
                    color="white"
                    backgroundColor="white"
                  />
                  <Text style={styles.minimalStatText}>
                    {session.duration}m
                  </Text>
                </View>
                <View style={styles.minimalStatItem}>
                  <Icon
                    icon="lightning-bolt-outline"
                    size={30}
                    iconColor="#FF6B35"
                  />
                  <Text style={styles.minimalStatText}>
                    {session.intensity}/10
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    height: 256,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  sessionCardBackground: {
    flex: 1,
  },
  sessionCardImage: {
    borderRadius: 16,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  progressBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressBar: {
    height: "100%",
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  rightBadges: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  difficultyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeText: {
    color: "#004E64",
    fontSize: 12,
    fontFamily: "tertiar2",
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FF6B35",
  },
  dateText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  sessionTitle: {
    color: "white",
    fontSize: 24,
    fontFamily: "tertiary",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  detailsContainer: {
    gap: 8,
  },
  description: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  minimalStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  minimalStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  minimalStatText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
