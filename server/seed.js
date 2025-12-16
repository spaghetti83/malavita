//USE THIS TO PUSH NEW CHARACTER INTO THE MONGO DB
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const { MONGODB_USR, MONGODB_PSW } = process.env;


//SETTING FILE HERE
const DATA_TO_SEED = [
  
  {
    collection: 'characters',
    filePath: `./data/characters/Chen.json`
  }, {
    collection: 'characters',
    filePath: `./data/characters/LiJun.json`
  },
   {
    collection: 'characters',
    filePath: `./data/characters/MarioRossi.json`
  },
   {
    collection: 'characters',
    filePath: `./data/characters/SilviaMoretti.json`
  }

  // Puoi aggiungere altri file qui
  // { collection: 'characters', filePath: './data/cases/case_101/characters/char_silvia.json' }
];

const seedDatabase = async () => {
  const uri = `mongodb+srv://${MONGODB_USR}:${MONGODB_PSW}@cluster0.fxumk9v.mongodb.net/malavita`
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("🔌 Connesso a MongoDB...");
    const db = client.db('malavita'); // Nome del tuo DB

    for (const item of DATA_TO_SEED) {
      // 1. Legge il file JSON (Standard, con virgolette!)
      const rawData = fs.readFileSync(path.resolve(__dirname, item.filePath), 'utf-8');
      const jsonData = JSON.parse(rawData);

      // 2. Prepara la collezione
      const collection = db.collection(item.collection);
      
      // Opzionale: Pulisce la vecchia versione del personaggio se esiste già
      await collection.deleteOne({ _id: jsonData._id || jsonData.id });

      // 3. Inserisce il nuovo
      await collection.insertOne(jsonData);
      console.log(`✅ Inserito: ${jsonData.name || 'Documento'} in ${item.collection}`);
    }

  } catch (err) {
    console.error("❌ Errore Seed:", err);
  } finally {
    await client.close();
    console.log("👋 Connessione chiusa.");
  }
};

seedDatabase();