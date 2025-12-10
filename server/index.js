require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Character = require('./models/Character');

const app = express();

// Middleware
app.use(cors()); // Permette a React (localhost:5173) di parlare con Node (localhost:5000)
app.use(express.json()); // Permette di leggere i body JSON delle richieste

// Connessione al DB (MongoDB Atlas o locale)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rpg_game')
  .then(() => console.log('✅ MongoDB Connesso'))
  .catch(err => console.error('❌ Errore DB:', err));

// --- ROTTE API ---

// 1. GET: Scarica tutti i personaggi per la tua lista
app.get('/api/characters', async (req, res) => {
  try {
    const chars = await Character.find();
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Importa/Crea un nuovo personaggio (quello dal tuo JSON!)
app.post('/api/characters', async (req, res) => {
  try {
    const newChar = new Character(req.body);
    const savedChar = await newChar.save();
    res.status(201).json(savedChar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. PUT: Aggiorna lo stato del personaggio (es. aumenta pressure_level)
app.put('/api/characters/:id', async (req, res) => {
  try {
    const updated = await Character.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Restituisce l'oggetto aggiornato
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server attivo su porta ${PORT}`));