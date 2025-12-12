import OpenAI from "openai";
import { useState, useEffect } from "react";
import './App.css'


const Messageboard = () =>   {

const gptKey = import.meta.env.VITE_GPT_MINI_KEY;
const semanticEnginePrompt = "" //PUT THE PROMPT HERE!! 
const [message, setMessage] = useState("")
const [chatLog,setChatLog] = useState("")
const [chatHistory,setChatHistory] = useState([])
const [characterLoaded, setCharacterLoaded] = useState(null)
const [stressLevel,setStressLevel] = useState(0)
const [semanticTrigger,setSemanticTrigger] = useState(null)

const client = new OpenAI({
  apiKey: gptKey,
  dangerouslyAllowBrowser: true
});

const handleMessage = (e) => {
  
  setMessage(e.target.value)
  if( e.key === 'Enter'){
    npcChat(message)
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
        
        setCharacterLoaded(data)
        setSemanticTrigger()
        setChatLog(`Speaking with: ${data.character.name},`)
        console.log(data.prompt)
        return data
    }catch(error){
        console.log(error)
    }
}

const semanticEngine = async (message) => {

  

/*
  const response =  await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "system", content: semanticEnginePrompt},
       ...chatHistory, 
       {role: "user", content: message}
    ]
    });
    */


}

const messagePressureDetection =  async (message) =>{
    const text = String(message).toLowerCase()
    console.log(text)
    
    const keyWords = characterLoaded.character.interaction_triggers.keywords.map( e => e.words)
    
    for(let i = 0; i < keyWords.length; i++){
      const isTriggering = keyWords[i].some( word => text.includes(word))
      console.log("TRIGGERED level",i,isTriggering)
      if(isTriggering){
        setStressLevel(i)
      }
    }
}
useEffect(()=>{
  //console.log(stressLevel)
},[stressLevel])
const addPressure = async () => {
    try{
        const response = await fetch('http://localhost:5000/pressure',{
            method : "GET",
            headers: { 'Content-Type' : 'applications/json'}
        })
        const data = await response.json()
        console.log(data)
        getMessage()
}catch(error){
    console.log(error)
}
}



const npcChat = async (message) =>{
    console.log("starting message...")
    console.log(message)
    
try{
    const chen = "char_chen_101" //TO CHANGE
    console.log("loading character...")
    const character = characterLoaded
    console.log("DATA: ",character)
    setChatLog(<span style={{ fontStyle: 'italic'}}>{character.character.meta.name} is thinking... </span>)
    const response =  await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "system", content: JSON.stringify(character)},
       ...chatHistory, 
       {role: "user", content: message}
    ]
    });
    console.log("connected.")
    setChatHistory(prev => [...prev,{role: "user", content: message}])
    console.log(response.choices[0].message.content) 
    setChatHistory((prevItems) => [...prevItems,{role: "assistant", content: response.choices[0].message.content}])
    setChatLog(response.choices[0].message.content)
    console.log(chen.state_metrics.pressure_level)
}catch(err){
    console.log("THIS IS ERROR",err)
}

}

useEffect(()=>{
    //CHAT HISTORY UPDATE
    chatHistory.map(e => console.log("History: ",e.content))
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
          semanticEngine()
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