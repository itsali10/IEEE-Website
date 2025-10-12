import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { Routes, Route } from "react-router-dom";
import Home from "./Routes/Home";
import About from "./Routes/About";
import Events from "./Routes/Events";
import JoinUs from "./Routes/JoinUs";
import Teams from "./Routes/Teams"; // ✅ import Teams page
import Tasks from "./Routes/Tasks"; // ✅ import Tasks page
import Questionnaire from "./Routes/Questionnaire"; // ✅ import Questionnaire page

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./assets/IEEE AAST white.png";

function App() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {showLoadingScreen ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          transition={{ delay: 1, duration: 0.5 }}
          className="loading-screen"
        >
          <motion.div className="loading-screen-image-container">
            <img src={logo} alt="IEEE AAST" />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div key="app" className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/joinus" element={<JoinUs />} />
            <Route path="/teams" element={<Teams />} /> {/* ✅ Teams Route */}
            <Route path="/tasks" element={<Tasks />} /> {/* ✅ Tasks Route now public */}
            <Route path="/questionnaire" element={<Questionnaire />} /> {/* ✅ Questionnaire Route */}
          </Routes>
          <Footer />
          <ScrollToTop />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
