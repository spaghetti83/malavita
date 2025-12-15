import React from 'react'

const CasesList = (props) => {
    console.log("data from APP",props.cases.cases_list.available_cases.map( e => e.display_title))
    return (
        <div className='cases-list-container' >
            <ul style={{listStyle: "none", padding: 0, margin: 0,cursor: "pointer"}}>
            {props.cases.cases_list.available_cases.map((e,index) =>
                <li key={index}>{e.display_title}</li>
            )}
            </ul>
        </div>
    )
}


export default CasesList