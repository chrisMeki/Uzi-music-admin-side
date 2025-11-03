// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddArtistForm from "./pages/addartist";
import AlbumManager from "./pages/addalbum";
import AddTracksScreen from "./pages/addtracks";
import AddGenreScreen from "./pages/genre";
import LoginScreen from "./pages/login";
import CreateAccountScreen from "./pages/createaccount";
import NewsManagement from "./pages/news";



function App() {
  return (
    
      <Router>
        <Routes>
          <Route path="/" element={<LoginScreen/>} />
          <Route path="/create" element={<CreateAccountScreen/>} />
          <Route path="/artist" element={<AddArtistForm/>} />
          <Route path="/albums" element={<AlbumManager/>} />
          <Route path="/tracks" element={<AddTracksScreen/>} />
          <Route path="/genre" element={<AddGenreScreen/>} />
          <Route path="/news" element={<NewsManagement/>} />
          
          
        </Routes>
      </Router>
   
  );
}

export default App;


