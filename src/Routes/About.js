import React, { useRef, useState } from 'react'
import HeroWithSlope from '../components/HeroWithSlope/HeroWithSlope'
import "../css/aboutStyles.css"
import MeetTheBoard from '../components/MeetTheBoard/MeetTheBoard'
import BoardMemberCard from '../components/MeetTheBoard/BoardMemberCard'
import rashad from "../assets/Rashad.jpeg"
import saifreda from "../assets/foundingsaif.jpg"
import omar from "../assets/omar maged.jpg"
import hosny from "../assets/hosny.jpg"
import sayed from "../assets/sayed.jpg"
import seifkhaled from "../assets/seifkhaled.jpg"

const About = () => {
  const foundingSliderRef = useRef(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardClick = (cardId) => {
    setExpandedCard(prevExpanded => {
      const newExpanded = prevExpanded === cardId ? null : cardId;
      
      if (newExpanded) {
        setTimeout(() => {
          if (foundingSliderRef.current) {
            const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
            if (cardElement) {
              const container = foundingSliderRef.current;
              
              if (cardId === "founding-6") {
                container.scrollTo({
                  left: container.scrollWidth,
                  behavior: 'smooth'
                });
              } else {
                const cardLeft = cardElement.offsetLeft;
                const cardWidth = cardElement.offsetWidth;
                const containerWidth = container.clientWidth;
                
                let scrollLeft = cardLeft - (containerWidth - cardWidth) / 2;
                scrollLeft = Math.max(0, Math.min(scrollLeft, container.scrollWidth - containerWidth));
                
                container.scrollTo({
                  left: scrollLeft,
                  behavior: 'smooth'
                });
              }
            }
          }
        }, 100);
      }
      
      return newExpanded;
    });
  };

  return (
    <div className='about'>
      <HeroWithSlope pName="About Us" canvasId="about-gradient-canvas"></HeroWithSlope>
      <div className='what-is-ieee-text'>
        <h1>What is IEEE?</h1>
        <p>IEEE is the world's largest technical professional organization, committed to advancing technology in all fields of engineering. With over 3,565 student branches across colleges and universities in more than 100 countries, IEEE empowers the next generation of innovators and leaders.</p>
      </div>
      <div className='about-ieee-sb-text'>
        <h1>ABOUT IEEE AAST Cairo SB</h1>
        <p>The IEEE AAST Cairo Student Branch, established in 2012, currently boasts over 150 active members. We serve a vibrant community of more than 7,500 students across various faculties on our campus, as well as over 60 IEEE Student Branches across Egypt. Our core mission is to enhance students' skills and bridge the gap between theoretical knowledge and practical application in engineering.</p>
      </div>
      
      <MeetTheBoard></MeetTheBoard>
      
      <div className='our-history-section'>
        <h1>Our History</h1>
        
        <div className='history-tribute'>
          <h2>A Tribute to Our Founding Heroes</h2>
          <div className='tribute-content'>
            <p className='tribute-intro'>
              With profound appreciation and heartfelt respect, we honor the founding officers, heads, and members of IEEE AAST Cairo Student Branch, those who dreamed boldly, acted selflessly, and laid the first stones of a legacy that continues to inspire.
            </p>
            
            <div className='tribute-body'>
              <p>You were the spark that ignited a vision.</p>
              <p>In times of uncertainty, you stood with purpose.</p>
              <p>With limited resources but limitless passion, you transformed ideas into impact.</p>
              <p>Your commitment, resilience, and belief in the power of this community became the roots of everything we are today.</p>
            </div>
            
            <div className='tribute-impact'>
              <p>Because of your efforts, students found a place to grow.</p>
              <p>Because of your leadership, a culture of excellence was born.</p>
              <p>Because of your legacy, we continue to rise.</p>
            </div>
            
            <p className='tribute-legacy'>
              We walk the path you paved with pride, gratitude, and the responsibility to honor your journey by carrying it forward.
            </p>
            
            <p className='tribute-thanks'>
              Thank you for building more than just a branch.<br />
              You built a home. A family. A future.
            </p>
            
            <p className='tribute-signature'>
              With enduring respect,<br />
              IEEE AAST Cairo Student Branch
            </p>
          </div>
        </div>
        
        <div className='founding-section'>
          <h2>Our Founding Heroes</h2>
          <div className='founding-cards-container founding-slider' ref={foundingSliderRef}>
            <BoardMemberCard 
              image={omar} 
              name="Omar Maged"
              cardId="founding-1"
              isExpanded={expandedCard === "founding-1"}
              onCardClick={handleCardClick}
              section="founding"
            />
            <BoardMemberCard 
              image={sayed} 
              name="Sayed Mohamed"
              cardId="founding-2"
              isExpanded={expandedCard === "founding-2"}
              onCardClick={handleCardClick}
              section="founding"
            />
            <BoardMemberCard 
              image={seifkhaled} 
              name="Seif Khaled"
              cardId="founding-3"
              isExpanded={expandedCard === "founding-3"}
              onCardClick={handleCardClick}
              section="founding"
            />
            <BoardMemberCard 
              image={hosny} 
              name="Mohamed Hosny"
              cardId="founding-4"
              isExpanded={expandedCard === "founding-4"}
              onCardClick={handleCardClick}
              section="founding"
            />
            <BoardMemberCard 
              image={saifreda} 
              name="Saif Reda"
              cardId="founding-5"
              isExpanded={expandedCard === "founding-5"}
              onCardClick={handleCardClick}
              section="founding"
            />
            <BoardMemberCard 
              image={rashad} 
              name="Omar Rashad"
              cardId="founding-6"
              isExpanded={expandedCard === "founding-6"}
              onCardClick={handleCardClick}
              section="founding"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
