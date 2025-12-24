const mongoose = require('mongoose');
const { Schema } = mongoose;

// --- SOTTOSCHEMI (Mantenuti per modularità e pulizia) ---

const DecayMechanicSchema = new Schema({
  max_effective_uses: { type: Number, default: 1 }, 
  current_uses: { type: Number, default: 0 },
  exhausted_response_guide: { type: String }
}, { _id: false });

const PressureGateSchema = new Schema({
  required_evidence_list: [{ type: String }],
  pressure_cap: { type: Number },
  gate_response_guide: String
}, { _id: false });

const SemanticTriggerSchema = new Schema({
  concept_id: { type: String, required: true },
  description: String,
  examples: [{ type: String }],
  reaction_guide: String,
  
  unlocks: {
    characters: [{ type: String }],
    evidence: [{ type: String }]    
  },
  stat_mod: {
    pressure: { type: Number, default: 0 },
    force_state: String
  },

  decay_mechanic: DecayMechanicSchema,
  pressure_gate: PressureGateSchema 
}, { _id: false });

const EvidenceTriggerSchema = new Schema({
  evidence_id: { type: String, required: true },
  found: { type: Boolean, default: false },
  reaction_guide: String,
  stat_mod: {
    pressure: Number,
    force_state: String
  }
}, { _id: false });

// --- SCHEMA PRINCIPALE CHARACTER ---

const CharacterSchema = new Schema({
  _id: { type: String, required: true },
  
  // AGGIORNAMENTO: Inserito 'AVAILABLE' negli stati ammessi
  status: { 
    type: String, 
    enum: ['LOCKED', 'KNOWN', 'AVAILABLE'], 
    default: 'LOCKED' 
  },
  
  role: { 
    type: String, 
    enum: ['Suspect', 'Witness', 'Ally', 'Team_Expert'], 
    default: 'Suspect' 
  },

  name: { type: String, required: true },
  codename: String,
  case_id: { type: String, required: true },
  avatar_asset: String,

  linguistics: {
    primary_language: { type: String, default: 'it' },
    known_languages: [{ type: String }],
    unknown_language_reaction: { type: String }
  },

  profile: {
    background: String,
    personality_traits: [{ type: String }],
    fatal_flaw: String
  },

  state_metrics: {
    pressure_level: { type: Number, default: 0 },
    pressure_thresholds: {
      nervous: { type: Number, default: 40 },
      breaking_point: { type: Number, default: 90 }
    },
    sanity_integrity: { type: Number, default: 100 }
  },

  knowledge_base: {
    cover_story: {
      location: String,
      witness: String,
      activity: String,
      time_window: String
    },
    ground_truth: {
      location: String,
      action: String,
      motive: String,
      weapon: [{ type: String }], 
      mistake: String
    }
  },

  narrative_defense_logic: {
    level_1_denial: { condition: String, ai_instruction: String },
    level_2_cracks: { condition: String, ai_instruction: String },
    level_3_breakdown: { condition: String, ai_instruction: String }
  },

  interaction_triggers: {
    semantic_triggers: [SemanticTriggerSchema],
    evidence_presentation: [EvidenceTriggerSchema]
  },

  anti_tamper_protocol: {
    active: { type: Boolean, default: true },
    sensitivity_threshold: { type: Number, default: 0.8 },
    fallback_response: String
  }
}, { timestamps: true });

const Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;