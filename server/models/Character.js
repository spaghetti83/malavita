
const mongoose = require('mongoose');
const { Schema } = mongoose;

// 1. SOTTO-SCHEMI (Per tenere pulito lo schema principale)

// Schema per lo stile vocale
const VoiceStyleSchema = new Schema({
  tone: String,
  quirks: [String] // Un array di stringhe
});

// Schema per la logica di difesa (i vari livelli)
const DefenseLevelSchema = new Schema({
  condition: String,
  ai_instruction: String
});

// Schema per i trigger di interazione (parole chiave)
const KeywordTriggerSchema = new Schema({
  words: [String],
  reaction: String,
  stat_mod: {
    pressure: Number // Modifica la pressione (es. -10 o +15)
  }
});

// Schema per le reazioni alle prove
const EvidenceReactionSchema = new Schema({
  evidence_id: String,
  reaction: String,
  stat_mod: {
    pressure: Number,
    force_state: String // Opzionale, es. "level_3_breakdown"
  }
});

// 2. SCHEMA PRINCIPALE DEL PERSONAGGIO

const SuspectSchema = new Schema({
  meta: {
    id: { type: String, required: true, unique: true }, // ID univoco importante
    name: String,
    codename: String,
    role: String,
    archetype: String,
    is_hostile: Boolean,
    avatar_asset: String
  },

  linguistics: {
    primary_language: String,
    known_languages: [String],
    proficiency: {
      it: String,
      zh: String,
      en: String
    },
    unknown_language_reaction: {
      behavior: String,
      response_guide: String
    }
  },

  profile: {
    background: String,
    personality_traits: [String], // Array di tratti caratteriali
    voice_style: VoiceStyleSchema, // Usiamo il sotto-schema definito sopra
    fatal_flaw: String
  },

  state_metrics: {
    pressure_level: { type: Number, default: 0 },
    pressure_thresholds: {
      nervous: Number,
      breaking_point: Number
    },
    sanity_integrity: Number
  },

  knowledge_base: {
    cover_story: {
      location: String,
      witness: String,
      activity: String,
      time_window: String
    },
    ground_truth: {
      location_afternoon: String,
      location_night: String,
      action: String,
      weapon: String,
      mistake: String
    }
  },

  narrative_defense_logic: {
    level_1_denial: DefenseLevelSchema,
    level_2_cracks: DefenseLevelSchema,
    level_3_breakdown: DefenseLevelSchema
  },

  interaction_triggers: {
    keywords: [KeywordTriggerSchema], // Una lista di trigger basati su parole
    evidence_reactions: [EvidenceReactionSchema] // Una lista di reazioni alle prove
  },

  anti_tamper_protocol: {
    active: Boolean,
    response_mode: String,
    triggers: [String],
    fallback_response: String
  }
});

// Creazione del Modello
const Suspect = mongoose.model('Suspect', SuspectSchema);

module.exports = Suspect;