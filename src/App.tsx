// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddArtistForm from "./pages/addartist";
import AlbumManager from "./pages/addalbum";
import AddTracksScreen from "./pages/addtracks";
import AddGenreScreen from "./pages/genre";



function App() {
  return (
    
      <Router>
        <Routes>
          <Route path="/" element={<AddArtistForm/>} />
          <Route path="/albums" element={<AlbumManager/>} />
          <Route path="/tracks" element={<AddTracksScreen/>} />
          <Route path="/genre" element={<AddGenreScreen/>} />
          
          
        </Routes>
      </Router>
   
  );
}

export default App;


