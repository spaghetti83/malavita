const mongoose = require('mongoose');
const { Schema } = mongoose;

// 1. Definiamo lo schema per le condizioni di sblocco (Unlock Condition)
// Questo è un sotto-documento che useremo dentro lo schema principale.
const UnlockConditionSchema = new Schema({
  previous_case: {
    type: String,
    ref: 'Case' // Questo aiuta se in futuro vorrai collegare i casi tra loro
  },
  min_reputation: {
    type: Number,
    min: 0 // La reputazione non può essere negativa
  },
  special_skill: {
    type: String
  }
}, { _id: false }); // Non serve un ID univoco per questo piccolo oggetto interno

// 2. Definiamo lo schema principale del Caso (Case)
const CaseSchema = new Schema({
  // L'ID personalizzato che usi tu (es. "case_101")
  id: { 
    type: String, 
    required: true, 
    unique: true // Assicura che non ci siano due casi con lo stesso ID
  },
  
  display_title: { 
    type: String, 
    required: true 
  },
  
  folder_path: { 
    type: String, 
    required: true 
  },
  
  // Usiamo un ENUM per limitare i valori possibili
  difficulty: { 
    type: String, 
    enum: ['EASY', 'MEDIUM', 'HARD'], 
    default: 'EASY'
  },
  
  status: { 
    type: String, 
    enum: ['LOCKED', 'UNLOCKED', 'COMPLETED'], 
    default: 'LOCKED'
  },
  
  description: { 
    type: String, 
    required: true 
  },
  
  // Un array di stringhe semplice
  tags: [String],
  
  // Qui inseriamo lo schema secondario creato sopra
  unlock_condition: UnlockConditionSchema,

  // Aggiungo campi utili per la gestione del database (data creazione/modifica)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 3. Creiamo il Modello
const CaseModel = mongoose.model('Case', CaseSchema);

module.exports = CaseModel;