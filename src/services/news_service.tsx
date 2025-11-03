import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/news";

// ✅ Get authentication token from admin login stored in localStorage
const getAuthHeader = () => {
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

// ✅ Create News
const createNews = async (newsData: {
  image: string;
  title: string;
  description: string;
  category: string;
  expires_at: string;
  is_published: boolean;
}) => {
  const response = await axios.post(`${API_URL}`, newsData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Update News
const updateNews = async (
  id: string,
  updateData: {
    image?: string;
    title?: string;
    description?: string;
    category?: string;
    expires_at?: string;
    is_published?: boolean;
  }
) => {
  const response = await axios.put(`${API_URL}/${id}`, updateData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Delete News
const deleteNews = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ✅ Get All News
const getAllNews = async () => {
  const response = await axios.get(`${API_URL}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

const newsService = {
  createNews,
  updateNews,
  deleteNews,
  getAllNews,
};

export default newsService;
