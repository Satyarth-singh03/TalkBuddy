const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://talk-buddy-pink.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

const chatRoute = require('./routes/chat');
app.use('/api/chat', chatRoute);

app.get('/', (req, res) => {
  res.json({ message: 'TalkBuddy server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on ${PORT}`);
});

