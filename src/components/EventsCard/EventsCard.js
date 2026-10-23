import React, { useState, useEffect } from 'react'
import "./eventsCardStyles.css"
import { useRef } from 'react'
import { useTransform , motion } from 'framer-motion'

const EventsCard = (props) => {
    const container = useRef(null)
    const cardScale = useTransform(props.progress, props.range, [1, props.targetScale])
    
    // Helper function to format date
    const formatDate = (dateString) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        const [day, month, year] = dateString.split('-');
        const monthIndex = parseInt(month) - 1;
        const monthName = months[monthIndex];
        
        return `${monthName} ${parseInt(day)}, ${year}`;
    };
    
    // Slideshow state
    const [currentSlide, setCurrentSlide] = useState(0)
    
    // Toggle text visibility
    const [isTextHidden, setIsTextHidden] = useState(false)
    
    // Use the images array from props if available, otherwise fall back to single image
    const images = props.images || [props.image, props.image, props.image, props.image]
    
    // Auto-advance slideshow
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length)
        }, 3000) // Change slide every 3 seconds
        
        return () => clearInterval(interval)
    }, [images.length])
    
    // Manual slide navigation
    const goToSlide = (index) => {
        setCurrentSlide(index)
    }
    
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length)
    }
    
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div ref={container} className='event-card-outer-container'>
            <motion.div 
                style={{
                    scale: cardScale, 
                    marginTop: `${props.i * 20}px`,
                    backgroundImage: `url(${images[currentSlide] || "/placeholder.svg"})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }} 
                className='enhanced-event-card-animated'
            >
                <div className='enhanced-card-content-animated'>
                    {/* Toggle Button at top left */}
                    <button
                        type='button'
                        className='enhanced-event-badge-animated enhanced-toggle-button'
                        onClick={() => setIsTextHidden(prev => !prev)}
                        aria-label={isTextHidden ? 'Show event details' : 'Hide event details'}
                        aria-pressed={isTextHidden}
                    >
                        {props.season}
                    </button>

                    {/* Centered Event Details Section */}
                    <div className='enhanced-event-details-animated'>
                        <div className='enhanced-event-details-content-animated'>
                            <div style={{ visibility: isTextHidden ? 'hidden' : 'visible' }}>
                                <h2 className='enhanced-event-title-animated'>{props.eventName}</h2>

                                <div className='enhanced-event-info-grid-animated'>
                                    <div className='enhanced-event-info-item-animated'>
                                        <svg className='enhanced-event-icon-animated' viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        <span>{formatDate(props.eventDate)}</span>
                                    </div>
                                    <div className='enhanced-event-info-item-animated'>
                                        <svg className='enhanced-event-icon-animated' viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span>{props.eventLocation}</span>
                                    </div>
                                </div>

                                <div className='enhanced-event-description-animated'>
                                    <h3 className='enhanced-session-title-animated'>Event Details</h3>
                                    <p className='enhanced-session-text-animated'>{props.eventDesc}</p>
                                    {props.universityLinks && props.universityLinks.length > 0 && (
                                        <p className='enhanced-university-links-animated'>
                                            {props.universityLinks.map((uni, index) => (
                                                <span key={uni.url}>
                                                    <a
                                                        href={uni.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className='enhanced-university-link'
                                                    >
                                                        {uni.name}
                                                    </a>
                                                    {index < props.universityLinks.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons at card edges */}
                    <button onClick={prevSlide} className='enhanced-nav-button-animated enhanced-nav-button-left-animated' aria-label="Previous image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="15,18 9,12 15,6" />
                        </svg>
                    </button>
                    <button onClick={nextSlide} className='enhanced-nav-button-animated enhanced-nav-button-right-animated' aria-label="Next image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="9,18 15,12 9,6" />
                        </svg>
                    </button>

                    {/* Image Counter Dots */}
                    <div className='enhanced-image-dots-animated'>
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`enhanced-image-dot-animated ${currentSlide === index ? "active" : ""}`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Image Number Badge */}
                    <div className='enhanced-image-counter-animated'>
                        {currentSlide + 1} / {images.length}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default EventsCard