// src/auth/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Erreur parsing user data:", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log("📡 Tentative de connexion...");
      const response = await api.post("/auth/login/", credentials);
      console.log("✅ Réponse reçue:", response.status);
      
      const { access, refresh, user } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return { success: true };
    } catch (err) {
      console.error("❌ Erreur login:", err);
      
      let errorMessage = "Email ou mot de passe incorrect";
      if (err.response) {
        console.error("Détails:", err.response.data);
        errorMessage = err.response.data?.detail || 
                      err.response.data?.message || 
                      errorMessage;
      } else if (err.request) {
        errorMessage = "Le serveur ne répond pas";
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};