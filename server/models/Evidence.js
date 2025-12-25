const mongoose = require('mongoose');
const { Schema } = mongoose;

const EvidenceSchema = new Schema({
  // Reference to the specific player who owns this instance of the evidence
  user_id: { type: String, required: true },
  
  // The unique ID for the evidence template (e.g., "ev_blood_stain_01")
  evidence_id: { type: String, required: true }, 

  // Linking the evidence to a specific case
  case_id: { type: String, required: true }, 
  
  display_name: { type: String, required: true },
  description: { type: String, required: true },
  
  type: { 
    type: String, 
    enum: ['PHYSICAL', 'DIGITAL', 'TESTIMONY', 'DOCUMENT', 'FORENSIC'],
    required: true 
  },

  status: {
    is_found: { type: Boolean, default: false },
    found_at: { type: Date },
    found_location: { type: String }
  },

  // Integration with the Expert Team (Chemistry, Hacker, etc.)
  analysis: {
    requires_expert: { type: Boolean, default: false },
    target_expert: { 
      type: String, 
      enum: ['LAB_EXPERT', 'FORENSIC_EXPERT', 'HACKER', 'STREET_INFORMANT', 'CHIEF'],
      required: function() { return this.analysis.requires_expert; }
    },
    is_analyzed: { type: Boolean, default: false },
    expert_report: { type: String }, // The text revealed to the player after analysis
    unlocked_concepts: [{ type: String }] // IDs for new semantic triggers unlocked by this evidence
  },

  metadata: {
    image_asset: String,
    is_crucial: { type: Boolean, default: false } // If this is a "smoking gun" needed to solve the case
  }
}, { timestamps: true });

// Compound index to optimize finding a specific player's evidence for a specific case
EvidenceSchema.index({ user_id: 1, case_id: 1 });

const Evidence = mongoose.model('Evidence', EvidenceSchema);
module.exports = Evidence;