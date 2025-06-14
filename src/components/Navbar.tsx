import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X, LogOut } from "lucide-react";
import logo1 from "../asserts/Screen-Recording-2025-06-02-18-unscreen.gif"; // Video logo
import { logout, selectCurrentUser } from "@/store/reducer/auth";
import { useDispatch, useSelector } from "react-redux";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils"; // Utility for className concatenation (ShadCN)

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const handleDrawerToggle = () => setIsDrawerOpen((prev) => !prev);
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
        transition={{ duration: 0.5 }}
        className="w-full bg-white shadow-md  top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img
                src={logo1}
                alt="Sunshine Holiday Packages Logo"
                className="h-12 w-12 object-contain"
              />
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
              <NavLink to="/trips">Trips</NavLink>
              <NavLink to="/gallery">Gallery</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              {user ? (
                <>
                  <NavLink to="/profile">Profile</NavLink>
                  <NavLink to="/booked">Booked</NavLink>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-md hover:shadow-lg transition-shadow"
                    onClick={openLogoutModal}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => navigate("/signin")}
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </motion.button>
              )}
            </div>

            <button className="md:hidden p-2 text-gray-700 hover:text-orange-500" onClick={handleDrawerToggle}>
              {isDrawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <Dialog.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <AnimatePresence>
          {isDrawerOpen && (
            <Dialog.Portal>
              <Dialog.Overlay
                className="fixed inset-0 bg-black/40 z-50"
                asChild
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                className={cn(
                  "fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 p-6",
                  "focus:outline-none"
                )}
                asChild
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex flex-col space-y-6"
                >
                  <Dialog.Close asChild>
                    <button className="self-end p-2 text-gray-700 hover:text-orange-500">
                      <X className="h-6 w-6" />
                    </button>
                  </Dialog.Close>
                  {user?.role === "admin" && (
                    <NavLink to="/admin" onClick={handleDrawerToggle}>
                      Admin
                    </NavLink>
                  )}
                  <NavLink to="/trips" onClick={handleDrawerToggle}>
                    Trips
                  </NavLink>
                  <NavLink to="/gallery" onClick={handleDrawerToggle}>
                    Gallery
                  </NavLink>
                  <NavLink to="/contact" onClick={handleDrawerToggle}>
                    Contact
                  </NavLink>
                  {user && (
                    <>
                      <NavLink to="/profile" onClick={handleDrawerToggle}>
                        Profile
                      </NavLink>
                      <NavLink to="/booked" onClick={handleDrawerToggle}>
                        Booked
                      </NavLink>
                    </>
                  )}
                  {user ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-md hover:shadow-lg transition-shadow"
                      onClick={() => {
                        openLogoutModal();
                        handleDrawerToggle();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-md hover:shadow-lg transition-shadow"
                      onClick={() => {
                        navigate("/signin");
                        handleDrawerToggle();
                      }}
                    >
                      <User className="h-4 w-4" />
                      <span>Sign In</span>
                    </motion.button>
                  )}
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-gray-800">Confirm Logout</h2>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={closeLogoutModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        nav {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .nav-link {
          font-size: 1rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: color 0.2s ease, background-color 0.2s ease;
        }
        .nav-link:hover {
          color: #F97316;
          background-color: #FFF7ED;
          border-radius: 0.375rem;
        }
        .drawer-link {
          font-size: 1.125rem;
          font-weight: 500;
          padding: 0.5rem 0;
          transition: color 0.2s ease;
        }
        .drawer-link:hover {
          color: #F97316;
        }
      `}</style>
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
    className="nav-link text-gray-700 hover:text-orange-500 transition-colors duration-200"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;