import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/artists";

// ✅ Get authentication token from admin login stored in localStorage
const getAuthHeader = () => {
  // Parse the login data
  const userLogin = localStorage.getItem("userLogin");
  let token = null;

  if (userLogin) {
    try {
      const parsed = JSON.parse(userLogin);
      token = parsed.token; // Get token from stored login data
    } catch (error) {
      console.error("Error parsing userLogin from localStorage:", error);
    }
  }

  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Create Artist
const create = async (artistData: any) => {
  const response = await axios.post(`${API_URL}`, artistData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Update Artist
const updateArtist = async (id: string, updateData: any) => {
  const response = await axios.put(`${API_URL}/${id}`, updateData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Delete Artist
const deleteArtist = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ✅ Get All Artists
const getAllArtists = async () => {
  const response = await axios.get(`${API_URL}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

const artistService = {
  create,
  updateArtist,
  deleteArtist,
  getAllArtists,
};

export default artistService;
