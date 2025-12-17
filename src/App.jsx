import './App.css'
import { useState, useEffect } from "react";
import Messageboard from './Messageboard'
import CasesList from './CasesList'


const App = () => {
  const [userId, setUserId] = useState("user_1234")  //default for dev reasons
  const [casesList,setCasesList] = useState(null)
  const [caseSelected,setCaseSelected] = useState("")
  const [characterListFilter, setCharacterListFilter] = useState("case_101")
  const [characterList, setCharacterList] = useState(null)

  const loadCasesList = async () =>{
  
  try{
        const id = "master_cases_list"
        console.log(`asking for ID: ${id}`)
        const response = await fetch(`http://localhost:5000/cases`,{
            method: 'GET',
            headers: {'Content-Type' : 'application/json'}
        })
        console.log("loading cases list...")
        const data = await response.json()
        console.log("cases loaded",data)
        setCasesList(data)
        //setCasesList(data)
      }catch(err){
        console.log(err)
      }
    

}
 const  selectCase = () => {
  setCaseSelected("case_101")
 }

useEffect(()=>{
  loadCasesList()
  selectCase()
},[])

const loadCharacterList = async () => {
  console.log("loading character list...")
  const characterFilter = characterListFilter
  try{
      const response = await fetch(`http://localhost:5000/characterList/${characterFilter}`,{
          method: 'GET',
          headers: {'Content-Type' : 'application/json'}
      })
      const data = await response.json()
      console.log("character list loaded!",data)
      setCharacterList(JSON.stringify(data))
  }catch(err){
    console.log(err)
  }
}
useEffect(()=>{
loadCharacterList()
},[])


const loadSession = () => {
  const [gameSession,setGameSession] = useState({
    known_characters: ['char_mario_rossi_victim'], //unlocked IDs
    evidence_locker: [],  // unlocked evidences
  })

  

}
  return (
  <>
  {casesList ? <CasesList cases={casesList} case_selected={caseSelected}/> : <p>laoding component...</p>}
  <Messageboard cases={casesList} case_selected={caseSelected} characterFilter={characterList}/>
  </>
)
}


export default App
