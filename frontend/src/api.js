import axios from "axios";

export default axios.create({
  baseURL: `https://swadeshfood.com/api`,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
