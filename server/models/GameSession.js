const mongoose = require('mongoose');
const { Schema } = mongoose;



const GameSessionSchema = new Schema({
  // Identificatori univoci della sessione
  user_id: { type: String, required: true, index: true }, // Chi sta giocando
  case_id: { type: String, required: true }, // Quale caso (es: "case_101_omicidio_porto")
  
  // Stato generale della partita
  status: { 
    type: String, 
    enum: ['ACTIVE', 'SOLVED', 'FAILED', 'ARCHIVED'],
    default: 'ACTIVE' 
  },

  // Il Team di supporto scelto dall'utente (es. ['medico_legale', 'hacker'])
  active_team: [{ type: String }],

  // ROSTER: Personaggi sbloccati/conosciuti durante l'indagine
  known_characters: [{ 
    char_id: { type: String, required: true }, // ID del personaggio (es: "char_lijun_102")
    unlocked_at: { type: Date, default: Date.now },
    trigger_source: String // Chi o cosa ha sbloccato questo personaggio (es: "Menzionato da Chen")
  }],

  // PROVE: Inventario degli indizi raccolti
  evidence_locker: [{
    evidence_id: { type: String, required: true }, // ID della prova (es: "ev_pistola_fumante")
    status: { 
      type: String, 
      enum: ['UNKNOWN', 'KNOWN', 'ANALYZED', 'SUBMITTED'], 
      default: 'KNOWN' 
    },
    found_at: { type: Date, default: Date.now }
  }],

  // LOGICA CONVERSAZIONALE: Memoria a breve/lungo termine per l'AI
  // Utile per non dover ricaricare tutto lo storico ogni volta, o per salvare il contesto
  interaction_history: [{
    npc_id: String,       // Con chi stavi parlando
    topic_triggered: String, // Quale argomento è stato toccato (concept_id)
    timestamp: { type: Date, default: Date.now }
  }]

}, { timestamps: true }); // Aggiunge automaticamente createdAt e updatedAt

// Indice composto: un utente può avere una sola sessione attiva per un determinato caso (opzionale)
GameSessionSchema.index({ user_id: 1, case_id: 1 },{ unique: true });

const GameSession = mongoose.model('GameSession', GameSessionSchema);

module.exports = GameSession;