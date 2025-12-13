// CAMBIAMENTO: Importa l'SDK di Google Generative AI invece di OpenAI
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import './App.css' 

const Messageboard = () =>   {

// CAMBIAMENTO: Gestione della chiave API
// NOTA: Nel tuo progetto Vite locale usa: import.meta.env.VITE_GEMINI_KEY
// Qui lasciamo una stringa vuota o inseriamo la chiave direttamente per testare
const geminiKey = import.meta.env.VITE_GEM_FLASH_KEY 

const [message, setMessage] = useState("")
const [chatLog,setChatLog] = useState("")
const [chatHistory,setChatHistory] = useState([])
const [characterLoaded, setCharacterLoaded] = useState(null)
const [stressLevel,setStressLevel] = useState(0)
const [semanticEvaluetor,setSemanticEvaluetor] = useState("")
const [stressModifier,setStressModifier] = useState(0)

// CAMBIAMENTO: Inizializzazione del client Gemini
// Nota: Se geminiKey è vuota, assicurati che sia configurata correttamente o inseriscila sopra
const genAI = new GoogleGenerativeAI(geminiKey);

const handleMessage = (e) => {
  
  setMessage(e.target.value)
  if( e.key === 'Enter'){
    semanticEngine(message)
    setMessage("")
  } 
}

const loadCharacter = async (id)=> {
    try{
        console.log(`asking for ID: ${id}`)
        // Nota: Assicurati che il tuo backend locale sia in esecuzione su questa porta
        const response = await fetch(`http://localhost:5000/character/${id}`,{
            method: 'GET',
            headers: {'Content-Type' : 'application/json'}
        })
        const data = await response.json() 
        console.log(data)
        setCharacterLoaded(data.character)
        setChatLog(`Speaking with: ${data.character.name},`)
        setSemanticEvaluetor(data.prompt)
        setStressLevel(data.character.state_metrics.pressure_level)
        console.log("prompt loaded to the NPC...")
        //return data
    }catch(error){
        console.log(error)
    }
}

const semanticEngine = async (message) => {
  console.log("semantic evaluation started...")
  if (characterLoaded) {
      setChatLog(<span style={{ fontStyle: 'italic'}}>{characterLoaded.name} is listening... </span>)
  }
  try{
    // CAMBIAMENTO: Configurazione del modello Gemini 1.5 Flash specifico per JSON
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: semanticEvaluetor, // Le istruzioni di sistema vanno qui
        generationConfig: { responseMimeType: "application/json" } // Forza la risposta in JSON
    });

    // CAMBIAMENTO: Chiamata a generateContent invece di chat.completions.create
    const result = await model.generateContent(message);
    const evaluation = result.response;
    
    // CAMBIAMENTO: Estrazione del testo dalla risposta Gemini
    const stressMod = JSON.parse(evaluation.text())
    console.log("stress",stressMod.pressure_modifier)
    setStressModifier(stressMod.pressure_modifier)
    if(stressMod.pressure_modifier !== 0){
      console.log("adding pressure...")
      addPressure(stressMod.pressure_modifier)
      
    }else{
      console.log("no changes in pressure")
      console.log("going to start npcChat with this message:",message)
      npcChat(message)
    }
    
  }catch(error){
    console.log(error)
  }


}

useEffect(()=>{
console.log("suspect stress level",stressLevel)
},[stressLevel,characterLoaded,stressModifier])

const addPressure = async (pressure) => {
  console.log("character",characterLoaded)
  console.log("stress value: ", characterLoaded.state_metrics.pressure_level,"+",pressure)
  const newPressure = characterLoaded.state_metrics.pressure_level + pressure
  console.log("new pressure level",newPressure)
    try{
        const response = await fetch('http://localhost:5000/pressure',{
            method : "POST",
            headers: { 'Content-Type' : 'application/json'},
            body: JSON.stringify({
              id: characterLoaded.id,
              pressure: newPressure
            })
        })
        const data = await response.json()
        console.log(data.message)
        loadCharacter("char_chen_101")
        //setCharacterLoaded(data)
        //console.log("after added pressure loaded stress: " ,characterLoaded.state_metrics.stressLevel)
        npcChat(message)
}catch(error){
    console.log(error)
}
}



const npcChat = async (message) =>{
    console.log("npcChat func. starting...")
    console.log("message: ",message)
    
try{
    
    console.log("loading character...")
    const character = characterLoaded
    console.log("DATA: ",character)
    
    setChatLog(<span style={{ fontStyle: 'italic'}}>{character.name} is thinking... </span>)
    
    // CAMBIAMENTO: Preparazione del modello con istruzioni di sistema
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: JSON.stringify(character),
        generationConfig: { 
        maxOutputTokens: 1000 // Limita la risposta a circa 30-40 parole
    }
    });

   // CAMBIAMENTO: Abbiamo rimosso la conversione. Passiamo direttamente chatHistory.
    // Nota: affinché funzioni, chatHistory deve già contenere oggetti nel formato Gemini
    //const chat = model.startChat({history: chatHistory });
    const chat = model.startChat();

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();
    console.log("RESULT",result)
    console.log("connected.")
    setChatHistory(prev => [...prev,{role: "user", content: message}])
    console.log("response from NPC: ", responseText) 
    
    // Nota: Manteniamo "assistant" nello state locale per compatibilità con il resto del codice React esistente
    setChatHistory((prevItems) => [...prevItems,{role: "assistant", content: responseText}])
    setChatLog(responseText)
    
}catch(err){
    console.log("THIS IS ERROR",err)
}

}

useEffect(()=>{
    //CHAT HISTORY UPDATE
   // chatHistory.map(e => console.log("History: ",e.content))
},[chatHistory])


  return (
    <>
      <div>
        {chatLog}
      </div>
      <p>Stress level {stressLevel}</p>
      <input id="text" type="text" value={message} placeholder="ask something..." onChange={handleMessage} onKeyDown={handleMessage}/>
      <button onClick={() => loadCharacter("char_chen_101")}>carica Chen</button>
      <button
        id="send"
        onClick={() => {
          //npcChat(message);
          semanticEngine(message)
          setMessage("")
          //messagePressureDetection(message)
        }}
      >
        send
      </button>
      
    </>
  );
}

//export default Messageboard