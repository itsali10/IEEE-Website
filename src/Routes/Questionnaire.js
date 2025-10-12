import React, { useState } from 'react';
import HeroWithSlope from '../components/HeroWithSlope/HeroWithSlope';
import '../css/questionnaireStyles.css';

const Questionnaire = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 1,
      question: "What type of engineering projects interest you most?",
      options: [
        "Hardware and Electronics",
        "Software Development",
        "Mechanical Design",
        "Power and Energy Systems",
        "Robotics and Automation"
      ]
    },
    {
      id: 2,
      question: "How do you prefer to work?",
      options: [
        "Independently on focused tasks",
        "In small collaborative teams",
        "Leading larger group projects",
        "Mentoring and teaching others",
        "Research and analysis"
      ]
    },
    {
      id: 3,
      question: "What motivates you most in your studies?",
      options: [
        "Solving complex technical problems",
        "Creating innovative solutions",
        "Learning new technologies",
        "Making a positive impact",
        "Building practical skills"
      ]
    },
    {
      id: 4,
      question: "Which activities appeal to you most?",
      options: [
        "Organizing events and workshops",
        "Designing graphics and content",
        "Technical project development",
        "Community outreach and networking",
        "Research and documentation"
      ]
    },
    {
      id: 5,
      question: "What's your ideal learning environment?",
      options: [
        "Hands-on workshops and labs",
        "Online courses and tutorials",
        "Peer-to-peer learning",
        "Industry visits and site tours",
        "Conference presentations and talks"
      ]
    }
  ];

  const teamRecommendations = {
    "Events": {
      title: "Events Committee",
      description: "Perfect for organizing workshops, conferences, and community events. You'll develop leadership skills while bringing the IEEE community together.",
      badge: "Community Builder"
    },
    "Branding": {
      title: "Branding Committee", 
      description: "Ideal for creative minds who want to shape IEEE's visual identity through design, social media, and content creation.",
      badge: "Creative Visionary"
    },
    "RAS": {
      title: "Robotics & Automation Society",
      description: "Join cutting-edge projects in robotics, automation, and AI. Perfect for hands-on technical development and innovation.",
      badge: "Tech Innovator"
    },
    "CS": {
      title: "Computer Society",
      description: "Focus on software development, cybersecurity, and emerging technologies. Great for programming enthusiasts.",
      badge: "Code Master"
    },
    "IES": {
      title: "Industrial Electronics Society",
      description: "Explore embedded systems, IoT, and industrial applications. Perfect for hardware and electronics enthusiasts.",
      badge: "Hardware Expert"
    },
    "PES": {
      title: "Power & Energy Society",
      description: "Work on renewable energy, power systems, and sustainable technology projects. Ideal for energy-focused engineers.",
      badge: "Energy Pioneer"
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateRecommendations = () => {
    const answerCounts = {};
    
    // Count answers for each team type
    Object.values(answers).forEach(answer => {
      const answerLower = answer.toLowerCase();
      
      if (answerLower.includes('hardware') || answerLower.includes('electronics') || answerLower.includes('embedded') || answerLower.includes('iot')) {
        answerCounts['IES'] = (answerCounts['IES'] || 0) + 1;
      }
      if (answerLower.includes('software') || answerLower.includes('programming') || answerLower.includes('cybersecurity')) {
        answerCounts['CS'] = (answerCounts['CS'] || 0) + 1;
      }
      if (answerLower.includes('mechanical') || answerLower.includes('robotics') || answerLower.includes('automation')) {
        answerCounts['RAS'] = (answerCounts['RAS'] || 0) + 1;
      }
      if (answerLower.includes('power') || answerLower.includes('energy') || answerLower.includes('renewable')) {
        answerCounts['PES'] = (answerCounts['PES'] || 0) + 1;
      }
      if (answerLower.includes('organizing') || answerLower.includes('events') || answerLower.includes('workshops') || answerLower.includes('community')) {
        answerCounts['Events'] = (answerCounts['Events'] || 0) + 1;
      }
      if (answerLower.includes('designing') || answerLower.includes('graphics') || answerLower.includes('content') || answerLower.includes('creative')) {
        answerCounts['Branding'] = (answerCounts['Branding'] || 0) + 1;
      }
    });

    // Sort teams by score and get top 2
    const sortedTeams = Object.entries(answerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([team]) => team);

    // If we don't have 2 teams, add default teams
    if (sortedTeams.length < 2) {
      const defaultTeams = ['Events', 'Branding', 'RAS', 'CS', 'IES', 'PES'];
      const missingTeams = defaultTeams.filter(team => !sortedTeams.includes(team));
      sortedTeams.push(...missingTeams.slice(0, 2 - sortedTeams.length));
    }

    return sortedTeams.slice(0, 2);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleJoinTeam = (teamKey) => {
    // Navigate to JoinUs page with both teams pre-selected
    const recommendedTeams = calculateRecommendations();
    const primaryTeam = recommendedTeams[0];
    const secondaryTeam = recommendedTeams[1];
    
    // Create URL with both teams as query parameters
    const params = new URLSearchParams({
      firstTeam: primaryTeam,
      secondTeam: secondaryTeam
    });
    
    window.location.href = `/joinus?${params.toString()}`;
  };

  const handleLearnMore = () => {
    // Navigate to Teams page
    window.location.href = '/teams';
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    const recommendedTeams = calculateRecommendations();
    const primaryRecommendation = teamRecommendations[recommendedTeams[0]];
    const secondaryRecommendation = teamRecommendations[recommendedTeams[1]];

    return (
      <div className="questionnaire-container">
        <HeroWithSlope pName="Questionnaire Results" canvasId="questionnaire-results-gradient-canvas" />
        <div className="questionnaire-content-wrapper">
          <div className="hero-questionnaire-spacer"></div>
          
          <div className="results-section">
            <div className="results-container">
              <h2>Your Perfect Matches!</h2>
              
              {/* Primary Recommendation */}
              <div className="recommendation-card primary-recommendation">
                <div className="recommendation-header">
                  <h3>{primaryRecommendation.title}</h3>
                  <span className="recommendation-badge primary-badge">{primaryRecommendation.badge}</span>
                </div>
                
                <div className="recommendation-description">
                  {primaryRecommendation.description}
                </div>
                
                <div className="recommendation-actions">
                  <button className="join-team-btn primary-btn" onClick={() => handleJoinTeam(recommendedTeams[0])}>
                    Join This Team
                  </button>
                  <button className="learn-more-btn" onClick={handleLearnMore}>
                    Learn More
                  </button>
                </div>
              </div>

              {/* Secondary Recommendation */}
              <div className="recommendation-card secondary-recommendation">
                <div className="recommendation-header">
                  <h3>{secondaryRecommendation.title}</h3>
                  <span className="recommendation-badge secondary-badge">{secondaryRecommendation.badge}</span>
                </div>
                
                <div className="recommendation-description">
                  {secondaryRecommendation.description}
                </div>
                
                <div className="recommendation-actions">
                  <button className="join-team-btn secondary-btn" onClick={() => handleJoinTeam(recommendedTeams[1])}>
                    Join This Team
                  </button>
                  <button className="learn-more-btn" onClick={handleLearnMore}>
                    Learn More
                  </button>
                </div>
              </div>
              
              <div className="questionnaire-actions">
                <button className="retake-btn" onClick={handleRetake}>
                  Retake Questionnaire
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-container">
      <HeroWithSlope pName="Team Questionnaire" canvasId="questionnaire-gradient-canvas" />
      <div className="questionnaire-content-wrapper">
        <div className="hero-questionnaire-spacer"></div>
        
        <div className="questionnaire-section">
          <div className="questionnaire-header">
            <h2>Find Your Perfect Team</h2>
            <p>Answer a few questions to discover which IEEE committee best matches your interests and skills.</p>
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-text">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>

          <div className="question-container">
            <h3 className="question-title">
              {questions[currentQuestion].question}
            </h3>
            
            <div className="options-container">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="navigation-container">
            <button
              className="nav-btn prev-btn"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            
            <button
              className="nav-btn next-btn"
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
            >
              {currentQuestion === questions.length - 1 ? 'Get Results' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
