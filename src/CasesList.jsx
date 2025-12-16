import React, { useState, useEffect } from "react";


const CasesList = (props) => {

    const loadCharacterList = async () => {
  console.log("loading character list...")
  try{
      const response = await fetch('http://localhost:5000/characterList',{
          method: 'GET',
          headers: {'Content-Type' : 'application/json'}
      })
      const data = await response.json()
      console.log(data)
      console.log("list loaded!")
  }catch(err){
    console.log(err)
  }
}


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