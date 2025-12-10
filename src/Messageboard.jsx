import OpenAI from "openai";
import { useState, useEffect } from "react";
import './App.css'


function Messageboard() {
const gptKey = import.meta.env.VITE_GPT_MINI_KEY;

const [message, setMessage] = useState("")
const [chatLog,setChatLog] = useState("")
const [chatHistory,setChatHistory] = useState([])
const [responseContent,setResponseContent] = useState("")
const handleMessage = (e) => {
  setMessage(e.target.value)
}

const client = new OpenAI({
  apiKey: gptKey,
  dangerouslyAllowBrowser: true
});

const getMessage = async (message) =>{
    console.log("avvio messaggio...")
    console.log(message)
    setChatHistory(prev => [...prev,{role: "user", content: message}])
try{
    setChatLog("loading...")
    const response =  await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "user", content: message}
    ]
    });
    console.log(response.choices[0].message.content)
    setChatHistory((prevItems) => [...prevItems,{role: "assistant", content: response.choices[0].message.content}])
}catch(err){
    console.log("THIS IS ERROR",err)
}
setChatLog(responseContent)

}

useEffect(()=>{
    chatHistory.map(e => console.log("History: ",e.content))
    console.log(chatHistory)
},[chatHistory])

  return (
    <>
      <input id="text" type="text" placeholder="ask something..." onChange={handleMessage}/>
      <button
        id="send"
        onClick={() => {
          getMessage(message);
        }}
      >
        send
      </button>
      <div>
        {responseContent}
      </div>
    </>
  );
}

export default Messageboard