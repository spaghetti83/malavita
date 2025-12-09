import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

const getMessage = (message) =>{

const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "user", content: "scegli un colore a caso"}
    ]
});

console.log(response.choices[0].message.content);
}