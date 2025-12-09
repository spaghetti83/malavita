import OpenAI from "openai";
import { useState } from "react";
import './App.css'


function App() {
  

const [message, setMessage] = useState("")
const [resp,setResp] = useState("")

const handleMessage = (e) => {
  setMessage(e.target.value)
}

const client = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

const getMessage = (message) =>{
    console.log("avvio messaggio...")
    console.log(message)
try{
    const response =  client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "user", content: message}
    ]
});

console.log(response);
//setResp(response.choices[0].message.content)

}catch(err){
    console.log("THIS IS ERROR",err)
}

}


  return (
    <>
      <input id="text" type="text" placeholder="ask something..." onChange={handleMessage}/>
      <button
        id="send"
        onClick={() => {
          console.log("click!");
          getMessage(message);
        }}
      >
        send
      </button>
      <div>
        {resp}
      </div>
    </>
  );
}

export default App
