import React, { useEffect } from "react";
import { Gradient } from "whatamesh";
import { Link } from "react-router-dom";
import "./heroStyles.css"
import aastWhite from "../../assets/aast white.png"
import sbWhite from "../../assets/IEEE AAST white.png"
import lBracket from "../../assets/svg-image-20.svg"
import rBracket from "../../assets/svg-image-21.svg"

const Hero = () => {
  useEffect(() => {
    const gradient = new Gradient();
    setTimeout(() => {
      gradient.initGradient("#gradient-canvas");
    }, 100); 
  }, []);

  return (
    <div className="hero">
        <div className="overlay"></div>
        <canvas id="gradient-canvas" className="home-hero-canvas" data-js-darken-top data-transition-in>
        </canvas>
        <div className="hero-left-section">
            <div className="hero-logos-flex">
                <img src={lBracket} alt="error"/>
                <img src={sbWhite} alt="Student Branch" className="sb-logo" onClick={() => window.location.reload()}/>
                <a href="https://aast.edu/en/" target="_blank" rel="noopener noreferrer">
                    <img src={aastWhite} alt="AAST" className="aast-logo"/>
                </a>
                <img src={rBracket} alt="error"/>
            </div>
            <h1>
                Connect. Innovate. <br></br>
                Inspire.
            </h1>
            <h2>
                IEEE AAST Student Branch
            </h2>
            <Link to="/login" className="hero-joinus-btn">
              Log In
                <svg className="hero-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </Link>
        </div>
        
    </div>
    
  );
};

export default Hero;
