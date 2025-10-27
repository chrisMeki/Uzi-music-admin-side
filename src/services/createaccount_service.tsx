import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/auth"; 

const register = async (userData: any) => {
  try {
    // Map frontend formData to backend expected structure
    const payload = {
      userName: userData.userName,
      email: userData.email,
      password: userData.password,
      role: userData.role
    };

    const response = await axios.post(`${API_URL}/register`, payload, {
      headers: { "Content-Type": "application/json" }
    });

    return response.data;
  } catch (error: any) {
    console.error("Registration Axios error:", error.response?.data || error.message);
    throw error;
  }
};

const userService = { register };
export default userService;
