import axios from "axios";
import Cookies from "js-cookie";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth` || "http://localhost:5000/auth";

export const registerUser = async ({ username, email, password }) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Registration failed");
  }
};

export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  Cookies.set("token", response.data.token);
  return response.data.user;
};

export const logoutUser = () => {
  Cookies.remove("token");
};
