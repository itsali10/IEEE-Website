import React from 'react'
import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi'
import './technicalTeamCardStyles.css'

const TechnicalTeamCard = ({ team, index, onJoinTeam }) => (
  <motion.div
    key={team.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="technical-team-card"
    style={{ '--team-color': team.bgColor }}
  >
    <div className="technical-card-content">
      <div className="technical-card-header">
        <div className="technical-logo-container">
          {team.iconComponent ? (
            <team.iconComponent style={{ width: '2rem', height: '2rem', color: team.bgColor }} />
          ) : team.logo && team.logo.startsWith && team.logo.startsWith('👩') ? (
            <div className="technical-emoji-logo" style={{ color: team.bgColor }}>
              {team.logo}
            </div>
          ) : (
            <img 
              src={team.logo} 
              alt={`${team.shortTitle} logo`} 
              className="technical-logo"
            />
          )}
        </div>
        <div 
          className="technical-badge"
          style={{ 
            color: team.bgColor,
            borderColor: team.bgColor 
          }}
        >
          {team.shortTitle}
        </div>
      </div>

      <h3 
        className="technical-card-title"
        style={{ color: team.bgColor }}
      >
        {team.title}
      </h3>

      <p className="technical-card-description">
        {team.description}
      </p>

      <div className="technical-features-section">
        <h4 className="technical-features-title">
          Focus Areas:
        </h4>
        <div className="technical-features-container">
          {team.features.map((feature, idx) => (
            <span
              key={idx}
              className="technical-feature-tag"
              style={{ color: team.bgColor }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {onJoinTeam && (
        <div className="technical-button-container">
          <button 
            onClick={() => onJoinTeam(team.title)}
            className="technical-join-button"
            style={{ backgroundColor: team.bgColor }}
          >
            Join Team
            <HiArrowRight className="technical-button-icon" />
          </button>
        </div>
      )}
    </div>

    <div className="technical-card-overlay"></div>
  </motion.div>
)

export default TechnicalTeamCard