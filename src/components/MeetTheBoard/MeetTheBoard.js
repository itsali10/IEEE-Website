import React, { useRef, useState } from 'react'
import "./meetTheBoardStyles.css"
import BoardMemberCard from './BoardMemberCard'
import rashad from "../../assets/Rashad.jpeg"
import richard from "../../assets/richard.jpeg"
import cs from "../../assets/ali.jpg"
import pes from "../../assets/ezzo.jpg"
import ies from "../../assets/seifsalah.jpg"
import ras from "../../assets/yousefaymannn.jpg"
import kareem from "../../assets/pr.jpg"
import sherif from "../../assets/sb.jpg"
import oc from "../../assets/momen.jpg"
import branding from "../../assets/maryam.jpg"
import shendo from "../../assets/shendo.jpeg"

const MeetTheBoard = () => {
  const boardSliderRef = useRef(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardClick = (cardId) => {
    // Simple: just set the expanded card, let CSS handle the transition
    setExpandedCard(prevExpanded => {
      const newExpanded = prevExpanded === cardId ? null : cardId;
      
      // Auto-scroll to show the expanded card properly
      if (newExpanded) {
        setTimeout(() => {
          if (boardSliderRef.current) {
            const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
            if (cardElement) {
              // Calculate the scroll position to show the expanded card
              const container = boardSliderRef.current;
              
              // If it's the last card, scroll to the far right
              if (cardId === "board-8") {
                container.scrollTo({
                  left: container.scrollWidth,
                  behavior: 'smooth'
                });
              } else {
                // For other cards, scroll to ensure they're fully visible
                const cardLeft = cardElement.offsetLeft;
                const cardWidth = cardElement.offsetWidth;
                const containerWidth = container.clientWidth;
                
                // Calculate the ideal scroll position
                let scrollLeft = cardLeft - (containerWidth - cardWidth) / 2;
                scrollLeft = Math.max(0, Math.min(scrollLeft, container.scrollWidth - containerWidth));
                
                container.scrollTo({
                  left: scrollLeft,
                  behavior: 'smooth'
                });
              }
            }
          }
        }, 100); // Small delay to ensure the card expansion animation starts
      }
      
      return newExpanded;
    });
  };

  return (
    <div className='meet-the-board'>
      {/* Officers Section */}
      <h1>Meet our Officers</h1>
      <div className='cards-container'>
        <BoardMemberCard 
          image={richard} 
          title="Chairman" 
          name="Youssef Osama"
          cardId="officer-1"
          isExpanded={expandedCard === "officer-1"}
          onCardClick={handleCardClick}
          section="officers"


        />
        <BoardMemberCard 
          image={rashad} 
          title="Vice Chairman" 
          name="Omar Rashad"
          cardId="officer-2"
          isExpanded={expandedCard === "officer-2"}
          onCardClick={handleCardClick}
          section="officers"


        />
        <BoardMemberCard 
          image={kareem} 
          title="Treasurer" 
          name="Kareem Hassem"
          cardId="officer-4"
          isExpanded={expandedCard === "officer-4"}
          onCardClick={handleCardClick}
          section="officers"


        />
        <BoardMemberCard 
          image={shendo} 
          title="Secretary" 
          name="Abdulrahman Ahmed"
          cardId="officer-3"
          isExpanded={expandedCard === "officer-3"}
          onCardClick={handleCardClick}
          section="officers"


        />
      </div>
      
      {/* Board Section */}
      <h1>Meet our Board</h1>
      <div className='board-cards-container board-slider' ref={boardSliderRef}>
        <BoardMemberCard
            image={pes}
            title="PES Chairman"
            name="Mariam Ezzo"
            cardId="board-2"
          isExpanded={expandedCard === "board-2"}
          onCardClick={handleCardClick}
          section="board"


        />
        <BoardMemberCard 
          image={ies} 
          title="IES Chairman" 
          name="Seif Salah"
          cardId="board-3"
          isExpanded={expandedCard === "board-3"}
          onCardClick={handleCardClick}
          section="board"


        />
        <BoardMemberCard 
          image={ras} 
          title="RAS Chairman" 
          name="Youssef Ayman"
          cardId="board-4"
          isExpanded={expandedCard === "board-4"}
          onCardClick={handleCardClick}
          section="board"


        />
        <BoardMemberCard 
          image={cs} 
          title="CS Chairman" 
          name="Ali Osama"
          cardId="board-1"
          isExpanded={expandedCard === "board-1"}
          onCardClick={handleCardClick}
          section="board"


        />
        <BoardMemberCard 
          image={sherif} 
          title="HR" 
          name="Mohamed Ahmed"
          cardId="board-6"
          isExpanded={expandedCard === "board-6"}
          onCardClick={handleCardClick}
          section="board"


        />
        <BoardMemberCard 
          image={oc} 
          title="Events" 
          name="Momen Mostafa"
          cardId="board-7"
          isExpanded={expandedCard === "board-7"}
          onCardClick={handleCardClick}
          section="board"


        />
        <BoardMemberCard 
          image={branding} 
          title="Branding" 
          name="Maryam Mohamed"
          cardId="board-8"
          isExpanded={expandedCard === "board-8"}
          onCardClick={handleCardClick}
          section="board"


        />
      </div>
    </div>
  )
}
export default MeetTheBoard
