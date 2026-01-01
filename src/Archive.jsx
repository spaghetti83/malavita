import { useState,useEffect } from "react";

const Archive = (preps) => {
    const [evidences,setEvidences] = useState(null)
    const [evidenceId,setEvidenceId] = useState(null)
    
const evidenceList = async () => {
    const userId = preps.user
    const caseId = preps.case_selected
    console.log(userId)
    console.log(caseId)
    try{
        console.log("checking evdences...")
    const response = await fetch('http://localhost:5000/evidence-list',{
        method : "POST",
        headers: {"Content-Type"  : "application/json"},
        body: JSON.stringify({user_id : userId, case_id: caseId})
    })
    const data = await response.json()
    
    setEvidenceId(data.evidence.case_id)
    setEvidences(
        <>
         <div className="mb-header-container">
        <div className='mb-active-case'>ACTIVE CASE: <span>{caseId}</span></div>
        </div>
        <div className="ar-tile">
        <div className="ar-title-case">{data.evidence.case_id}</div>
            {data.evidence.evidences.map( (e) =>{
                console.log(e.evidence_id)
                console.log(e.status.is_found)
                return e.status.is_found ? (
                <>
                <div className="ar-evidence-name" key={e.evidence_id}>{e.display_name}</div>
                <img src={e.metadata.image_asset} style={{width: "100%" , height: "auto"}} alt="" />
                <div className="ar-evidence-description">{e.description}</div>
                <img src={`{e.metadata.image_asset}`} alt="" />
                </>
                ) : (
                    <>
                    </>
                )   
                
               // ) 
                
        })
     }
        
        </div>
        </>
    )

    

}catch(error){
    console.log(error)
}
}
useEffect(()=>{
evidenceList()

},[])




    return(
        
        <div>{evidences}</div>
        
    )
}

export default Archive