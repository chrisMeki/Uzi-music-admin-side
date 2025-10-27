import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/genres";

// ✅ Get authentication token from admin login stored in localStorage
const getAuthHeader = () => {
  const userLogin = localStorage.getItem("userLogin");
  let token = null;

  if (userLogin) {
    try {
      const parsed = JSON.parse(userLogin);
      token = parsed.token;
    } catch (error) {
      console.error("Error parsing userLogin from localStorage:", error);
    }
  }

  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Get All Genres
const getAllGenres = async () => {
  const response = await axios.get(`${API_URL}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

const genreService = {
  getAllGenres,
};

export default genreService;
