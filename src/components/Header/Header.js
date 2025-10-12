import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ieeeLogo from "../../assets/IEEE AAST blue.png";
import "./headerStyles.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
  };

  const scrollToContact = () => {
    if (location.pathname === '/') {
      // If on home page, scroll to contact section
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
    } else {
      // If on other pages, navigate to home first
      navigate('/');
      // Use a longer delay to ensure the page loads completely
      setTimeout(() => {
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
      }, 500);
    }
    // Close mobile menu after clicking contact
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
              className="flex items-center space-x-4"
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.6}}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={ieeeLogo} alt="IEEE AAST" className="w-full h-full object-contain"/>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">IEEE AAST Cairo</span>
                <span className="text-xs text-gray-600">Student Branch</span>
              </div>
              </div>
              <button className="md:hidden mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <CloseIcon className="h-6 w-6"/> : <MenuIcon className="h-6 w-6"/>}
              </button>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
                to="/"
                onClick={scrollToTop}
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
                to="/about"
                onClick={scrollToTop}
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            >
              About
            </Link>
            <Link
                to="/teams"
                onClick={scrollToTop}
                className={`nav-link ${isActive('/teams') ? 'active' : ''}`}
            >
              Teams
            </Link>
            <Link
                to="/events"
                onClick={scrollToTop}
                className={`nav-link ${isActive('/events') ? 'active' : ''}`}
            >
              Events
            </Link>
            <button className="nav-link" onClick={scrollToContact}>
              Contact
            </button>
            <a
                href="https://www.ieee.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="join-button"
            >
              IEEE.org
            </a>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      {isMenuOpen && (
          <motion.div
              className="md:hidden bg-white border-t shadow-lg"
              initial={{opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              onClick={() => { scrollToTop(); closeMenu(); }} 
              className={`mobile-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              onClick={() => { scrollToTop(); closeMenu(); }} 
              className={`mobile-link ${isActive('/about') ? 'active' : ''}`}
            >
              About
            </Link>
            <Link 
              to="/teams" 
              onClick={() => { scrollToTop(); closeMenu(); }} 
              className={`mobile-link ${isActive('/teams') ? 'active' : ''}`}
            >
              Teams
            </Link>
            <Link 
              to="/events" 
              onClick={() => { scrollToTop(); closeMenu(); }} 
              className={`mobile-link ${isActive('/events') ? 'active' : ''}`}
            >
              Events
            </Link>
            <button className="mobile-link" onClick={scrollToContact}>
              Contact
            </button>
            <div className="px-3 py-2">
              <a 
                href="https://www.ieee.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="join-btn"
              >
                IEEE.org
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Header;
