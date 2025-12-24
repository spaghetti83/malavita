const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Sub-Schema per la singola prova (Evidence)
 */
const EvidenceItemSchema = new Schema({
  _id: { 
    type: String, 
    required: true 
  }, // Es: "ev_burnt_receipt"
  display_name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['PHYSICAL', 'DIGITAL', 'LAB_RESULT', 'TESTIMONY', 'WARRANT'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['LOCKED', 'AVAILABLE', 'ANALYZED', 'HIDDEN', 'UNLOCKED'], // Aggiunto UNLOCKED per coerenza
    default: 'LOCKED' 
  },
  // --- NUOVO CAMPO AGGIUNTO ---
  require: { 
    type: [String], 
    default: [] 
  }, // Array di stringhe che contiene gli ID necessari
  // ----------------------------
  description: { 
    type: String 
  },
  metadata: { 
    type: Schema.Types.Mixed, 
    default: {} 
  }
}, { _id: false });

/**
 * Sub-Schema per il singolo personaggio (Character)
 * Aggiunto per riflettere la struttura completa del tuo JSON
 */
const CharacterItemSchema = new Schema({
  _id: { type: String, required: true },
  ch_name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['LOCKED', 'UNLOCKED'], 
    default: 'LOCKED' 
  },
  require: { type: [String], default: [] }, // Array di stringhe per i prerequisiti
  description: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { _id: false });

/**
 * Schema Principale
 */
const CaseEvidenceSchema = new Schema({
  user_id: { 
    type: String, 
    required: true,
    index: true 
  },
  case_id: { 
    type: String, 
    required: true,
    index: true 
  },
  case_title: { 
    type: String, 
    required: true 
  },
  evidence_list: [EvidenceItemSchema],
  character_list: [CharacterItemSchema] // Inserito per supportare i personaggi del JSON
}, { 
  timestamps: true,
  collection: 'cases' 
});

// Indice composto per recuperare velocemente il progresso di un utente in un caso specifico
CaseEvidenceSchema.index({ user_id: 1, case_id: 1 }, { unique: true });

const CaseEvidence = mongoose.model('CaseEvidence', CaseEvidenceSchema);

module.exports = CaseEvidence;