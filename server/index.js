
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Character = require('./models/Character');
const path = require('path')
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const { MONGODB_USR, MONGODB_PSW } = process.env;
console.log(MONGODB_USR,MONGODB_PSW)
// Middleware
app.use(cors()); 
app.use(express.json()); 

// MONGODB connection
const mongoURI = `mongodb+srv://${MONGODB_USR}:${MONGODB_PSW}@cluster0.fxumk9v.mongodb.net/malavita`

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Error DB:', err));

// --- ROTTE API ---

//LOAD SELECTED CHARACTER
app.get('/character/:id',async (req,res) =>{
    const id = req.params.id
    console.log("ID",req.params.id)
    try{
        const char = await Character.findOne({'_id' : id})
         console.log("found data for ", id)
        
        if(!char){ 
            console.log("no character found!")
            return res.status(404).send("no character found!");
        }
        const promptPath = path.join(__dirname, 'data/logic/', 'semantic_analyzer_prompt.md');
        const promptContent = fs.readFileSync(promptPath, 'utf8');
        promptContent ? console.log('loaded file') : console.log('not loaded')
        res.send({character: char,prompt: promptContent})
    }catch(error){
        console.log(error)
    }
})


app.post('/pressure', async (req, res) => {
    console.log("server ---> pressure...")
    try{
        const char = await Character.findOne({'_id' : 'char_chen_101'})
        if(!char){
            console.log("no character found!")
            return res.status(404).send("Personaggio non trovato nel database!");
        }
        
        char.state_metrics.pressure_level = req.body.pressure
        await char.save()
        res.send({message: "pressure correctly saved"})
    }catch(error){
        console.error(error);
        res.status(500).send('Errore: ' + error.message);
    }
    
});
app.get('/getKeywords', async (req, res) => {
    try{
        const char = await Character.findOne({'meta.id' : 'char_chen_101'})
        if(!char){
            console.log("no character found!")
            return res.status(404).send("Personaggio non trovato nel database!");
        }
        const keywords = char.interaction_triggers.keywords
        console.log("keywords", keywords)
        res.send({message: keywords})
    }catch(error){
        console.error(error);
        res.status(500).send('Errore: ' + error.message);
    }
    
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server attivo su porta ${PORT}`));