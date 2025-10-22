import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { Routes, Route } from "react-router-dom";
import Home from "./Routes/Home";
import About from "./Routes/About";
import Events from "./Routes/Events";
import JoinUs from "./Routes/JoinUs";
import Teams from "./Routes/Teams";
import Tasks from "./Routes/Tasks";
import ViewTasks from "./Routes/ViewTasks";
import Dashboard from "./Routes/Dashboard";
import Profile from "./Routes/Profile";
import MyAssignedTasks from "./Routes/MyAssignedTasks";
import Login from "./Routes/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./assets/IEEE AAST white.png";
import BackToDashboard from "./components/BackToDashboard/BackToDashboard";
import AuthTopbar from "./components/AuthTopbar/AuthTopbar";
import { useLocation } from "react-router-dom";

function App() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Clear site data ONLY when dev server starts (not on hot reloads)
    if (process.env.NODE_ENV === 'development') {
      // Check if this is a fresh server start
      const sessionStart = sessionStorage.getItem('__session_start__');
      
      if (!sessionStart) {
        console.log('🧹 [Dev Mode] Fresh server start - Clearing all site data...');
        
        // Clear everything
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Mark that we've started the session
        sessionStorage.setItem('__session_start__', Date.now().toString());
        console.log('✅ [Dev Mode] Site data cleared. You can now login fresh.');
        
        // Force reload to ensure clean state
        window.location.reload();
        return;
      }
    }
    
    // Shorter loading screen - just 1.5 seconds for smooth transition
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
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
            {/* Use AuthTopbar for protected routes instead of public Header */}
            {/* Dashboard has its own integrated navigation, no header needed */}
            {location.pathname === '/dashboard' ? null : 
              ['/tasks','/view-tasks','/profile','/my-assigned-tasks'].includes(location.pathname) ? (
                <AuthTopbar />
              ) : (
                <Header />
              )
            }
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/joinus" element={<JoinUs />} />
              <Route path="/teams" element={<Teams />} /> 
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireAdmin={false}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/view-tasks" 
                element={
                  <ProtectedRoute requireAdmin={false}>
                    <ViewTasks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requireAdmin={false}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/my-assigned-tasks" 
                element={
                  <ProtectedRoute>
                    <MyAssignedTasks />
                  </ProtectedRoute>
                }
              />
            </Routes>
            {/* Back button now integrated into AuthTopbar; keep floating only on public pages when logged in */}
            {['/dashboard','/tasks','/view-tasks','/profile','/my-assigned-tasks'].includes(location.pathname) ? null : <BackToDashboard />}
            {/* Hide Footer on protected routes */}
            {['/dashboard','/tasks','/view-tasks','/profile','/my-assigned-tasks'].includes(location.pathname) ? null : <Footer />}
            <ScrollToTop />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
