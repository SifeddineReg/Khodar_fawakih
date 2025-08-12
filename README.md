# خضر و فواكه (Khodar wa Fawakih)

A multiplayer Arabic word game similar to Scattergories, built with React, Node.js, and Socket.IO.

## 🎮 Game Overview

**خضر و فواكه** (Khodar wa Fawakih) is a fun multiplayer Arabic word game where players compete to come up with words starting with a specific Arabic letter across different categories.

### Game Rules:
- Server randomly picks an Arabic letter at the start of each round
- Players must write one word per category starting with that letter
- **Scoring:**
  - Unique correct answer: **10 points**
  - Correct but same as another player: **5 points**
  - Empty or invalid: **0 points**
- Game ends after a set number of rounds (default: 5)
- Player with the highest score wins!

### Categories:
- فواكه (Fruits)
- خضار (Vegetables)
- حيوان (Animals)
- بلد (Countries)
- جماد (Objects)
- لون (Colors)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd khodar_fawakih
   ```

2. **Quick Start (Recommended)**
   ```bash
   # This will install all dependencies and start both servers
   npm run dev
   ```
   
   **Or manually:**
   ```bash
   # Install all dependencies
   npm run install:all
   
   # Start both servers (in separate terminals)
   npm run dev:server  # Terminal 1
   npm run dev:client  # Terminal 2
   ```

3. **Server Information**
   - Backend will start on `http://localhost:3001`
   - Frontend will start on `http://localhost:3000`

4. **Open your browser**
   Navigate to `http://localhost:3000` to start playing!

## 🎯 How to Play

1. **Enter your name** and create a new room or join an existing one
2. **Wait for players** to join (minimum 2 players required)
3. **Host starts the game** when ready
4. **Each round:**
   - A random Arabic letter is displayed
   - Fill in one word per category starting with that letter
   - Submit before time runs out (default: 60 seconds)
5. **View results** and scores after each round
6. **Continue** until all rounds are completed
7. **Winner is announced** with final standings

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling with RTL support
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers

### Features
- ✅ **Real-time multiplayer** gameplay
- ✅ **Arabic text support** with proper RTL layout
- ✅ **Responsive design** for mobile and desktop
- ✅ **Private rooms** with password protection
- ✅ **Host controls** (kick players, configure settings)
- ✅ **Animated UI** with smooth transitions
- ✅ **Toast notifications** for game events
- ✅ **Arabic word validation** with proper character handling

## 📁 Project Structure

```
khodar_fawakih/
├── client/                 # Frontend React app
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── styles/         # CSS files
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                 # Backend Node.js app
│   ├── utils/              # Utility functions
│   ├── gameLogic.js        # Game logic and state management
│   ├── index.js           # Main server file
│   └── package.json
└── README.md
```

## 🎨 Customization

### Game Settings
The host can customize:
- **Round time** (30-120 seconds)
- **Number of rounds** (3-10 rounds)
- **Categories** (can be modified in `server/gameLogic.js`)

### Styling
- Colors and themes can be customized in `client/tailwind.config.js`
- Arabic font (Tajawal) is loaded from Google Fonts
- RTL support is built-in with PostCSS-RTL

## 🌐 Deployment

### Frontend (Vercel)
1. Build the project: `cd client && npm run build`
2. Deploy to Vercel or any static hosting service

### Backend (Render/Heroku)
1. Set environment variables:
   - `PORT` (optional, defaults to 3001)
2. Deploy to Render, Heroku, or any Node.js hosting service

### Environment Variables
```bash
# Backend
PORT=3001
NODE_ENV=production

# Frontend (update Socket.IO URL in production)
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Troubleshooting

### Common Issues

**Frontend won't start:**
- Make sure you're in the `client` directory
- Run `npm install` if dependencies are missing
- Check if port 3000 is available

**Backend won't start:**
- Make sure you're in the `server` directory
- Run `npm install` if dependencies are missing
- Check if port 3001 is available

**Connection issues:**
- Ensure both frontend and backend are running
- Check browser console for errors
- Verify Socket.IO connection in Network tab

**Arabic text issues:**
- Ensure your browser supports Arabic fonts
- Check if the Tajawal font is loading properly

## 🎉 Enjoy Playing!

Have fun playing خضر و فواكه with your friends! 🍎🥬

---

*Built with ❤️ for Arabic language learners and word game enthusiasts*
