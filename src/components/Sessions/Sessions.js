import React from 'react'
import "./sessionsStyles.css"
import SessionsCard from './SessionsCard'
import coding from "../../assets/coding.jpg"
import arduino from "../../assets/arduino.jpg"
import breadboard from "../../assets/breadboard.jpg"
import robot from "../../assets/robot.jpg"


const Sessions = () => {
  return (
    <div 
    className='sessions'>
        <SessionsCard cName="session-two session-card" image={arduino} title="Arduino Programming course" team="Electronics Team" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in enim sed eros sagittis ultricies non vitae enim. Morbi interdum vestibulum "></SessionsCard>
        <SessionsCard cName="session-three session-card" image={breadboard} title="Intro To Digital Logic Course" team="Electronics Team" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in enim sed eros sagittis ultricies non vitae enim. Morbi interdum vestibulum " ></SessionsCard>
        <SessionsCard cName="session-four session-card" image={robot} title="Intro To Robotics Course" team="Electronics Team" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in enim sed eros sagittis ultricies non vitae enim. Morbi interdum vestibulum " ></SessionsCard>
        <SessionsCard cName="session-five session-card" image={arduino} title="Arduino Programming course" team="Electronics Team" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in enim sed eros sagittis ultricies non vitae enim. Morbi interdum vestibulum "></SessionsCard>
        
    </div>
  )
}

export default Sessions
