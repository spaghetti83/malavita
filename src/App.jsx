import './App.css'
import { useState, useEffect } from "react";
import Messageboard from './Messageboard'
import CasesList from './CasesList'


const App = () => {
  const [casesList,setCasesList] = useState(null)
  const [caseSelected,setCaseSelected] = useState("")

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


  return (
  <>
  {casesList ? <CasesList cases={casesList} case_selected={caseSelected}/> : <p>laoding component...</p>}
  <Messageboard cases={casesList} case_selected={caseSelected}/>
  </>
)
}


export default App
