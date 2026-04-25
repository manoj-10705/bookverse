import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://bookverse-1-tp4m.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
