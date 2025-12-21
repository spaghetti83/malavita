import React from 'react'
import './Caselist.css'
const CasesList = (props) => {

    console.log(props)
    return (
        <div className="case-list-container" >
            <ul style={{listStyle: "none", padding: 0, margin: 0,cursor: "pointer"}}>
            {props.cases.cases_list.available_cases.map((e,index) => (
               e.status === "UNLOCKED" ? <li  key={index}>{e.display_title}<span class="material-symbols-outlined">
arrow_forward_ios
</span></li> : <li key={index}>{e.status}</li>
            )
            )}
            </ul>
        </div>
    )
}


export default CasesList