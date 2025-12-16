const mongoose = require('mongoose');
const { Schema } = mongoose;

// 1. Sottoschema: Linguistica
const LinguisticsSchema = new Schema({
  primary_language: { type: String, required: true },
  known_languages: [{ type: String }], // Array di stringhe
  proficiency: { type: Map, of: String }, // Gestisce chiavi dinamiche come "it", "zh"
  unknown_language_reaction: {
    behavior: String,
    response_guide: String
  }
}, { _id: false });

// 2. Sottoschema: Meccanica di Decadimento (Decay Mechanic)
const DecayMechanicSchema = new Schema({
  max_effective_uses: { type: Number, default: 1 }, 
  current_uses: { type: Number, default: 0 },
  exhausted_response_guide: { type: String }
}, { _id: false });

// 3. Sottoschema: Trigger Semantici
const SemanticTriggerSchema = new Schema({
  concept_id: { type: String, required: true },
  description: String,
  examples: [{ type: String }],
  reaction_guide: String,
  
  // Stat Modificatori
  stat_mod: {
    pressure: { type: Number, default: 0 },
    force_state: String
  },

  // Qui includiamo lo schema corretto per il decay
  decay_mechanic: DecayMechanicSchema 
}, { _id: false });

// 4. Sottoschema: Presentazione Prove
const EvidenceTriggerSchema = new Schema({
  evidence_id: { type: String, required: true },
  found: { type: Boolean, default: false }, // Aggiunto basandosi sul JSON
  reaction_guide: String,
  stat_mod: {
    pressure: Number,
    force_state: String
  }
}, { _id: false });

// 5. Schema Principale Character
const CharacterSchema = new Schema({
  // _id gestito manualmente come stringa ("char_chen_101")
  _id: { type: String, required: true }, 
  
  name: { type: String, required: true },
  codename: String,
  role: { type: String, enum: ['Suspect', 'Witness', 'Ally'], required: true },
  archetype: String,
  is_hostile: { type: Boolean, default: false },
  
  // NUOVO CAMPO: Case ID per associare il personaggio al caso specifico
  case_id: { type: String, required: true }, 

  avatar_asset: String,

  // Constraints narrativi (System Instructions)
  narrative_constraints: {
    strict_rules: [{ type: String }]
  },

  linguistics: LinguisticsSchema,

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
      // Aggiornato ad Array di Stringhe come da JSON (che ne ha 3)
      weapon: [{ type: String }], 
      mistake: String
    }
  },

  narrative_defense_logic: {
    level_1_denial: {
      condition: String,
      ai_instruction: String
    },
    level_2_cracks: {
      condition: String,
      ai_instruction: String
    },
    level_3_breakdown: {
      condition: String,
      ai_instruction: String
    }
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

}, { timestamps: true }); // Opzionale: aggiunge createdAt e updatedAt

const Character = mongoose.model('Character', CharacterSchema);

module.exports = Character;