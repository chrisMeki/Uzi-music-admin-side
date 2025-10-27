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

// ✅ Create genre
const create = async (genreData: any) => {
  const response = await axios.post(API_URL, genreData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Get all genres
const getAll = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// ✅ Update genre by ID
const update = async (id: string, genreData: any) => {
  const response = await axios.put(`${API_URL}/${id}`, genreData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Delete genre by ID
const remove = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};

const genreService = {
  create,
  getAll,
  update,
  remove,
};

export default genreService;
