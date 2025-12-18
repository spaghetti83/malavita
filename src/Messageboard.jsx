import OpenAI from "openai";
import { useState, useEffect } from "react";
import './App.css'


const Messageboard = (props) =>   {

const gptKey = import.meta.env.VITE_GPT_MINI_KEY;
const [selelectedChar,setSelectedChar] = useState(null)
const [message, setMessage] = useState("")
const [chatLog,setChatLog] = useState("")
const [chatHistory,setChatHistory] = useState([])
const [characterLoaded, setCharacterLoaded] = useState(null)
const [stressLevel,setStressLevel] = useState(0)
const [semanticEvaluetor,setSemanticEvaluetor] = useState("")
const [stressModifier,setStressModifier] = useState([])
//const [characterList, setCharacterList] = useState(null)
const [pressureLimits,setPressureLimits] = useState([])
const characterList = JSON.parse(props.characterFilter)


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
/*
const loadCharacterList = async () => {
  console.log("loading character list...")
  const characterFilter = props.characterFilter
  try{
      const response = await fetch(`http://localhost:5000/characterList/${characterFilter}`,{
          method: 'GET',
          headers: {'Content-Type' : 'application/json'}
      })
      const data = await response.json()
      console.log("character list loaded!",data)
      setCharacterList(data)
  }catch(err){
    console.log(err)
  }
}
useEffect(()=>{
loadCharacterList()
},[])
*/
const loadCharacter = async (id)=> {
  setSelectedChar(id)
  console.log("LOADING CHARACTER...")
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
  //setChatLog(<span style={{ fontStyle: 'italic'}}>{characterLoaded.name} is listening... </span>)
  try{
  const response = await fetch('http://localhost:5000/semantic-evaluetor',{
    method : 'POST',
    headers : {'Content-Type' : 'application/json'},
    body : JSON.stringify({
      semantic_evaluetor : semanticEvaluetor,
      message : message,
      character : JSON.stringify(characterLoaded),
      chat_history : JSON.stringify(chatHistory)
    })
  })
    console.log("waiting an answer from server..")
    const data = await response.json()
    console.log("semantic evaluetor DATA",data)
    
    
    //console.log("STRESS",stressMod)
    //setStressModifier(stressMod.pressure_modifiers)
    
      console.log("going to start npcChat with this message:",data.message.content)
      setChatLog(data.message.content)
    
    
  }catch(error){
    console.log(error)
  }


}

useEffect(()=>{
console.log("suspect stress level",stressLevel)
},[stressLevel,characterLoaded,stressModifier])
/*
const addPressure = async (pressure) => {
  console.log("checking valure of pressure:", pressure)
  const pressureObj = pressure
  console.log("adding pressure to: ",characterLoaded.name)
 
    try{
        const response = await fetch('http://localhost:5000/pressure',{
            method : "POST",
            headers: { 'Content-Type' : 'application/json'},
            body: JSON.stringify({
              id: characterLoaded.id,
              semantic_triggers: pressure
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
*/
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
    max_tokens : 80,
    temperature: 0.7,
    top_p: 0.95
    
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
      
      <input id="text" type="text" value={message} placeholder="ask something..." onChange={handleMessage} onKeyDown={handleMessage} autoComplete="off"/>
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
      
        <div>
        
          { characterList ? characterList.characterList.map( (e,index) => (
            <button key={index} onClick={()=> loadCharacter(e._id) }>{e.name}: {e.role}</button>
            ))
           : <p>loading characters...</p>
          }
        </div>
     

  
    </>
  )
}

export default Messageboard