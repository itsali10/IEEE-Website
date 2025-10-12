import React from 'react'
import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import rasLogo from '../../assets/RAS Logo.png'
import csLogo from '../../assets/cs logo.png'
import iesLogo from '../../assets/IES.png'
import pesLogo from '../../assets/PES logo.png'
import './homeTechnicalTeamsStyles.css'

const HomeTechnicalTeams = () => {
  const navigate = useNavigate()

  const teams = [
    {
      id: 'ras',
      title: 'Robotics & Automation Society',
      shortTitle: 'RAS',
      description:
        'Advancing robotics, automation, and intelligent systems through hands-on projects and cutting-edge research. Join us to build the future of autonomous technology.',
      logo: rasLogo,
      bgColor: '#61116A',
      bgSoft: 'rgba(97, 17, 106, 0.08)',
      features: ['Robot Design', 'AI Integration', 'Control Systems'],
    },
    {
      id: 'cs',
      title: 'Computer Society',
      shortTitle: 'CS',
      description:
        'Exploring software development, algorithms, and emerging technologies. Connect with fellow programmers and work on innovative computing solutions.',
      logo: csLogo,
      bgColor: '#F1AD00',
      bgSoft: 'rgba(241, 173, 0, 0.08)',
      features: ['Software Dev', 'Problem Solving', 'Web Technologies'],
    },
    {
      id: 'ies',
      title: 'Industrial Electronics Society',
      shortTitle: 'IES',
      description:
        'Focusing on power systems, industrial automation, and electrical engineering applications. Design and implement real-world electronic solutions.',
      logo: iesLogo,
      bgColor: '#F5833C',
      bgSoft: 'rgba(245, 131, 60, 0.08)',
      features: ['Power Systems', 'Automation', 'Circuit Design'],
    },
    {
      id: 'pes',
      title: 'Power & Energy Society',
      shortTitle: 'PES',
      description:
        'Dedicated to advancing power and energy technologies. Explore smart grids, renewable energy, and efficient power systems through hands-on projects and innovation.',
      logo: pesLogo,
      bgColor: '#59910F',
      bgSoft: 'rgba(89, 145, 15, 0.08)',
      features: ['Smart Grids', 'Renewable Energy', 'Power Systems'],
    },
  ]

  const handleJoinTeam = (teamTitle) => {
    navigate('/joinus', {
      state: {
        selectedTeam: teamTitle,
        fromTechnicalTeams: true,
      },
    })
    setTimeout(() => window.scrollTo(0, 0), 100)
  }

  const handleLearnMore = () => {
    navigate('/teams')
    window.scrollTo(0, 0)
  }

  const scrollToContact = () => {
    const el = document.querySelector('.get-in-touch')
    if (!el) return
    const { top } = el.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    window.scrollTo({ top: scrollTop + top - 20, behavior: 'smooth' })
  }

  return (
    <section className="home-tech-teams">
      <div className="container">
        <motion.div
          className="intro"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge">Technical Teams</span>
          <h2 className="title">Join Our Technical Societies</h2>
          <p className="subtitle">
            Explore specialized technical areas and connect with like-minded engineers in our diverse technical
            societies
          </p>
        </motion.div>

        <div className="cards">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="card-accent" style={{ background: team.bgColor }} />

              <div className="card-body">
                <div className="card-top">
                  <div className="logo-container" style={{ background: team.bgSoft }}>
                    <img src={team.logo} alt={`${team.shortTitle} logo`} className="logo" />
                  </div>
                  <span className="short" style={{ color: team.bgColor, borderColor: team.bgColor }}>
                    {team.shortTitle}
                  </span>
                </div>

                <h3 className="card-title" style={{ color: team.bgColor }}>
                  {team.title}
                </h3>
                <p className="card-desc">{team.description}</p>

                <div className="features">
                  <h4 className="features-title">Focus Areas:</h4>
                  <div className="features-list">
                    {team.features.map((feature) => (
                      <span key={feature} className="feature" style={{ background: team.bgSoft, color: team.bgColor }}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="actions">
                  <button className="btn primary" style={{ background: team.bgColor, color: '#fff' }} onClick={() => handleJoinTeam(team.title)}>
                    Join Team
                    <HiArrowRight className="arrow" />
                  </button>
                  <button className="btn outline" onClick={handleLearnMore}>
                    Learn More
                  </button>
                </div>
              </div>

              <div className="overlay" />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="cta-box">
            <h3 className="cta-title">Ready to Get Involved?</h3>
            <p className="cta-desc">
              Join one of our technical societies and connect with fellow engineers who share your passion for
              innovation and technology.
            </p>
            <div className="cta-actions">
              <button className="btn light" onClick={handleLearnMore}>
                Explore All Teams
                <HiArrowRight className="arrow" />
              </button>
              <button className="btn ghost" onClick={scrollToContact}>
                Contact Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HomeTechnicalTeams


