import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import Icon from "./Icon";

export const SearchAndFilter = ({
  sessions,
  onFilteredSessionsChange,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const types = [
    "All",
    "Shooting",
    "Dribbling Skills",
    "Defense",
    "Layup",
    "Physical Stamina",
    "Technical Skills",
  ];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredSessions = useMemo(() => {
    let filtered = Array.isArray(sessions) ? sessions : [];

    if (searchQuery.trim()) {
      filtered = filtered.filter((session) =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== "All") {
      filtered = filtered.filter((session) => session.type === selectedType);
    }

    if (selectedDifficulty !== "All") {
      filtered = filtered.filter(
        (session) => session.difficulty === selectedDifficulty
      );
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((session) => favorites.includes(session.id));
    }

    return filtered;
  }, [
    sessions,
    searchQuery,
    selectedType,
    selectedDifficulty,
    showFavoritesOnly,
    favorites,
  ]);

  useEffect(() => {
    onFilteredSessionsChange(filteredSessions);
  }, [filteredSessions, onFilteredSessionsChange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedDifficulty("All");
    setShowFavoritesOnly(false);
  };

  const activeFiltersCount =
    (selectedType !== "All" ? 1 : 0) +
    (selectedDifficulty !== "All" ? 1 : 0) +
    (showFavoritesOnly ? 1 : 0);

  // ... rest of your JSX stays the same

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon
            icon="magnify-plus-outline"
            size={35}
            iconColor="rgba(255,255,255,0.6)"
            backgroundColor="transparent"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sessions..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon
                icon="close"
                size={30}
                iconColor="rgba(255,255,255,0.6)"
                backgroundColor="transparent"
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon
            icon={
              showFilters || activeFiltersCount > 0
                ? "filter"
                : "filter-outline"
            }
            size={35}
            iconColor={Colors.white}
            backgroundColor="transparent"
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.favoriteButton,
            showFavoritesOnly && styles.favoriteButtonActive,
          ]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Icon
            icon={showFavoritesOnly ? "heart" : "heart"}
            size={20}
            iconColor={showFavoritesOnly ? Colors.orange : Colors.white}
            backgroundColor="transparent"
          />
        </TouchableOpacity>
      </View>

      {activeFiltersCount > 0 && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedType !== "All" && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>{selectedType}</Text>
                <TouchableOpacity onPress={() => setSelectedType("All")}>
                  <Icon
                    icon="close"
                    size={25}
                    iconColor={Colors.darkblue}
                    backgroundColor="transparent"
                  />
                </TouchableOpacity>
              </View>
            )}
            {selectedDifficulty !== "All" && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>{selectedDifficulty}</Text>
                <TouchableOpacity onPress={() => setSelectedDifficulty("All")}>
                  <Icon
                    icon="close"
                    size={25}
                    iconColor={Colors.darkblue}
                    backgroundColor="transparent"
                  />
                </TouchableOpacity>
              </View>
            )}
            {showFavoritesOnly && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Favorites</Text>
                <TouchableOpacity onPress={() => setShowFavoritesOnly(false)}>
                  <Icon
                    icon="close"
                    size={25}
                    iconColor={Colors.darkblue}
                    backgroundColor="transparent"
                  />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Sessions</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Icon
                  icon="close"
                  size={34}
                  iconColor={Colors.darkblue}
                  backgroundColor="transparent"
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Session Type</Text>
                <View style={styles.filterOptions}>
                  {types.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterOption,
                        selectedType === type && styles.filterOptionActive,
                      ]}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedType === type &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Difficulty</Text>
                <View style={styles.filterOptions}>
                  {difficulties.map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.filterOption,
                        selectedDifficulty === difficulty &&
                          styles.filterOptionActive,
                      ]}
                      onPress={() => setSelectedDifficulty(difficulty)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedDifficulty === difficulty &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        {difficulty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <View style={styles.favoritesToggleContainer}>
                  <View>
                    <Text style={styles.filterSectionTitle}>
                      Favorites Only
                    </Text>
                    <Text style={styles.favoritesSubtext}>
                      Show only sessions you've favorited
                    </Text>
                  </View>
                  {/* <TouchableOpacity
                    style={[
                      styles.toggleSwitch,
                      showFavoritesOnly && styles.toggleSwitchActive,
                    ]}
                    onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        {
                          transform: [
                            { translateX: showFavoritesOnly ? 20 : 2 },
                          ],
                        },
                      ]}
                    />
                  </TouchableOpacity> */}
                  <Switch
                    value={showFavoritesOnly}
                    onValueChange={(value) => {
                      setShowFavoritesOnly(!showFavoritesOnly);
                    }}
                    trackColor={{ false: "#E5E7EB", true: Colors.orange }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#E5E7EB"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    fontFamily: "secondary",
  },
  filterButton: {
    backgroundColor: Colors.orange,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.darkblue,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#789ca9",
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  favoriteButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonActive: {
    backgroundColor: Colors.white,
  },
  activeFilters: {
    marginTop: 12,
    flexDirection: "row",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  filterChipText: {
    color: Colors.darkblue,
    fontSize: 13,
    fontWeight: "600",
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
  },
  clearAllText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.darkblue,
    fontFamily: "anton",
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkblue,
    marginBottom: 12,
    fontFamily: "secondary",
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "transparent",
  },
  filterOptionActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  filterOptionText: {
    color: Colors.darkblue,
    fontSize: 14,
    fontWeight: "600",
  },
  filterOptionTextActive: {
    color: Colors.white,
  },
  favoritesToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favoritesSubtext: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0e0e0",
    padding: 2,
    justifyContent: "center",
  },
  toggleSwitchActive: {
    backgroundColor: Colors.orange,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: Colors.orange,
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SearchAndFilter;
