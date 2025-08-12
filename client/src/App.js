import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './contexts/SocketContext';
import { GameProvider } from './contexts/GameContext';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import './App.css';

function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <Router>
          <div className="App min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lobby/:roomId" element={<Lobby />} />
              <Route path="/game/:roomId" element={<Game />} />
            </Routes>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  fontFamily: 'Tajawal, sans-serif',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </GameProvider>
    </SocketProvider>
  );
}

export default App;
