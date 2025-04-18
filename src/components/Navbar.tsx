import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X, LogOut } from "lucide-react";
import logo1 from "../asserts/MRNJ1288.MP4"; // Video logo
import { logout, selectCurrentUser } from "@/store/reducer/auth";
import { useDispatch, useSelector } from "react-redux";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const handleMobileMenuToggle = () => setIsMobileMenuOpen(prev => !prev);
  const handleLogout = () => {
    dispatch(logout());
    setIsLogoutModalOpen(false);
    navigate("/");
  };
  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full bg-white/70 backdrop-blur-sm z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <video
                src={logo1}
                className="h-10 w-10 sm:h-16 sm:w-16 md:h-15 md:w-15 rounded-full"
                autoPlay
                loop
                muted
                playsInline
              />
              <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 truncate max-w-xs">
                Sunshine Holiday Packages
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
              <NavLink to="/trips">Trips</NavLink>
              <NavLink to="/blog">Blog</NavLink>
              <NavLink to="/gallery">Gallery</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              {user ? (
                <>
                  <NavLink to="/profile">Profile</NavLink>
                  <NavLink to="/booked">Booked</NavLink>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base rounded-full flex items-center space-x-1 lg:space-x-2 shadow-md"
                    onClick={openLogoutModal}
                  >
                    <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span>Logout</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base rounded-full flex items-center space-x-1 lg:space-x-2 shadow-md"
                  onClick={() => navigate("/signin")}
                >
                  <User className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span>Sign In</span>
                </motion.button>
              )}
            </div>

            <button className="md:hidden p-2" onClick={handleMobileMenuToggle}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white/90 backdrop-blur-sm shadow-md absolute top-16 w-full"
            >
              <div className="flex flex-col space-y-4 p-4">
                {user?.role === "admin" && (
                  <NavLink to="/admin" onClick={handleMobileMenuToggle}>Admin</NavLink>
                )}
                <NavLink to="/trips" onClick={handleMobileMenuToggle}>Trips</NavLink>
                <NavLink to="/blog" onClick={handleMobileMenuToggle}>Blog</NavLink>
                <NavLink to="/gallery" onClick={handleMobileMenuToggle}>Gallery</NavLink>
                <NavLink to="/contact" onClick={handleMobileMenuToggle}>Contact</NavLink>
                {user && (
                  <>
                    <NavLink to="/profile" onClick={handleMobileMenuToggle}>Profile</NavLink>
                    <NavLink to="/booked" onClick={handleMobileMenuToggle}>Booked</NavLink>
                  </>
                )}
                {user ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-md self-start"
                    onClick={() => {
                      openLogoutModal();
                      handleMobileMenuToggle();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-md self-start"
                    onClick={() => {
                      navigate("/signin");
                      handleMobileMenuToggle();
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Logout
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
                  onClick={closeLogoutModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
