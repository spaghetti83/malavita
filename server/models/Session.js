const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionSchema = new Schema({
    user: { 
        type: String, 
        required: true,
        trim: true 
    },
    userId: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
   
    activeCase: {
        caseId: { 
            type: String, 
            default: null
        },
        caseTitle: { 
            type: String 
        },
        startedAt: { 
            type: Date 
        }
    },
    lastActive: { 
        type: Date, 
        default: Date.now 
    },
    isDeveloper: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;