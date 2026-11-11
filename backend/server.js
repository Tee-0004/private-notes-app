// Load environment variables first
import 'dotenv/config';

// Import required packages
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import notesRoutes from './routes/notesRoutes.js';

// Initialise Express application
const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
    ],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Private Notes API is running!');
});

// Server port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});