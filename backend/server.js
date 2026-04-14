import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import recoveryRoutes from './routes/recoveryRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.set('trust proxy', 1); // Necesario para que rate-limit funcione bien detrás de proxies (Render, Vercel)

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Main entry point for auth API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/recetas', recipeRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
