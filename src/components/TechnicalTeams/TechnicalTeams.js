import React from 'react';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import rasLogo from '../../assets/RAS Logo.png';
import csLogo from '../../assets/cs logo.png';
import iesLogo from '../../assets/IES.png';
import pesLogo from '../../assets/PES logo.png';
import './technicalTeamsStyles.css';

const TechnicalTeams = () => {
  const navigate = useNavigate();

  const teams = [
    {
      id: "ras",
      title: "Robotics & Automation Society",
      shortTitle: "RAS",
      description:
        "Advancing robotics, automation, and intelligent systems through hands-on projects and cutting-edge research. Join us to build the future of autonomous technology.",
      logo: rasLogo,
      bgColor: "#61116A", // Purple color for RAS
      features: ["Robot Design", "AI Integration", "Control Systems"],
    },
    {
      id: "cs",
      title: "Computer Society",
      shortTitle: "CS",
      description:
        "Exploring software development, algorithms, and emerging technologies. Connect with fellow programmers and work on innovative computing solutions.",
      logo: csLogo,
      bgColor: "#F1AD00", // Yellow/Orange color for CS
      features: ["Software Dev", "AI/ML", "Web Technologies"],
    },
    {
      id: "ies",
      title: "Industrial Electronics Society",
      shortTitle: "IES",
      description:
        "Focusing on power systems, industrial automation, and electrical engineering applications. Design and implement real-world electronic solutions.",
      logo: iesLogo,
      bgColor: "#F5833C", // Orange color for IES
      features: ["Power Systems", "Automation", "Circuit Design"],
    },
    {
      id: "pes",
      title: "Power & Energy Society",
      shortTitle: "PES",
      description:
        "Dedicated to advancing power and energy technologies. Explore smart grids, renewable energy, and efficient power systems through hands-on projects and innovation.",
      logo: pesLogo,
      bgColor: "#59910F", // Green color for PES
      features: ["Smart Grids", "Renewable Energy", "Power Systems"],
    },
  ];

  const handleJoinTeam = (teamTitle) => {
    // Navigate to JoinUs page with the team as first committee
    navigate('/joinus', { 
      state: { 
        selectedTeam: teamTitle,
        fromTechnicalTeams: true 
      } 
    });
    // Scroll to top of the page
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)
  };

  const scrollToContact = () => {
    const contactSection = document.querySelector('.get-in-touch');
    if (contactSection) {
      const rect = contactSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = scrollTop + rect.top - 20; // 20px offset for minimal spacing
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleExploreAllTeams = () => {
    navigate('/teams');
    window.scrollTo(0, 0);
  };

  const handleLearnMore = () => {
    navigate('/teams');
    window.scrollTo(0, 0);
  };

  return (
    <section className="technical-teams">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge">
            Technical Teams
          </div>
          <h2 className="section-title">Join Our Technical Societies</h2>
          <p className="section-description">
            Explore specialized technical areas and connect with like-minded engineers in our diverse technical
            societies
          </p>
        </motion.div>

        <div className="teams-grid">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="team-card"
              style={{ '--team-color': team.bgColor }}
            >
              <div className="card-content">
                <div className="card-header">
                  <div className="logo-container">
                    <img src={team.logo} alt={`${team.shortTitle} logo`} className="team-logo" />
                  </div>
                  <div className="team-badge">
                    {team.shortTitle}
                  </div>
                </div>

                <h3 className="team-title">
                  {team.title}
                </h3>

                <p className="team-description">
                  {team.description}
                </p>

                <div className="team-features">
                  <h4 className="features-title">Focus Areas:</h4>
                  <div className="features-list">
                    {team.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="feature-tag"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="action-buttons">
                  <button 
                    className="join-button"
                    onClick={() => handleJoinTeam(team.title)}
                  >
                    Join Team
                    <HiArrowRight className="arrow-icon" />
                  </button>
                  <button 
                    className="learn-more-button"
                    onClick={handleLearnMore}
                  >
                    Learn More
                  </button>
                </div>
              </div>

              <div className="hover-overlay"></div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="cta-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="cta-content">
            <h3 className="cta-title">Ready to Get Involved?</h3>
            <p className="cta-description">
              Join one of our technical societies and connect with fellow engineers who share your passion for
              innovation and technology.
            </p>
            <div className="cta-buttons">
              <button 
                className="explore-button"
                onClick={handleExploreAllTeams}
              >
                Explore All Teams
                <HiArrowRight className="arrow-icon" />
              </button>
              <button 
                className="contact-button"
                onClick={scrollToContact}
              >
                Contact Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechnicalTeams; 