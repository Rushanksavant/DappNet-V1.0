import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './assets/main.css';
import App from './App';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import YourProfile from "./routes/YourProfile";
import YourActivity from "./routes/YourActivity";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="profile" element={<YourProfile />} />
        <Route path="activity" element={<YourActivity />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);