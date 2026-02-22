import axios from "axios";

export default axios.create({
  // Point to your domain. Nginx handles the internal routing to port 8000.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api", 
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});