import React, { useState, useEffect } from 'react';
import './subHeaderStyles.css';
import { motion } from 'framer-motion';

const SubHeader = () => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const fullText = "IEEE is the world's largest technical professional organization, committed to advancing technology in all fields of engineering. With over 3,565 student branches across colleges and universities in more than 100 countries, IEEE empowers the next generation of innovators and leaders.";

    useEffect(() => {
        if (currentIndex < fullText.length) {
            const timeout = setTimeout(() => {
                setDisplayText(prev => prev + fullText[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 50); // 50ms delay between each character

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, fullText]);

    return (
        <div className='sub-header'>
            <p className='subheader-text'>
                {displayText}
                <motion.span
                    className="typewriter-cursor"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                >
                    |
                </motion.span>
            </p>
        </div>
    );
};

export default SubHeader;
