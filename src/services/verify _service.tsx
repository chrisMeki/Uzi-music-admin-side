import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/auth";

/**
 * Verify Email with OTP
 * @param userData { email: string; otp: string }
 */
const verifyEmail = async (userData: { email: string; otp: string }) => {
  try {
    const response = await axios.post(`${API_URL}/verify-email`, userData);

    if (response.data) {
      localStorage.setItem("emailVerification", JSON.stringify(response.data));
      console.log("Email verification response:", response.data);
    }

    return response.data;
  } catch (error: any) {
    console.error("Email verification failed:", error.response?.data || error.message);
    throw error.response?.data || { message: "Email verification failed" };
  }
};

/**
 * Resend OTP to user's email
 * @param userData { email: string }
 */
const resendOtp = async (userData: { email: string }) => {
  try {
    const response = await axios.post(`${API_URL}/resend-otp`, userData);

    if (response.data) {
      console.log("Resend OTP response:", response.data);
    }

    return response.data;
  } catch (error: any) {
    console.error("Resend OTP failed:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to resend OTP" };
  }
};

const verifyService = {
  verifyEmail,
  resendOtp,
};

export default verifyService;
