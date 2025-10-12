import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import HeroWithSlope from '../components/HeroWithSlope/HeroWithSlope'
import TechnicalTeamCard from '../components/TechnicalTeamCard/TechnicalTeamCard'
import TeamCard from '../components/TeamCard/TeamCard'
import rasLogo from '../assets/RAS Logo.png'
import csLogo from '../assets/cs logo.png'
import iesLogo from '../assets/IES.png'
import pesLogo from '../assets/PES logo.png'
import '../css/teamsPageStyles.css'

const Teams = () => {
  const navigate = useNavigate()
  
  // Add console log to verify component is rendering
  console.log('Teams component is rendering')

  // Featured technical societies
  const technicalTeams = [
    {
      id: "ras",
      title: "Robotics & Automation Society",
      shortTitle: "RAS",
      description: "Turn theory into reality by building and programming real robots! This society offers hands-on experience in embedded systems, industrial automation, and mechanical design. Through workshops, prototyping challenges, and interdisciplinary projects, you'll learn how to combine hardware and software to create intelligent automated systems.",
      logo: rasLogo,
      bgColor: "#61116A", // Purple color for RAS
      features: ["Robot Design", "AI Integration", "Control Systems"],
    },
    {
      id: "cs",
      title: "Computer Society",
      shortTitle: "CS",
      description: "Explore the cutting edge of computer science, software development, and artificial intelligence. This society hosts hands-on workshops, coding competitions, and real-world tech projects that help you level up your programming skills and gain practical experience. Whether you're into web, mobile, data science, or game development, this is your launchpad into the tech world.",
      logo: csLogo,
      bgColor: "#F1AD00", // Yellow/Orange color for CS
      features: ["Software Dev", "Problem Solving", "Web Technologies"],
    },
    {
      id: "ies",
      title: "Industrial Electronics Society",
      shortTitle: "IES",
      description: "Focus on real-world industry applications involving automation, control systems, and electronic devices. This society offers hands-on labs, technical sessions, and prototyping experiences to help you understand how modern industries operate and how electronics power the world around us. A great fit for those interested in smart factories, IoT, and system control engineering.",
      logo: iesLogo,
      bgColor: "#F5833C", // Orange color for IES
      features: ["Power Systems", "Automation", "Circuit Design"],
    },
    {
      id: "pes",
      title: "Power & Energy Society",
      shortTitle: "PES",
      description: "Dive deep into the world of power systems, renewable energy, and sustainable technologies. This society connects theory with practice through technical workshops, field visits, and projects in energy systems and infrastructure. Perfect for students passionate about making energy more efficient, cleaner, and smarter.",
      logo: pesLogo,
      bgColor: "#59910F", // Green color for PES
      features: ["Smart Grids", "Renewable Energy", "Power Systems"],
    },
  ]

  // Affinity groups
  const affinityGroups = [
    {
      id: "wie",
      title: "Women in Engineering",
      shortTitle: "WIE",
      description: "Empowering women in engineering through mentorship, networking, and professional development opportunities. WIE provides a supportive community where female engineers can connect, learn, and grow together. Join us to be part of initiatives that promote diversity, inclusion, and gender equality in STEM fields.",
      logo: "👩‍🔬", // Woman scientist emoji
      bgColor: "#E91E63", // Pink color for WIE
      features: ["Mentorship", "Networking", "Professional Development"],
    }
  ]

  // Non-technical teams
  const teams = [
    {
      id: "hr",
      name: "Human Resources",
      abbreviation: "HR",
      description: "The Human Resources team is the backbone of our student branch. From onboarding new members to organizing internal development programs, HR ensures that every team member is motivated, supported, and aligned with our mission. Whether it's team bonding activities, performance tracking, or internal mentorship initiatives, HR helps create an inclusive, collaborative environment where every student can grow both personally and professionally.",
      icon: "👥",
      members: 20,
      established: "2020",
      focusAreas: ["Recruitment & Onboarding", "Member Engagement", "Team Building"],
      currentProjects: ["Member Mentorship Program", "Annual Team Retreat"],
      achievements: ["95% Member Retention Rate", "Best HR Practices Award 2023"],
    },
    {
      id: "events",
      name: "Events",
      abbreviation: "EV",
      description: "The Events team is the driving force behind all our activities and initiatives. From planning and logistics to promotion and sponsorship acquisition, this team ensures every event runs smoothly and reaches its full potential. Whether it's technical workshops, networking sessions, or major conferences, the Events team handles everything from venue coordination and vendor management to advertising campaigns and securing sponsorships. If you're passionate about creating memorable experiences and building connections, this is where you can develop your project management and organizational skills while making a real impact on our community.",
      icon: "🎯",
      members: 35,
      established: "2020",
      focusAreas: ["Event Planning & Logistics", "Sponsorship Acquisition", "Marketing & Promotion"],
      currentProjects: ["Annual IEEE Conference", "Tech Workshop Series", "Industry Partnership Program"],
      achievements: ["50+ Successful Events", "200K+ Social Media Reach", "15+ Major Sponsors"],
    },
    {
      id: "branding",
      name: "Branding ",
      abbreviation: "BR",
      description: "The Branding team brings our identity to life through design, visuals, and creative storytelling. From posters and videos to merchandise and UI/UX design, this team creates the first impression people see—and the lasting one they remember. If you're into design, content, or visual media, you'll love building a strong, recognizable image for all our projects and events.",
      icon: "🎨",
      members: 20,
      established: "2020",
      focusAreas: ["Visual Identity", "Graphic Design", "Brand Guidelines"],
      currentProjects: ["Brand Refresh Initiative", "Digital Asset Library"],
      achievements: ["Brand Recognition Increase 300%", "Design Excellence Award"],
    }
  ]

  // Map team names to committee options for JoinUs page
  const teamToCommitteeMap = {
    "Human Resources": "Human Resources",
    "Events": "Events",
    "Branding": "Branding",
    "Robotics & Automation Society": "Robotics and Automation Society (RAS)",
    "Computer Society": "Computer Society (CS)",
    "Industrial Electronics Society": "Industrial Elecrtonics Society (IES)",
    "Power & Energy Society": "Power & Energy Society (PES)",
  }

  const handleJoinTechnicalTeam = (teamTitle) => {
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

  const handleJoinTeam = (teamName) => {
    const committeeOption = teamToCommitteeMap[teamName]
    if (committeeOption) {
      navigate('/joinus', { 
        state: { 
          selectedCommittee: committeeOption 
        } 
      })
    } else {
      navigate('/joinus')
    }
    // Scroll to top of the page
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)
  }





  return (
    <div className="teams-container">
      {/* Hero Section */}
      <HeroWithSlope pName="Our Teams" canvasId="teams-gradient-canvas" />

      {/* Non-Technical Teams Section */}
      <section className="teams-section support-teams">
        <div className="teams-section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="teams-section-header"
          >
            <h2 className="teams-section-title">
              Non-Technical Teams
            </h2>
            <p className="teams-section-description">
              The backbone of our organization, ensuring smooth operations and professional growth for all members.
            </p>
          </motion.div>
          
          <div className="teams-grid non-technical">
            {teams.map((team, index) => (
              <TeamCard 
                key={team.id} 
                team={team} 
                index={index}
                onJoinTeam={handleJoinTeam}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Technical Teams Section */}
      <section className="teams-section technical-teams">
        <div className="teams-section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="teams-section-header"
          >
            <h2 className="teams-section-title">
              Technical Societies
            </h2>
            <p className="teams-section-description">
              Dive deep into specialized engineering fields through hands-on projects, workshops, and professional development opportunities.
            </p>
          </motion.div>
          
          <div className="teams-grid technical">
            {technicalTeams.map((team, index) => (
              <TechnicalTeamCard 
                key={team.id} 
                team={team} 
                index={index}
                onJoinTeam={handleJoinTechnicalTeam}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Affinity Groups Section */}
      <section className="teams-section affinity-groups">
        <div className="teams-section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="teams-section-header"
          >
            <h2 className="teams-section-title">
              Affinity Groups
            </h2>
            <p className="teams-section-description">
              Join specialized communities that promote diversity, inclusion, and professional development in engineering.
            </p>
          </motion.div>
          
          <div className="teams-grid affinity">
            {affinityGroups.map((group, index) => (
              <TechnicalTeamCard 
                key={group.id} 
                team={group} 
                index={index}
                onJoinTeam={group.id !== 'wie' ? handleJoinTechnicalTeam : null}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Teams 