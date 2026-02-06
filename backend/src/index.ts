import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import workoutsRouter from './routes/workouts';
import resultsRouter from './routes/results';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/workouts', workoutsRouter);
app.use('/api/results', resultsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
