import React from 'react'

import sb from "../../assets/IEEE AAST blue.png"
const SessionsCard = (props) => {
  return (
    <div
    className={props.cName}>
        <img src={props.image} alt="error" className='session-image'/>
        <div className='session-text'>
            <div className='team-container'>
                <img src={sb} alt="error" className='session-sb-logo'/>
                <h3>{props.team}</h3>

            </div>
            <h1>{props.title}</h1>
            <p>{props.desc} </p>
        </div>

  </div>
  )
}

export default SessionsCard
