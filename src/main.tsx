import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

// Set up axios base URL for API calls
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

createRoot(document.getElementById("root")!).render(<App />);
