import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "../../components/Icon";
import Quotes from "../../components/Quotes";
import { Colors } from "../../constants/colors";
import { fonts, useHoopBold } from "../../constants/fonts";
import { useAuth } from "../../context/AuthContext";
import { sessionsAPI } from "../../config/api";

export default function SettingsPage() {
  const navigation = useNavigation();
  const [workoutReminders, setWorkoutReminders] = useState(false);
  const [soundEffects, setSoundEffects] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showmotivationalmodal, setmotivationalmodal] = useState(false);
  const {
    logout,
    settings: authSettings,
    updateSettings: updateAuthSettings,
  } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [error, setError] = useState(null);

  const fontsLoaded = useHoopBold();

  useEffect(() => {
    if (authSettings) {
      setWorkoutReminders(authSettings.motivationalQuotes);
      setSoundEffects(authSettings.vibrationEffects);
    }
  }, [authSettings]);

  const saveSettings = async (key, value) => {
    try {
      setIsSavingSettings(true);
      setError(null);

      const settingsToUpdate = {
        motivationalQuotes:
          key === "workoutReminders" ? value : workoutReminders,
        vibrationEffects: key === "soundEffects" ? value : soundEffects,
      };

      const result = await updateAuthSettings(settingsToUpdate);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log("Settings saved successfully");
    } catch (error) {
      console.log("Error saving settings:", error);
      setError(error.message || "Failed to save settings");

      if (key === "workoutReminders") {
        setWorkoutReminders(!value);
      } else if (key === "soundEffects") {
        setSoundEffects(!value);
      }

      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsSavingSettings(false);
    }
  };
  const handllogout = async () => {
    await logout();
  };
  const handleResetData = () => {
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    try {
      setIsResetting(true);
      setError(null);

      const result = await sessionsAPI.resetProgress();
      const settingsToUpdate = {
        motivationalQuotes: false,
        vibrationEffects: false,
      };

      await updateAuthSettings(settingsToUpdate);
      if (!result.success) {
        throw new Error(result.error);
      }

      await AsyncStorage.clear();

      setShowResetModal(false);
      setTimeout(() => {
        Alert.alert("Success", "All data has been reset!");
      }, 300);
    } catch (error) {
      console.log("Reset error:", error);
      setError(error.message || "Failed to reset data");
      setShowResetModal(false);
      Alert.alert("Error", error.message || "Failed to reset data");
    } finally {
      setIsResetting(false);
    }
  };
  const motivationonpress = async () => {
    const newState = !showmotivationalmodal;
    setmotivationalmodal(newState);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topborder}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigation.goBack()}
        >
          <LottieView
            source={require("../../assets/animations/Back.json")}
            autoPlay
            loop
            style={{ width: 45, height: 45 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarCard}>
          <View style={styles.avatarContainer}>
            <LottieView
              source={require("../../assets/animations/Gears.json")}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.maintitle}>Configure HoopLog</Text>
            <Text style={styles.mainsubtitle}>
              Personalize your basketball training experience
            </Text>
          </View>
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Icon
              icon="alert-circle"
              size={24}
              iconColor="#EF4444"
              backgroundColor="transparent"
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Icon
                icon="close"
                size={20}
                iconColor="#EF4444"
                backgroundColor="transparent"
              />
            </TouchableOpacity>
          </View>
        )}
        {isSavingSettings && (
          <View style={styles.savingIndicator}>
            <LottieView
              source={require("../../assets/animations/rolling.json")}
              autoPlay
              loop
              style={{ width: 40, height: 40 }}
            />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Icon
              icon="cog"
              size={45}
              iconColor={Colors.white}
              backgroundColor="transparent"
            />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.iconWrapper}>
                  <Icon
                    icon="alarm"
                    size={43}
                    iconColor={Colors.orange}
                    backgroundColor="transparent"
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Random Quotes</Text>
                  <Text style={styles.settingDescription}>
                    Get Motivational quotes for extra motivation
                  </Text>
                </View>
              </View>
              <Switch
                value={workoutReminders}
                onValueChange={(value) => {
                  setWorkoutReminders(value);
                  saveSettings("workoutReminders", value);
                }}
                disabled={isSavingSettings}
                trackColor={{ false: "#E5E7EB", true: Colors.orange }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.iconWrapper}>
                  <Icon
                    icon="volume-high"
                    size={43}
                    iconColor={Colors.orange}
                    backgroundColor="transparent"
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Vibration Effects</Text>
                  <Text style={styles.settingDescription}>
                    Play vibrations when interacting with buttons
                  </Text>
                </View>
              </View>
              <Switch
                value={soundEffects}
                onValueChange={(value) => {
                  setSoundEffects(value);
                  saveSettings("soundEffects", value);
                }}
                disabled={isSavingSettings}
                trackColor={{ false: "#E5E7EB", true: Colors.orange }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Icon
              icon="database"
              size={45}
              iconColor={Colors.white}
              backgroundColor="transparent"
            />
            <Text style={styles.sectionTitle}>Data Management</Text>
          </View>

          <TouchableOpacity
            style={styles.dangerCard}
            activeOpacity={0.8}
            onPress={handleResetData}
          >
            <View style={styles.dangerIconContainer}>
              <Icon
                icon="delete-forever"
                size={38}
                iconColor="#FFFFFF"
                backgroundColor="transparent"
              />
            </View>
            <View style={styles.dangerTextContainer}>
              <Text style={styles.dangerTitle}>Reset All Data</Text>
              <Text style={styles.dangerDescription}>
                Delete all workouts, stats, and progress
              </Text>
            </View>
            <Icon
              icon="chevron-right"
              size={28}
              iconColor="#FFFFFF"
              backgroundColor="transparent"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Icon
              icon="information"
              size={45}
              iconColor={Colors.white}
              backgroundColor="transparent"
            />
            <Text style={styles.sectionTitle}>About HoopLog</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Icon
                  icon="tag"
                  size={43}
                  iconColor={Colors.orange}
                  backgroundColor="transparent"
                />
                <Text style={styles.infoLabel}>Version</Text>
              </View>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Icon
                  icon="application"
                  size={43}
                  iconColor={Colors.orange}
                  backgroundColor="transparent"
                />
                <Text style={styles.infoLabel}>App Name</Text>
              </View>
              <Text style={styles.infoValue}>HoopLog</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Icon
                  icon="account-group"
                  size={43}
                  iconColor={Colors.orange}
                  backgroundColor="transparent"
                />
                <Text style={styles.infoLabel}>Developer</Text>
              </View>
              <Text style={styles.infoValue}>HoopLog Team</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.aboutContainer}>
              <Icon
                icon="basketball"
                size={43}
                iconColor={Colors.orange}
                backgroundColor="transparent"
              />
              <Text style={styles.aboutDescription}>
                HoopLog helps basketball players track their progress, log
                workouts and games, and improve their performance one session at
                a time. Built by hoopers, for hoopers.
              </Text>
            </View>
            <View style={styles.inforow2}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.inforow2}
                onPress={handllogout}
              >
                <Icon
                  icon="logout"
                  size={43}
                  iconColor="red"
                  backgroundColor="transparent"
                />
                <Text style={styles.logout}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowResetModal(false)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <LottieView
                  source={require("../../assets/animations/Gears.json")}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
              </View>
              <View style={styles.warningBadge}>
                <Icon
                  icon="alert"
                  size={40}
                  iconColor="#FFFFFF"
                  backgroundColor="#EF4444"
                />
              </View>
            </View>

            <Text style={styles.modalTitle}>Reset All Data?</Text>
            <Text style={styles.modalDescription}>
              This will permanently delete all your:
            </Text>

            <View style={styles.deletionList}>
              <View style={styles.deletionItem}>
                <Icon
                  icon="basketball"
                  size={24}
                  iconColor={Colors.orange}
                  backgroundColor="transparent"
                />
                <Text style={styles.deletionText}>All workout sessions</Text>
              </View>
              <View style={styles.deletionItem}>
                <Icon
                  icon="chart-line"
                  size={24}
                  iconColor={Colors.orange}
                  backgroundColor="transparent"
                />
                <Text style={styles.deletionText}>Performance statistics</Text>
              </View>
              <View style={styles.deletionItem}>
                <Icon
                  icon="trophy"
                  size={24}
                  iconColor={Colors.orange}
                  backgroundColor="transparent"
                />
                <Text style={styles.deletionText}>Achievements & progress</Text>
              </View>
              <View style={styles.deletionItem}>
                <Icon
                  icon="account"
                  size={24}
                  iconColor={Colors.orange}
                  backgroundColor="transparent"
                />
                <Text style={styles.deletionText}>Personal preferences</Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Icon
                icon="alert-circle"
                size={20}
                iconColor="#DC2626"
                backgroundColor="transparent"
              />
              <Text style={styles.warningText}>
                This action cannot be undone!
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowResetModal(false)}
                activeOpacity={0.8}
              >
                <Icon
                  icon="close-circle"
                  size={24}
                  iconColor={Colors.darkblue}
                  backgroundColor="transparent"
                />
                <Text style={styles.cancelButtonText}>Keep My Data</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isResetting && styles.buttonDisabled,
                ]}
                onPress={confirmReset}
                activeOpacity={0.8}
                disabled={isResetting}
              >
                <Icon
                  icon="delete-forever"
                  size={24}
                  iconColor="#FFFFFF"
                  backgroundColor="transparent"
                />

                <Text style={styles.confirmButtonText}>
                  {isResetting ? "Deleting..." : "Delete Everything"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {workoutReminders && (
        <TouchableOpacity
          onPress={motivationonpress}
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
      {showmotivationalmodal && <Quotes onRequestClose={motivationonpress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#789ca9ff",
  },
  topborder: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerText: {
    fontSize: 21,
    color: Colors.orange,
    marginLeft: 16,
    fontFamily: fonts.secondary,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  avatarCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 30,
    marginBottom: 25,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarContainer: {
    alignItems: "center",
  },
  maintitle: {
    fontFamily: "primary",
    color: Colors.orange,
    fontSize: 28,
    textAlign: "center",
    marginTop: 10,
  },
  mainsubtitle: {
    fontFamily: fonts.secondary,
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.lightblue,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: fonts.secondary,
    marginLeft: 5,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  settingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  iconWrapper: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
    fontFamily: fonts.secondary,
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    fontFamily: fonts.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.darkblue,
    marginVertical: 16,
  },
  dangerCard: {
    backgroundColor: "#EF4444",
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerIconContainer: {
    marginRight: 15,
  },
  dangerTextContainer: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    fontFamily: fonts.secondary,
  },
  dangerDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.95)",
    fontFamily: fonts.secondary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: fonts.secondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.darkblue,
    fontFamily: fonts.secondary,
  },
  aboutContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 4,
  },
  aboutDescription: {
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
    fontFamily: fonts.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 30,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  modalIconContainer: {
    marginBottom: 10,
  },
  warningBadge: {
    position: "absolute",
    top: -5,
    right: "35%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: fonts.hoop,
  },
  modalDescription: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: fonts.secondary,
  },
  deletionList: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  deletionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  deletionText: {
    fontSize: 14,
    color: "#1F2937",
    fontFamily: fonts.secondary,
    flex: 1,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    fontFamily: fonts.secondary,
  },
  modalButtons: {
    gap: 12,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkblue,
    fontFamily: fonts.secondary,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: fonts.secondary,
  },
  logout: { color: "red", fontWeight: "bold", fontSize: 16 },
  inforow2: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    marginRight: 15,
    marginTop: 10,
  },
  motivationalicon: {
    left: 25,
    bottom: 40,
    position: "absolute",
  },
  motivationalouter: {
    borderWidth: 1,
    borderColor: Colors.orange,
    padding: 10,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 14,
    fontFamily: fonts.secondary,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  savingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.51)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    alignSelf: "flex-end",
    marginBottom: 10,
    width: "100%",
  },
  savingText: {
    fontSize: 18,
    color: Colors.orange,
    fontFamily: fonts.secondary,
    fontWeight: "600",
    textAlign: "center",
  },
});
