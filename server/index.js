const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Character = require('./models/Character');
const CaseModel = require('./models/Cases_list')
const Session = require('./models/Session')
const CaseEvidence = require('./models/Case_model')
const path = require('path')
const fs = require('fs');
const { stripVTControlCharacters } = require('util');
const OpenAI = require('openai')
require('dotenv').config();

const app = express();
const { MONGODB_USR, MONGODB_PSW,VITE_GPT_MINI_KEY } = process.env;
console.log(VITE_GPT_MINI_KEY ? 'gpt key loaded' : 'gpt key NOT loaded')
// Middleware
app.use(cors()); 
app.use(express.json()); 

// MONGODB connection
const mongoURI = `mongodb+srv://${MONGODB_USR}:${MONGODB_PSW}@cluster0.fxumk9v.mongodb.net/malavita`

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Error DB:', err));

// --- ROUTS API ---

const semanticEngine = async (req,res,next)=>{
    console.log("starting to evaluate from the server...")
    const semanticEvaluetor = req.body.semantic_evaluetor
    const message = req.body.message

    const gptKey = VITE_GPT_MINI_KEY;

    const client = new OpenAI({
      apiKey: gptKey
    });

    try {
        const evaluation = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: semanticEvaluetor },
                { role: "user", content: message }
            ],
            temperature: 0.0
        });

        const evaluationResponse = JSON.parse(evaluation.choices[0].message.content)
        console.log("semantic engine response:",evaluationResponse)
        if (evaluationResponse.results.length !== 0) {
            console.log("adding pressure...", evaluationResponse)
            req.isAlterated = true
            req.resp = evaluationResponse
            next()
        } else {
            console.log("no changes in pressure")
            console.log("going to start npcChat with this message:", message)
            req.isAlterated = false
            req.resp = evaluationResponse
            next()
        }

    } catch (error) {
        console.log(error)
    }
}
const addPressure = async (req, res, next) => {
    console.log("server ---> pressure function") 
    const charId = JSON.parse(req.body.character)
    console.log(charId._id) 
    if(req.isAlterated){
    try{
        const char = await Character.findOne({'_id' : charId._id})
        if(!char){
            console.log("no character found!")
            return res.status(404).send("character not found!");
        }
        console.log("previus level of stress", char.state_metrics.pressure_level)
        console.log(req.resp)
        let pressureAccumulated = 0
        console.log("length results",req.resp.results)
        char.interaction_triggers.semantic_triggers.map((e) => {
           
            req.resp.results.forEach((result) => {
                if (e.concept_id === result.triggered_ids) {
                    if (e.decay_mechanic.current_uses < e.decay_mechanic.max_effective_uses) {
                        e.decay_mechanic.current_uses =  e.decay_mechanic.current_uses + 1
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
        req.pressure = char.state_metrics.pressure_level
        await char.save()
        //res.send({message: "pressure correctly saved"})
        console.log("pressure correctly saved")
        next()
    }catch(error){
        console.error(error);
        res.status(500).send('Errore: ' + error.message);
    }
}
if(!req.isAlterated){
    next()
}
    
};

app.post('/semantic-evaluetor',semanticEngine,addPressure, async (req,res) => { 
    console.log("SEMANTIC EVALUATOR MIDDLEWARE COMPLETED")
    
     const gptKey = VITE_GPT_MINI_KEY;

    const client = new OpenAI({
      apiKey: gptKey
    });
   
    const message = JSON.stringify(req.body.message)
    const character = JSON.stringify(req.body.character)
    const history = JSON.parse(req.body.chat_history)

    try{
     const response =  await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "system", content: character},
        ...history,
       {role: "user", content: message}
    ],
    max_tokens : 120,
    temperature: 0.7,
    top_p: 0.95
    
    });
    
    res.send({message: response.choices[0].message, pressure: req.pressure})
    
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 500})
    }


    
    

})

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

app.post('/semantic-evaluetor-npc',async (req,res)=>{
    console.log("starting to evaluate from the server...")
    const message = req.body.message
    const caseId = req.body.case
    const userId = req.body.user
    const npc = req.body.npc
    console.log("case:",caseId,"user:", userId)
    //reading the prompt//////////////////////////
    const promptPath = path.join(__dirname, 'data/logic/', 'semantic_analyzer_prompt.md');
    const promptContent = fs.readFileSync(promptPath, 'utf8');
    /////////////////////////////////////////////
    console.log(promptContent ? "prompt EXIST":"prompt DO NOT EXIST")
    console.log("finding evidences file into the db...")
    const caseEvidenceFile = await CaseEvidence.findOne({"user_id": userId, "case_id": caseId})
    
    console.log("case file found.")
    if(caseEvidenceFile){
    const gptKey = VITE_GPT_MINI_KEY;
    const client = new OpenAI({
      apiKey: gptKey
    });

    try {
        const evaluation = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                //{ role: "system", content: JSON.stringify({ caseFile: caseEvidenceFile, prompt: promptContent})},
                { role: "system", content: JSON.stringify({ npc: npc, caseFile: caseEvidenceFile ,prompt: promptContent})},
                { role: "user", content: message }
            ],
            temperature: 0.0
        });

        const evaluationResponse = JSON.parse(evaluation.choices[0].message.content)
        console.log("NPC semantic engine response:",evaluationResponse)
        
        evaluationResponse.results.map(async e =>{
            const character = await Character.updateOne(
                {"_id": e.triggered_ids},
                { "$set" : {"status" : "AVAILABLE"}} 
            )
            if (character.matchedCount === 0) {
                console.log("character not found");
            } else if (character.modifiedCount === 0) {
                console.log("character already AVAILABLE");
            } else {
                console.log("character successfully AVAILABLE");
            }
            const evidence = await CaseEvidence.updateOne(
                {"user_id":e.triggered_ids, "case_id": caseId},
                { "$set" : {"character_list.$.status" : "AVAILABLE"}})
            if (evidence.matchedCount === 0) {
                console.log("evidence not found");
            } else if (evidence.modifiedCount === 0) {
                console.log("evidence already AVAILABLE");
            } else {
                console.log("evidence successfully AVAILABLE");
            }    
        })
         res.send({message: "evaluation terminated", id : userId, case: caseId})
        

    } catch (error) {
        console.log(error)
    }
}else{
    console.log(`can't find any nothing about ${caseId} in the database`)
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


app.post('/session',async (req,res)=> {
    console.log("looking for a session...")
    console.log(req.body)   
    const session = await Session.findOne({'userId': req.body.id})

    if(session){
        console.log("session found")
        res.send({message: "session found", session: session})
    }else{
        console.log("no session found, creating one....")
        const newSession = new Session({
        user : req.body.user,
        userId : req.body.id,
        activeCase: {
            caseId :"case_101", 
            caseTitle : "Ashes and Envy",
            startedAt : new Date()
             }
        })
        await newSession.save() 

        res.send({message: "new session saved correctly", session: newSession})
        
    }
        
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server attivo su porta ${PORT}`));