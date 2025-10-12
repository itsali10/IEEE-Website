import React from 'react'
import { motion } from 'framer-motion'
import './teamCardStyles.css'

const TeamCard = ({ team, index, onJoinTeam }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="team-card"
  >
    <div className="team-card-header">
      <div className="team-icon-container">
        {team.icon}
      </div>
      <div>
        <div className="team-badge">
          {team.abbreviation}
        </div>
        <div className="team-meta">
          <span>👥 {team.members} members</span>
          <span className="team-established">📅 Est. {team.established}</span>
        </div>
      </div>
    </div>

    <h3 className="team-card-title">
      {team.name}
    </h3>

    <p className="team-card-description">
      {team.description}
    </p>

    <button 
      onClick={() => onJoinTeam(team.name)}
      className="team-join-button"
    >
      Join Team →
    </button>
  </motion.div>
)

export default TeamCard