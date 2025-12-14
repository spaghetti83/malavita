const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sottoschema per la linguistica
const LinguisticsSchema = new Schema({
  primary_language: { type: String, required: true },
  known_languages: [{ type: String }],
  proficiency: { type: Map, of: String }, // Mappa flessibile: "it": "Fluent..."
  unknown_language_reaction: {
    behavior: String,
    response_guide: String
  }
});

// Sottoschema per i trigger semantici (Il cuore della logica)
const SemanticTriggerSchema = new Schema({
  concept_id: { type: String, required: true },
  description: String,
  examples: [{ type: String }],
  reaction_guide: String,
  stat_mod: {
    pressure: { type: Number, default: 0 },
    force_state: String
  }
});

// Schema Principale del Personaggio
const CharacterSchema = new Schema({
  _id: { type: String, required: true }, // Es: "char_chen_101"
  name: { type: String, required: true },
  codename: String,
  role: { type: String, enum: ['Suspect', 'Witness', 'Ally'], required: true },
  archetype: String,
  is_hostile: { type: Boolean, default: false },
  avatar_asset: String,

  // Moduli Logici
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
      weapon: [{ type: String }], // Array per gestire più componenti (sveglia, acetone...)
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
    evidence_presentation: [{
      evidence_id: String,
      reaction_guide: String,
      stat_mod: {
        pressure: Number,
        force_state: String
      }
    }]
  },

  anti_tamper_protocol: {
    active: { type: Boolean, default: true },
    sensitivity_threshold: { type: Number, default: 0.8 },
    fallback_response: String
  }
}, { _id: false }); // _id è gestito manualmente come stringa, non ObjectId automatico

const Character = mongoose.model('Character', CharacterSchema);

module.exports = Character;