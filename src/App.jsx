import './App.css'
import { useState, useEffect } from "react";
import Messageboard from './Messageboard'
import CasesList from './CasesList'


const App = () => {
  const [casesList,setCasesList] = useState(null)
  

  const LoadCasesList = async () =>{
  
  try{
        const id = "master_cases_list"
        console.log(`asking for ID: ${id}`)
        const response = await fetch(`http://localhost:5000/cases/${id}`,{
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
  LoadCasesList()
},[])


  return (
  <>
  {casesList ? <CasesList cases={casesList}/> : <p>laoding component...</p>}
  <Messageboard />
  </>
)
}


export default App
