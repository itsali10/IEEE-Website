import React from 'react';
import { motion } from 'framer-motion';
import UsersIcon from '@mui/icons-material/People';
import BookOpenIcon from '@mui/icons-material/MenuBook';
import NetworkIcon from '@mui/icons-material/AccountTree';
import "./ourImpactStyles.css";

const OurImpact = () => {
  const stats = [
    { number: "130+", label: "Active Members", icon: UsersIcon },
    { number: "50+", label: "Events", icon: BookOpenIcon },
    { number: "25+", label: "Industry Partners", icon: NetworkIcon },
  ];

  return (
    <section className="our-impact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge">
            Our Impact
          </div>
          <h2 className="section-title">
            Making a Difference in Engineering Education
          </h2>
        </motion.div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="stat-icon-container">
                <stat.icon className="stat-icon" />
              </div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurImpact; 