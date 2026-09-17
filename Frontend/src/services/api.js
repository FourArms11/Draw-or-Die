import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getApiError = (error, fallbackMessage) => {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }

  if (error.request) {
    return new Error("Cannot connect to the backend. Start the Backend server and try again.");
  }

  return new Error(error.message || fallbackMessage);
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  } catch (error) {
    throw getApiError(error, "Registration failed");
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw getApiError(error, "Login failed");
  }
};

export default api;