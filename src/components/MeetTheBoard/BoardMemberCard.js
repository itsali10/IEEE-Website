import React, { useState, useEffect } from 'react'

const BoardMemberCard = (props) => {
  const [isMobile, setIsMobile] = useState(false);
  const { isExpanded, onCardClick, cardId, section } = props;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if ((!isMobile || section === 'officers' || section === 'founding') && onCardClick) {
      onCardClick(cardId);
    }
  };

  const handleMouseLeave = () => {
    if ((!isMobile || section === 'officers' || section === 'founding') && onCardClick) {
      onCardClick(null);
    }
  };

  const handleClick = (event) => {
    if (isMobile && onCardClick && (section === 'board' || section === 'founding')) {
      // Board and founding sections use click behavior on mobile
      // Officers section uses hover behavior like desktop
      onCardClick(cardId);
      
      // Focus the card to trigger CSS animations on touch devices
      if (isExpanded) {
        // If expanding, focus the card
        event.target.focus();
      } else {
        // If collapsing, remove focus
        event.target.blur();
      }
    }
  };

  // Mobile animation styles for officers, board, and founding sections
  const getMobileStyles = () => {
    if (!isMobile) return {};
    
    if (section === 'officers' || section === 'founding') {
      // Officers and founding sections use exact same desktop animations via CSS
      return {};
    } else if (section === 'board') {
      // Board section now uses CSS animations like desktop, no inline styles needed
      return {};
    }
    
    return {};
  };

  // Mobile overlay styles for all sections
  const getMobileOverlayStyles = () => {
    if (!isMobile) return {};
    
    if (section === 'officers' || section === 'founding') {
      // Officers and founding sections use exact same desktop overlay animations via CSS
      return {};
    } else if (section === 'board') {
      // Board section now uses CSS animations like desktop, no inline styles needed
      return {};
    }
    
    return {};
  };

  return (
    <div 
      className={`board-member-card ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={getMobileStyles()}
      data-card-id={cardId}
    >
        <div 
          className='board-member-overlay'
          style={getMobileOverlayStyles()}
        ></div>
      <img src={props.image} alt="error" />
      <h1 className='board-member-title'>{props.title}</h1>
      <h2 className='board-member-name'>{props.name}</h2>
    </div>
  )
}

export default BoardMemberCard
