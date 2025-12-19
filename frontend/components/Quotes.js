import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import Icon from "./Icon";
import { apiCall } from "../config/api";
import * as SecureStore from "expo-secure-store";

function Quotes({ onRequestClose }) {
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRandomQuote();
  }, []);

  const getRandomQuote = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await SecureStore.getItemAsync("userToken");

      const result = await apiCall("/quote/random", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch quote");
      }

      // Set the quote from API response
      // Assuming the backend returns: { id, quote, owner, createdAt }
      setQuote({
        quote: result.data.quote,
        Owner: result.data.author,
      });
    } catch (err) {
      console.log("Error fetching quote:", err);
      setError("Failed to load quote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        console.log("Setting false");
        onRequestClose(false);
      }}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => onRequestClose(false)}
      >
        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: Colors.orange,
              paddingInline: 15,
              paddingBlock: 20,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => onRequestClose(false)}
            activeOpacity={0.5}
            style={{
              height: 50,
              width: 50,
              alignSelf: "flex-end",
              marginBottom: 7,
              marginRight: 0,
            }}
          >
            <Icon
              icon="close"
              size={50}
              backgroundColor="transparent"
              iconColor="white"
            />
          </TouchableOpacity>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.white} />
              <Text style={styles.loadingText}>Loading quote...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon
                icon="alert-circle"
                size={60}
                backgroundColor="transparent"
                iconColor="white"
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={getRandomQuote}
                activeOpacity={0.7}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : quote ? (
            <View style={styles.motivationalinner}>
              <View style={{ alignSelf: "flex-start" }}>
                <Icon
                  icon="format-quote-open"
                  iconColor="black"
                  size={70}
                  backgroundColor="transparent"
                />
              </View>
              <Text style={styles.motquote}>{quote.quote}</Text>
              <View style={styles.quotesubtitle}>
                <Text style={styles.quoteowner}>- {quote.Owner}</Text>
              </View>

              <View style={{ alignSelf: "flex-end" }}>
                <Icon
                  icon="format-quote-close"
                  iconColor="black"
                  size={60}
                  backgroundColor="transparent"
                />
              </View>
              <View
                style={{
                  borderWidth: 0.6,
                  borderColor: "black",
                  width: "60%",
                  marginBottom: 20,
                }}
              />

              {/* Optional: Add a button to get a new quote */}
              <TouchableOpacity
                style={styles.newQuoteButton}
                onPress={getRandomQuote}
                activeOpacity={0.7}
              >
                <Icon
                  icon="refresh"
                  size={24}
                  backgroundColor="transparent"
                  iconColor="white"
                />
                <Text style={styles.newQuoteButtonText}>New Quote</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  motivationalinner: {
    borderRadius: 15,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    borderColor: Colors.white,
    borderWidth: 1,
  },
  motquote: {
    paddingInline: 25,
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.5,
    lineHeight: 30,
  },
  quoteowner: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFACD",
    textAlign: "right",
    marginTop: 20,
    fontStyle: "normal",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.white,
    fontWeight: "600",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.white,
    textAlign: "center",
    fontWeight: "600",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  newQuoteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  newQuoteButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Quotes;
