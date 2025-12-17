const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Character = require('./models/Character');
const CaseModel = require('./models/Cases_list')
const path = require('path')
const fs = require('fs');
const { stripVTControlCharacters } = require('util');

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

const characterListCheck = async (req,res,next) =>{
    console.log("charater list middleware...")
   const filter = req.params.filter
   console.log()
    try {
        const characters = await Character.find({'case_id': filter})
        if (!characters){
            console.log("cases list not found in the db")
            next()
        }else{
            console.log("cases list correctly loadede")
            res.send({ characterList: characters})
        }
        
    }catch(error){
        console.log(error)
    }
}

app.get('/characterList/:filter',characterListCheck, async (req,res) =>{
     const folder = path.join( __dirname , './data/characters/')
    console.log(folder)
    fs.readdir(folder , (err,files)=>{

        if(err){
            console.log("can't load the character list, sorry!")
            return res.send({message: "can't load the character list, sorry!"})
        }
        console.log(files)
        res.json(files)
    })
})

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

const casesListCheck = async (req,res,next) =>{
   
    console.log("casesList middleware...")
    try {
        const casesList = await CaseModel.findOne({'id_file': 'master_cases_list'})
        if (!casesList){
            console.log("cases list not found:",casesList)
            next()
        }else{
            console.log("cases list correctly loadede")
            res.send({ cases_list: casesList})
        }
        
    }catch(error){
        console.log(error)
    }
}

app.get('/cases',casesListCheck, async (req,res) =>{
    const folder = path.join( __dirname , './data/cases/')
    console.log(folder)
    
    fs.readdir(folder , (err,files)=>{

        if(err){
            console.log("can't load the cases list, sorry!")
            return res.send({message: "can't load the cases list, sorry!"})
        }
        console.log(files)
        res.json(files)
    })

})


app.post('/pressure', async (req, res) => {
    console.log("server ---> pressure function")
    console.log(req.body)
    try{
        const char = await Character.findOne({'_id' : 'char_chen_101'})
        if(!char){
            console.log("no character found!")
            return res.status(404).send("character not found!");
        }
        console.log("previus level of stress", char.state_metrics.pressure_level)
        let pressureAccumulated = 0
        char.interaction_triggers.semantic_triggers.map((e) => {
            ///con .some se i concept_id sono due li somma entrambi. CAMBIARE!!
            //if(req.body.semantic_triggers.some( id => e.concept_id === id)){
            req.body.semantic_triggers.results.forEach((result) => {
                if (e.concept_id === result.triggered_ids) {
                    if (e.decay_mechanic.current_uses < e.decay_mechanic.max_effective_uses) {
                        e.decay_mechanic.current_uses = e.decay_mechanic.current_uses + 1
                        console.log(e.concept_id, "used", e.decay_mechanic.current_uses, "time(s) of ", e.decay_mechanic.max_effective_uses)
                        pressureAccumulated = pressureAccumulated + result.pressure_modifiers
                        console.log("adding",result.pressure_modifiers, "of",pressureAccumulated )
                        
                    } else {
                        console.log("no increment pressure, concept id", e.concept_id, "already investigated")
                    }
                }

            })
        })
        console.log("total pressure accomulated", pressureAccumulated)
        char.state_metrics.pressure_level = char.state_metrics.pressure_level + pressureAccumulated
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