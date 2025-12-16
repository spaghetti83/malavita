const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sottoschema per un singolo caso dentro la lista
const CaseEntrySchema = new Schema({
  id: { type: String, required: true }, // es: "case_101"
  display_title: { type: String, required: true },
  folder_path: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'],
    default: 'EASY'
  },
  status: { 
    type: String, 
    enum: ['LOCKED', 'UNLOCKED', 'COMPLETED'],
    default: 'LOCKED'
  },
  description: { type: String, required: true },
  tags: [{ type: String }], // es: ["Arson", "Triad"]
  
  // Condizioni di sblocco opzionali
  unlock_condition: {
    previous_case: String, // ID del caso precedente richiesto
    min_reputation: Number, // (Se lo rimetti in futuro)
    special_skill: String   // (Se lo rimetti in futuro)
  }
});

// Schema Principale della Lista Casi
// Questo riflette l'intero file cases_list.json
const CaseListSchema = new Schema({
  id_file: { type: String, required: true, unique: true }, // "master_cases_list"
  user_id: { type: String, required: true }, // Link all'utente (es. "user_12345")
  registry_version: { type: String, default: "1.0" },
  
  // L'array che contiene tutti i casi
  available_cases: [CaseEntrySchema]
});

const CaseList = mongoose.model('Case', CaseListSchema);

module.exports = CaseList;