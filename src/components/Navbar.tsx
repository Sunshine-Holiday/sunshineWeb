import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X, LogOut, Search, PlaneTakeoff } from "lucide-react";
import logo1 from "../asserts/Screen-Recording-2025-06-02-18-unscreen.gif";
import { logout, selectCurrentUser } from "@/store/reducer/auth";
import { useDispatch, useSelector } from "react-redux";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useGettripsQuery } from "@/store/api/trips";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);

  const [query, setQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { data: tripsData } = useGettripsQuery({});

  const trips = useMemo(() => {
    if (!tripsData) return [];
    return Array.isArray(tripsData) ? tripsData : tripsData?.data ?? [];
  }, [tripsData]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return trips
      .filter((t: any) => {
        const title = (t?.title ?? "").toLowerCase();
        const location = (t?.location ?? "").toLowerCase();
        return title.includes(q) || location.includes(q);
      })
      .slice(0, 5);
  }, [query, trips]);

  const goToTrip = (trip: any) => {
    navigate(`/trips/${trip._id}`, { state: { trip } });
    setQuery("");
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsLogoutModalOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="w-full bg-white shadow-md z-50"
      >
        <div className="px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link to="/">
              <img
                src={logo1}
                alt="Sunshine Holidays"
                className="h-16 w-24 object-contain"
              />
            </Link>

            {/* DESKTOP SEARCH */}
            <div className="hidden md:flex flex-1 max-w-md mx-6 relative">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trips..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              {query && (
                <div className="absolute top-11 w-full bg-white border rounded-xl shadow-lg">
                  {suggestions.length > 0 ? (
                    suggestions.map((trip: any) => (
                      <button
                        key={trip._id}
                        onClick={() => goToTrip(trip)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left"
                      >
                        <PlaneTakeoff className="w-4 h-4 text-orange-500" />

                        <div>
                          <div className="text-sm font-semibold">
                            {trip.title}
                          </div>

                          <div className="text-xs text-gray-500">
                            {trip.location}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">
                      No trips found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center space-x-6">

              {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}

              <NavLink to="/trips">Trips</NavLink>

              <NavLink to="/gallery">Gallery</NavLink>

              <NavLink to="/contact">Contact</NavLink>

              {user ? (
                <>
                  <NavLink to="/profile">Profile</NavLink>

                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/signin")}
                  className="bg-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu />
            </button>

          </div>
        </div>
      </motion.nav>

      {/* MOBILE DRAWER */}
      <Dialog.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Dialog.Portal>

          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />

          <Dialog.Content
            className={cn(
              "fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 p-6"
            )}
          >
            <div className="flex flex-col gap-6">

              <button
                className="self-end"
                onClick={() => setIsDrawerOpen(false)}
              >
                <X />
              </button>

              {/* MOBILE SEARCH */}
              <div className="relative">

                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search trips..."
                  className="w-full pl-9 pr-4 py-2 border rounded-lg"
                />

                {query && (
                  <div className="mt-2 bg-white border rounded-lg shadow">

                    {suggestions.length > 0 ? (
                      suggestions.map((trip: any) => (
                        <button
                          key={trip._id}
                          onClick={() => goToTrip(trip)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-orange-50 text-left"
                        >
                          <PlaneTakeoff className="w-4 h-4 text-orange-500" />

                          <div>
                            <div className="text-sm font-semibold">
                              {trip.title}
                            </div>

                            <div className="text-xs text-gray-500">
                              {trip.location}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500">
                        No trips found
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* MENU LINKS */}
              {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}

              <NavLink to="/trips">Trips</NavLink>

              <NavLink to="/gallery">Gallery</NavLink>

              <NavLink to="/contact">Contact</NavLink>

              {user && <NavLink to="/profile">Profile</NavLink>}

              {user ? (
                <button
                  onClick={handleLogout}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => navigate("/signin")}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                >
                  Sign In
                </button>
              )}

            </div>
          </Dialog.Content>

        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

const NavLink = ({ to, children }: any) => (
  <Link
    to={to}
    className="text-gray-700 hover:text-orange-500 font-medium transition"
  >
    {children}
  </Link>
);

export default Navbar;