import { useState,useEffect } from "react";

const Archive = (preps) => {
    ///forse non sono ancora caricati i props per via del render ritardato

const evidenceList = async () => {
   // user={userId} cases={casesList} case_selected={caseSelected}
    const userId = preps.user
    const caseId = preps.case_selected
    console.log(userId)
    console.log(preps)
    try{
        console.log("checking evdences...")
    const response = await fetch('http://localhost:5000/evidence-list',{
        method : "POST",
        headers: {"Content-Type"  : "application/json"},
        body: JSON.stringify({user_id : userId, case_id: caseId})
    })
    

    const data = response.json()
   data && console.log("Evidence List", data)
}catch(error){
    console.log(error)
}
}
useEffect(()=>{
evidenceList()
},[])



    return(

        <div>ARCHIVE</div>
    )
}

export default Archive