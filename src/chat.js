import OpenAI from "openai";

const sendBtn = document.getElementById('send')
const text = document.getElementById('text')
const chat = document.getElementById('response')



const client = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

const getMessage = (message) =>{
    console.log("avvio messaggio...")
try{
    const response =  client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "user", content: message}
    ]
});

console.log(response.choices[0].message.content);
chat.innerHTML = response.choices[0].message.content
}catch(err){
    console.log(err)
}

}

sendBtn.addEventListener('onClick', ()=>{
    console.log("click!")
    const message = text.value
    getMessage(message)
})