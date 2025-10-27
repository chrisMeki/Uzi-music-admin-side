import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/tracks";

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

// ✅ Create track
const create = async (trackData: any) => {
  const response = await axios.post(API_URL, trackData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Get all tracks
const getAll = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// ✅ Update track by ID
const update = async (id: string, trackData: any) => {
  const response = await axios.put(`${API_URL}/${id}`, trackData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Delete track by ID
const remove = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};

const trackService = {
  create,
  getAll,
  update,
  remove,
};

export default trackService;
