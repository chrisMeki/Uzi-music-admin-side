import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/albums";

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

// ✅ Get All Albums
const getAllAlbums = async () => {
  const response = await axios.get(`${API_URL}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ✅ Create Album
const createAlbum = async (albumData: any) => {
  const response = await axios.post(`${API_URL}`, albumData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Update Album
const updateAlbum = async (id: string, updateData: any) => {
  const response = await axios.put(`${API_URL}/${id}`, updateData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// ✅ Delete Album
const deleteAlbum = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ✅ Add Plaque to Album
const addPlaque = async (id: string, plaqueData: any) => {
  const response = await axios.post(
    `${API_URL}/${id}/plaques`,
    plaqueData,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    }
  );
  return response.data;
};

// ✅ Update Plaque by Index
const updatePlaque = async (
  id: string,
  plaqueIndex: number,
  updateData: any
) => {
  const response = await axios.put(
    `${API_URL}/${id}/plaques/${plaqueIndex}`,
    updateData,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    }
  );
  return response.data;
};

// ✅ Delete Plaque by Index
const deletePlaque = async (id: string, plaqueIndex: number) => {
  const response = await axios.delete(
    `${API_URL}/${id}/plaques/${plaqueIndex}`,
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

const albumService = {
  getAllAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addPlaque,
  updatePlaque,
  deletePlaque,
};

export default albumService;
