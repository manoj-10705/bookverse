import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

// Use environment variable for API base URL, fallback to localhost for dev
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Attach JWT token to every request if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

createRoot(document.getElementById("root")!).render(<App />);
