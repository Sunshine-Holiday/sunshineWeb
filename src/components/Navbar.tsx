import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, User, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Sunshine Holidays</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/trips">Trips</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/gallery">Gallery</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2"
              onClick={() => navigate("/signin")}
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={handleMobileMenuToggle}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/100 backdrop-blur-md shadow-md absolute top-16 w-full"
          >
            <div className="flex flex-col space-y-4 p-4">
              <NavLink to="/trips" onClick={handleMobileMenuToggle}>Trips</NavLink>
              <NavLink to="/blog" onClick={handleMobileMenuToggle}>Blog</NavLink>
              <NavLink to="/gallery" onClick={handleMobileMenuToggle}>Gallery</NavLink>
              <NavLink to="/contact" onClick={handleMobileMenuToggle}>Contact</NavLink>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2"
                onClick={() => {
                  navigate("/signin");
                  handleMobileMenuToggle();
                }}
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route transition animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
  
        </motion.div>
      </AnimatePresence>
    </motion.nav>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, onClick }) => (
  <Link
    to={to}
    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
    onClick={onClick}
  >
    {children}
  </Link>
);
