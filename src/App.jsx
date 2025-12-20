import './App.css'
import { useState, useEffect } from "react";
import Messageboard from './Messageboard'
import CasesList from './CasesList'


const App = () => {
  const [userId, setUserId] = useState("user_1234")  //default for dev reasons
  const [session,setSession] = useState(null)
  const [casesList,setCasesList] = useState(null)
  const [caseSelected,setCaseSelected] = useState(null)
  const [characterListFilter, setCharacterListFilter] = useState("case_101")
  const [characterList, setCharacterList] = useState(null)


const loadSession = async () =>{
  console.log("looking for a session...")
    //implement the logic
    const user = "user1"
    const userId = "1234@user.com"
    const sessionExist = true 
    const userObj = {user: user, id: userId, session: sessionExist}
    try{
    const response = await fetch('http://localhost:5000/session/',{
      method: 'POST',
      headers : { 'Content-Type' : 'application/json'},
      body: JSON.stringify(userObj)
    })
    const data = await response.json()
    console.log("session:" ,data.message, data.session)
    if(data.session){
    setSession(data.session)
    setCaseSelected(session.activeCase.caseId)
    console.log("case selected", data.session)
    }
    
   
  }catch(error){
    console.log(error)
  }
}
const gameMaster = async () => {
    //1. call an api to mongo to find the user session and select the case
    //2.  get results to see unlocked cases
    //3. if NO CASES => create the first character by default
    /*4. if YES => you will have all the character already created filterd by unlocked cases.
         if the user select one of the unlocked cases, it filters all the character by cases.
         characters will be created on mongo every time the character is unlocked (mentioned).
         the method in witch the char will be mentioned is to define => by user? by NPC?
    */
   
    const sessionData = await loadSession()
    console.log("SESSION DATA",sessionData)
  

}
useEffect(()=>{
  gameMaster()
},[])

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


useEffect(()=>{
  loadCasesList()
  
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


  return (
  <>
  {casesList ? <CasesList cases={casesList} case_selected={caseSelected}/> : <p>laoding component...</p>} 
  {caseSelected ? <p>{caseSelected}</p> : <p>loading active case...</p>}
  
  <Messageboard cases={casesList} case_selected={caseSelected} characterFilter={characterList}/>
  
  </>
)
}


export default App
