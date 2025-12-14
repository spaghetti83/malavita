import OpenAI from "openai";
import { useState, useEffect } from "react";
import './App.css'


const Messageboard = () =>   {

const gptKey = import.meta.env.VITE_GPT_MINI_KEY;
const [selelectedChar,setSelectedChar] = useState("char_chen_101")
const [message, setMessage] = useState("")
const [chatLog,setChatLog] = useState("")
const [chatHistory,setChatHistory] = useState([])
const [characterLoaded, setCharacterLoaded] = useState(null)
const [stressLevel,setStressLevel] = useState(0)
const [semanticEvaluetor,setSemanticEvaluetor] = useState("")
const [stressModifier,setStressModifier] = useState([])
const [pressureLimits,setPressureLimits] = useState([])
const [evidences,setEvidences] = useState(["ev_burnt_receipt","ev_digital_receipt_cn","ev_glitch_report"])

const client = new OpenAI({
  apiKey: gptKey,
  dangerouslyAllowBrowser: true
});

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
        const response = await fetch(`http://localhost:5000/character/${id}`,{
            method: 'GET',
            headers: {'Content-Type' : 'application/json'}
        })
        const data = await response.json() 
        console.log(data)
        setCharacterLoaded(data.character)
        setChatLog(`Speaking with: ${data.character.name},`)
        setStressLevel(data.character.state_metrics.pressure_level)
        setPressureLimits(data.character.interaction_triggers.semantic_triggers)
        setSemanticEvaluetor(JSON.stringify({triggered_concepts: data.character.interaction_triggers.semantic_triggers, prompt: data.prompt}))

        console.log("prompt loaded to the NPC...")
        //return data
    }catch(error){
        console.log(error)
    }
}

const semanticEngine = async (message) => {
  console.log("semantic evaluation started...")
  setChatLog(<span style={{ fontStyle: 'italic'}}>{characterLoaded.name} is listening... </span>)
  try{
  const evaluation =  await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "system", content: semanticEvaluetor},
       {role: "user", content: message}
    ],
    temperature: 0.0
    });
    
    const stressMod = JSON.parse(evaluation.choices[0].message.content)
    console.log("STRESS",stressMod)
    setStressModifier(stressMod.pressure_modifiers)
    if(stressMod.pressure_modifiers.length !== 0){
      console.log("adding pressure...",stressMod.pressure_modifiers )
      addPressure(stressMod.pressure_modifiers)
      
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
  console.log("checking valure of pressure:", pressure)
  const pressureVal = pressure.reduce((tot, acc)=>tot + acc)
  console.log("adding pressure to: ",characterLoaded.name)
  console.log("stress value: ", characterLoaded.state_metrics.pressure_level,"+",pressureVal)
  const newPressure = characterLoaded.state_metrics.pressure_level + pressureVal
  console.log("new pressure level",newPressure) 
  console.log("Presure Cap",pressureLimits)
  console.log("stress evaluetor response",pressureVal)
  
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
        console.log("pressure level updated correctly")
        console.log(data.message)
        loadCharacter(selelectedChar) 
        npcChat(message)
}catch(error){
  console.log("pressure level NOT updated")
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
    const response =  await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "system", content: JSON.stringify(character)},
       ...chatHistory, 
       {role: "user", content: message}
    ],
    max_tokens : 50
    
    });
    console.log("connected.")
    setChatHistory(prev => [...prev,{role: "user", content: message}])
    console.log("response from NPC: ",response.choices[0].message.content) 
    setChatHistory((prevItems) => [...prevItems,{role: "assistant", content: response.choices[0].message.content}])
    setChatLog(response.choices[0].message.content)
    
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

export default Messageboard