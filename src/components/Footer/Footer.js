import React from "react";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { FaTiktok } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ieeeWhiteLogo from "../../assets/IEEE AAST white.png";
import "./footerStyles.css";

const Footer = () => {
  const d = new Date();

  return (
    <footer>
      <div className="container">
        <div className="grid">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="logo-box">
                <img src={ieeeWhiteLogo} alt="IEEE AAST" className="logo-image" />
              </div>
              <div className="brand-text">
                <span className="brand-title">IEEE AAST Cairo</span>
                <span className="brand-subtitle">Student Branch</span>
              </div>
            </div>
            <p className="description">
              Empowering the next generation of engineers and innovators through education, networking, and
              professional development.
            </p>
          </motion.div>

          <motion.div
            className="footer-right-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="ieee-resources">
              <h3 className="section-title">IEEE Resources</h3>
              <div className="link-list">
                <a href="https://ieeexplore.ieee.org/Xplore/home.jsp" target="_blank" rel="noopener noreferrer" className="link-item">
                  IEEE Xplore
                </a>
                <a href="https://standards.ieee.org/" target="_blank" rel="noopener noreferrer" className="link-item">
                  IEEE Standards
                </a>
                <a href="https://spectrum.ieee.org/" target="_blank" rel="noopener noreferrer" className="link-item">
                  IEEE Spectrum
                </a>
                <a href="https://www.ieee.org/membership/join" target="_blank" rel="noopener noreferrer" className="link-item">
                  IEEE Membership
                </a>
              </div>
            </div>

            <div className="connect-section">
              <h3 className="section-title">Connect With Us</h3>
              <div className="social-links">
                <a
                  href="https://www.instagram.com/ieeeaastcsb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Follow us on Instagram"
                >
                  <InstagramIcon className="social-icon" aria-hidden="true" />
                  <span className="social-label">Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=100084582138491"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Follow us on Facebook"
                >
                  <FacebookIcon className="social-icon" aria-hidden="true" />
                  <span className="social-label">Facebook</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/ieee-aast-cairo-sb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Connect with us on LinkedIn"
                >
                  <LinkedInIcon className="social-icon" aria-hidden="true" />
                  <span className="social-label">LinkedIn</span>
                </a>
                <a
                  href="https://www.tiktok.com/@ieee.aast.cairo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Follow us on TikTok"
                >
                  <FaTiktok className="social-icon" aria-hidden="true" />
                  <span className="social-label">TikTok</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="border-t"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="copyright-container">
            <p className="copyright-text">&copy; {d.getFullYear()} IEEE AAST Cairo Student Branch. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
