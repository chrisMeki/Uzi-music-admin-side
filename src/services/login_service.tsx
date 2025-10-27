import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/auth";

// Login
const login = async (userData: { email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/login`, userData);

  if (response.data) {
    // Store the entire user data
    localStorage.setItem("userLogin", JSON.stringify(response.data));

    // Store token separately
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    // Store user info separately
    if (response.data.user) {
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
    }

    // Log to console
    console.log("Full login data:", response.data);
    console.log("Token:", response.data.token);
    console.log("User info:", response.data.user);
  }

  return response.data;
};

const userService = {
  login,
};

export default userService;
