import OpenAI from "openai";
import { useState, useEffect } from "react";
import './Messageboard.css'


const Messageboard =  (props) =>   {

//DATA
const [selelectedChar,setSelectedChar] = useState(null)
const [message, setMessage] = useState("")
const [chatLog,setChatLog] = useState("")
const [chatHistory,setChatHistory] = useState([])
const [characterLoaded, setCharacterLoaded] = useState(null)
const [stressLevel,setStressLevel] = useState(0)
const [semanticEvaluetor,setSemanticEvaluetor] = useState("")
const [stressModifier,setStressModifier] = useState([])
const [pressureLimits,setPressureLimits] = useState([])
const characterList =  props.characterFilter
const caseSelectedId = props.case_selected
const userId = props.user
const [activeTab,setActiveTab] = useState("character")


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
        setChatLog(data.character.name)
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
  setChatLog(<span style={{ fontStyle: 'italic'}}>{characterLoaded.name} is thinking...</span>)
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
    
   
    console.log("no errors found...")
    console.log("waiting an answer from server..")
    const data = await response.json()
    console.log("semantic evaluetor DATA",data)
    console.log("going to start npcChat with this message:",data)
    setChatLog(data.message.content)
    data.pressure ? setStressLevel(data.pressure) : setStressLevel(stressLevel)
    evalueteNpcAnswer(data.message.content)
    //return  data
  }catch(error){
    console.log("ERROR found:", error)
    
    semanticEvaluetorErrorHandler(message)
  }


}

const semanticEvaluetorErrorHandler = async (message) => {
///TO DEFINE
}


const evalueteNpcAnswer = async (message)=>{
  console.log("evaluating NPC response...")
  console.log("message from NPC:", message)
  

  try{
  const response = await fetch('http://localhost:5000/semantic-evaluetor-npc',{
    method : 'POST',
    headers : {'Content-Type' : 'application/json'},
    body : JSON.stringify({
      message : message,
      user : userId,
      case : caseSelectedId
    })
  })
    
    const data = await response.json()
    console.log(data.message)
    console.log(data.id)
  if(data){
    props.charListFunction(caseSelectedId)
  }
  }catch(error){
    console.log("ERROR found:", error)
  
  }


}


useEffect(()=>{
console.log("suspect stress level",stressLevel)
},[stressLevel,characterLoaded,stressModifier])


useEffect(()=>{
    //CHAT HISTORY UPDATE
   // chatHistory.map(e => console.log("History: ",e.content))
},[chatHistory])


  return (
      <>
      <div className="mb-container">
      <div className="mb-container-buttons">
        <button className="mb-character-btn" onClick={()=> setActiveTab("characters")}>CHARACTER</button>
        <button className="mb-character-btn" onClick={()=> setActiveTab("team")}>TEAM</button>
      </div>
      <div className="mb-chatlog-container">
      <div className="mb-chatlog">
        {chatLog}
      </div>
      <p className="mb-stree-level">Stress level {stressLevel}</p>
      <div className="mb-input-btn-container">
      <input id="text" type="text" value={message} placeholder="ask something..." onChange={handleMessage} onKeyDown={handleMessage} autoComplete="off"/>
      <button
        id="send"
        className="mb-send"
        onClick={() => {
          //npcChat(message);
          semanticEngine(message)
          setMessage("")
          //messagePressureDetection(message)
        }}
        
      >
        ENTER
      </button>
      </div>
      </div>
      {activeTab === "team" ? (
        <div className="characters-btn">
          <ul className="mb-character-list-container">
          { characterList ? characterList.map( (e,index) => (
            
            e.role === "Ally" && (
            <li key={index} className="mb-character-list" onClick={()=> loadCharacter(e._id) }>{e.name}<span className="material-icons">
groups
</span></li>
            )
           
            ))
            
           : <p>loading characters...</p>
          }
            </ul>
        </div>
      ):(
        <div className="characters-btn">
          <ul className="mb-character-list-container">
          { characterList ? characterList.map( (e,index) => (
            e.role !== "Ally" && (
            <li key={index} className="mb-character-list" onClick={()=> loadCharacter(e._id) }>{e.name}: {e.role}<span className="material-icons">
local_police
</span></li>
            )
          ))
           : <p>loading characters...</p>
          }
          </ul>
        </div>
      )
      }
      </div>
          </>
  )
}

export default Messageboard