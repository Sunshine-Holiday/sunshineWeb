import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X, LogOut } from "lucide-react";
import logo1 from "../asserts/logo_sunshine.gif"; // Video logo
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
        className="w-full bg-white/70 backdrop-blur-sm z-50 shadow-sm  top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img
                src={logo1}
                alt="Sunshine Holiday Packages Logo"
                className="h-14 w-14 sm:h-24 sm:w-24 md:h-20 md:w-20"
              />
            </Link>

            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
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

            <button className="md:hidden p-2" onClick={handleDrawerToggle}>
              {isDrawerOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      <Dialog.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <AnimatePresence>
          {isDrawerOpen && (
            <Dialog.Portal>
              <Dialog.Overlay
                className="fixed inset-0 bg-black/50 z-50"
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
                  "fixed top-0 right-0 h-full w-64 bg-white/90 backdrop-blur-sm shadow-lg z-50 p-6",
                  "focus:outline-none"
                )}
                asChild
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex flex-col space-y-4"
                >
                  <Dialog.Close asChild>
                    <button className="self-end p-2">
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
                      className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-md self-start"
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
                      className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-md self-start"
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