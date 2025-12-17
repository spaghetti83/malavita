const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sottoschema per tracciare i progressi di ogni singolo caso
const CaseProgressSchema = new Schema({
  case_id: { type: String, required: true }, // es: "case_101"
  status: { 
    type: String, 
    enum: ['LOCKED', 'UNLOCKED', 'COMPLETED'],
    default: 'LOCKED'
  },
  score: { type: Number, default: 0 },
  completed_at: Date
}, { _id: false });

const UserSchema = new Schema({
  // IDENTITÀ (Semplificata)
  // Per ora ci fidiamo: se il frontend dice "sono mario", il backend carica mario.
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },

  // CARRIERA
  detective_rank: { 
    type: String, 
    enum: ['ROOKIE', 'DETECTIVE', 'INSPECTOR', 'CHIEF'], 
    default: 'ROOKIE' 
  },
  
  // REGISTRO DEI CASI
  // Qui salviamo quali casi sono sbloccati per questo utente
  case_log: [CaseProgressSchema],

  created_at: { type: Date, default: Date.now },
  last_login: Date

});

// Helper per inizializzare un nuovo utente con il primo caso sbloccato
UserSchema.methods.initRookie = function() {
  this.case_log = [
    { case_id: 'case_101', status: 'UNLOCKED' } // Il primo caso è sempre aperto
  ];
};

const User = mongoose.model('User', UserSchema);
module.exports = User;