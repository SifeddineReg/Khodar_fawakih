# 🚀 Deployment Guide

This guide will help you deploy the خضر و فواكه (Khodar wa Fawakih) game to production.

## 📋 Prerequisites

- A GitHub/GitLab account
- A Netlify account (free tier available)
- A backend hosting service (Render, Heroku, Railway, etc.)

## 🎯 Deployment Steps

### 1. Backend Deployment (Choose One)

#### Option A: Render (Recommended - Free Tier)
1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your repository**
4. **Configure the service:**
   - **Name**: `khodar-fawakih-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT`: `10000` (or leave empty for auto-assignment)
     - `NODE_ENV`: `production`
5. **Deploy** and note the URL (e.g., `https://your-app.onrender.com`)

#### Option B: Railway
1. **Sign up** at [railway.app](https://railway.app)
2. **Create a new project**
3. **Deploy from GitHub**
4. **Set the root directory** to `server`
5. **Add environment variables** as needed

#### Option C: Heroku
1. **Sign up** at [heroku.com](https://heroku.com)
2. **Create a new app**
3. **Connect your repository**
4. **Set buildpacks** to Node.js
5. **Deploy** and note the URL

### 2. Frontend Deployment (Netlify)

#### Step 1: Prepare the Frontend
1. **Update environment variables** in `client/env.production`:
   ```bash
   REACT_APP_SOCKET_URL=https://your-backend-url.com
   REACT_APP_API_URL=https://your-backend-url.com
   ```
2. **Rename** `client/env.production` to `client/.env.production`

#### Step 2: Deploy to Netlify
1. **Sign up** at [netlify.com](https://netlify.com)
2. **Click "New site from Git"**
3. **Connect your repository**
4. **Configure the build settings:**
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
5. **Add environment variables** in Netlify dashboard:
   - `REACT_APP_SOCKET_URL`: `https://your-backend-url.com`
   - `REACT_APP_API_URL`: `https://your-backend-url.com`
6. **Deploy**

### 3. Update CORS Settings

After deploying the backend, update the CORS configuration in `server/index.js`:

```javascript
app.use(cors({ 
  origin: ["https://your-netlify-app.netlify.app", "http://localhost:3000"], 
  credentials: true 
}));
```

And update the Socket.IO CORS settings:

```javascript
const io = socketIo(server, {
  cors: {
    origin: ["https://your-netlify-app.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});
```

## 🔧 Environment Variables

### Backend (.env)
```bash
PORT=10000
NODE_ENV=production
```

### Frontend (.env.production)
```bash
REACT_APP_SOCKET_URL=https://your-backend-url.com
REACT_APP_API_URL=https://your-backend-url.com
```

## 🌐 Custom Domain (Optional)

### Netlify Custom Domain
1. **Go to** Site settings > Domain management
2. **Add custom domain**
3. **Configure DNS** as instructed
4. **Enable HTTPS** (automatic with Netlify)

### Backend Custom Domain
- **Render**: Add custom domain in dashboard
- **Railway**: Configure in project settings
- **Heroku**: Use Heroku CLI or dashboard

## 🔍 Testing Your Deployment

1. **Test the backend**:
   ```bash
   curl https://your-backend-url.com/health
   ```

2. **Test the frontend**:
   - Open your Netlify URL
   - Check browser console for connection errors
   - Test creating a room and joining

3. **Test multiplayer**:
   - Open the game in two different browsers/incognito windows
   - Create a room in one
   - Join with the room ID in the other

## 🐛 Troubleshooting

### Common Issues

**Frontend can't connect to backend:**
- Check CORS settings in backend
- Verify environment variables are set correctly
- Check browser console for connection errors

**Backend deployment fails:**
- Ensure `package.json` has correct start script
- Check if all dependencies are in `dependencies` (not `devDependencies`)
- Verify Node.js version compatibility

**Socket.IO connection issues:**
- Ensure WebSocket is enabled on your hosting provider
- Check if the backend URL is accessible
- Verify CORS settings include your frontend domain

### Debug Commands

```bash
# Test backend health
curl https://your-backend-url.com/health

# Check environment variables
echo $REACT_APP_SOCKET_URL

# Test local build
cd client && npm run build
```

## 📊 Performance Optimization

### Frontend
- Enable gzip compression in Netlify
- Use CDN for static assets
- Optimize images and fonts

### Backend
- Enable compression middleware
- Use connection pooling for database (if added later)
- Monitor memory usage

## 🔒 Security Considerations

- Use HTTPS for all connections
- Set up proper CORS policies
- Consider rate limiting for the backend
- Validate all user inputs
- Use environment variables for sensitive data

## 🎉 Success!

Once deployed, your game will be accessible at:
- **Frontend**: `https://your-app.netlify.app`
- **Backend**: `https://your-backend-url.com`

Share the frontend URL with friends to start playing! 🍎🥬
