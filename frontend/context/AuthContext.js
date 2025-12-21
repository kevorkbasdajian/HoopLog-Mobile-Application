import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { apiCall, setLogoutCallback } from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [pendingAuth, setPendingAuth] = useState(null);
  const [settings, setSettings] = useState({
    motivationalQuotes: false,
    vibrationEffects: false,
  });

  useEffect(() => {
    restoreUser();
  }, []);

  useEffect(() => {
    setLogoutCallback(() => {
      setUserToken(null);
      setUser(null);
      setPendingAuth(null);
    });

    return () => {
      setLogoutCallback(null);
    };
  }, []);

  const restoreUser = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const userStr = await SecureStore.getItemAsync("user");

      if (token && userStr) {
        setUserToken(token);
        setUser(JSON.parse(userStr));
        await loadSettings();
      }
    } catch (error) {
      console.log("Error restoring user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const { token, user } = result.data;

      setPendingAuth({ token, user });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (fullName, email, password) => {
    try {
      const result = await apiCall("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const { token, user } = result.data;

      setPendingAuth({ token, user });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const completeAuth = async () => {
    if (!pendingAuth) return;

    try {
      await SecureStore.setItemAsync("userToken", pendingAuth.token);
      await SecureStore.setItemAsync("user", JSON.stringify(pendingAuth.user));

      setUserToken(pendingAuth.token);
      setUser(pendingAuth.user);
      setPendingAuth(null);
      await loadSettings();
    } catch (error) {
      console.log("Error completing auth:", error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("user");
      setUserToken(null);
      setUser(null);
      setPendingAuth(null);
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      const currentUser = await SecureStore.getItemAsync("user");
      const user = currentUser ? JSON.parse(currentUser) : {};

      const newUser = { ...user, ...updatedUserData };

      await SecureStore.setItemAsync("user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.log("Error updating user:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const result = await apiCall("/settings", {
        method: "GET",
      });

      if (result.success && result.data) {
        setSettings({
          motivationalQuotes: result.data.motivationalQuotes || false,
          vibrationEffects: result.data.vibrationEffects || false,
        });
      }
    } catch (error) {
      console.log("Error loading settings:", error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const result = await apiCall("/settings", {
        method: "PUT",
        body: JSON.stringify(newSettings),
      });

      if (result.success) {
        setSettings((prev) => ({ ...prev, ...newSettings }));
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.log("Error updating settings:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        user,
        pendingAuth,
        login,
        signup,
        logout,
        completeAuth,
        restoreUser,
        updateUser,
        updateSettings,
        settings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
