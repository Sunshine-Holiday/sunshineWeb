import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Menu,
  X,
  LogOut,
  Search,
  Phone,
  ChevronDown,
  MapPin,
  Award,
  Users,
  PlaneTakeoff,
  LayoutGrid,
} from "lucide-react";
import logo1 from "../asserts/Screen-Recording-2025-06-02-18-unscreen.gif";
import { logout, selectCurrentUser } from "@/store/reducer/auth";
import { useDispatch, useSelector } from "react-redux";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useGettripsQuery, useSpecial_sectionsQuery } from "@/store/api/trips";
import { useTranslation } from "react-i18next";
import {
  TOUR_TYPE_LABELS,
  filterTripsByCategory,
  filterTripsByDestination,
  getCategoriesFromTrips,
  getTripDestination,
  getUniqueDestinations,
  slugify,
} from "@/utils/tripDestinations";

type OpenMenu = "tour" | "special" | "more" | "admin" | null;

const HELPLINE = "+91 9975375975";

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const [query, setQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [tourType, setTourType] = useState<string>("");
  const [hoverState, setHoverState] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const { data: tripsData } = useGettripsQuery({});
  const { data: specialSections = [] } = useSpecial_sectionsQuery({});

  const trips = useMemo(() => {
    if (!tripsData) return [];
    return Array.isArray(tripsData) ? tripsData : tripsData?.data ?? [];
  }, [tripsData]);

  const categories = useMemo(() => getCategoriesFromTrips(trips), [trips]);
  const destinations = useMemo(() => getUniqueDestinations(trips), [trips]);

  // Default tour type when opening mega menu
  useEffect(() => {
    if (categories.length && !tourType) {
      setTourType(categories[0]);
    }
  }, [categories, tourType]);

  const filteredByType = useMemo(
    () => filterTripsByCategory(trips, tourType || categories[0] || ""),
    [trips, tourType, categories]
  );

  const destinationsForType = useMemo(
    () => getUniqueDestinations(filteredByType),
    [filteredByType]
  );

  const activeState = hoverState || destinationsForType[0] || null;

  const tripsForState = useMemo(() => {
    if (!activeState) return [];
    return filterTripsByDestination(filteredByType, activeState).slice(0, 6);
  }, [filteredByType, activeState]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return trips
      .filter((tr: any) => {
        const title = (tr?.title ?? "").toLowerCase();
        const location = (tr?.location ?? "").toLowerCase();
        return title.includes(q) || location.includes(q);
      })
      .slice(0, 6);
  }, [query, trips]);

  // Close mega menu on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const goToTrip = (trip: any) => {
    navigate(`/trips/${trip._id}`, { state: { trip } });
    setQuery("");
    setOpenMenu(null);
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsLogoutModalOpen(false);
    navigate("/");
  };

  const toggleMenu = (m: OpenMenu) => {
    setOpenMenu((prev) => (prev === m ? null : m));
  };

  return (
    <>
      <div
        ref={navRef}
        className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white shadow-sm"
      >
        {/* ========== TOP BAR ========== */}
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto flex  flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <img
                src={logo1}
                alt="Sunshine Holiday Packages"
                className="h-12 w-auto object-contain sm:h-14"
              />
              <span className="hidden text-sm font-bold text-slate-900 sm:block lg:text-base">
                Sunshine Holiday Packages
              </span>
            </Link>

            {/* Search */}
            <div className="relative order-last w-full flex-1 md:order-none md:mx-4 md:max-w-md lg:max-w-lg">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("nav.searchPlaceholder") || "Search Trips"}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-200"
              />
              {query && (
                <div className="absolute top-11 z-[60] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {suggestions.length > 0 ? (
                    suggestions.map((trip: any) => (
                      <button
                        key={trip._id}
                        type="button"
                        onClick={() => goToTrip(trip)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-orange-50"
                      >
                        <PlaneTakeoff className="h-4 w-4 text-orange-500" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-800">
                            {trip.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {trip.location} · {getTripDestination(trip)}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-slate-500">
                      {t("nav.noTripsFound")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trust + helpline */}
            <div className="ml-auto hidden items-center gap-3 lg:flex">
              <div className="flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-800">
                <Award className="h-3.5 w-3.5" />
                Best Maharashtra
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                <Users className="h-3.5 w-3.5 text-orange-500" />
                100K+ Happy Travellers
              </div>
              <a
                href={`tel:${HELPLINE.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
              >
                <Phone className="h-3.5 w-3.5" />
                {HELPLINE}
              </a>
              {user ? (
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("nav.logout")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/signin")}
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                >
                  <User className="h-3.5 w-3.5" />
                  {t("nav.signIn")}
                </button>
              )}
            </div>

            {/* Mobile controls */}
            <div className="ml-auto flex items-center gap-2 lg:hidden">
              <a
                href={`tel:${HELPLINE.replace(/\s/g, "")}`}
                className="rounded-full bg-orange-500 p-2 text-white"
              >
                <Phone className="h-4 w-4" />
              </a>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-slate-100"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* ========== BOTTOM NAV (desktop) ========== */}
        <div className="relative hidden border-b border-slate-100 bg-slate-50/80 lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
            {user?.role === "admin" && (
              <NavItem
                label={t("nav.admin")}
                active={openMenu === "admin"}
                onClick={() => toggleMenu("admin")}
                hasDropdown
              />
            )}

            <NavItem
              label="Tour"
              active={openMenu === "tour"}
              onClick={() => toggleMenu("tour")}
              hasDropdown
            />

            <NavItem
              label="Special trips"
              active={openMenu === "special"}
              onClick={() => toggleMenu("special")}
              hasDropdown
            />

            <Link
              to="/gallery"
              className="px-4 py-3 text-sm font-semibold text-slate-700 transition hover:text-orange-600"
              onClick={() => setOpenMenu(null)}
            >
              {t("nav.gallery")}
            </Link>

            <Link
              to="/contact"
              className="px-4 py-3 text-sm font-semibold text-slate-700 transition hover:text-orange-600"
              onClick={() => setOpenMenu(null)}
            >
              {t("nav.contact")}
            </Link>

            <NavItem
              label="More"
              active={openMenu === "more"}
              onClick={() => toggleMenu("more")}
              hasDropdown
            />

            {user && (
              <Link
                to="/profile"
                className="ml-auto px-4 py-3 text-sm font-semibold text-slate-700 hover:text-orange-600"
                onClick={() => setOpenMenu(null)}
              >
                {t("nav.profile")}
              </Link>
            )}
          </div>

          {/* ---- Tour mega menu ---- */}
          {openMenu === "tour" && (
            <div className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white shadow-2xl">
              <div className="mx-auto grid max-w-7xl grid-cols-12 gap-0 px-4 py-5 sm:px-6 lg:px-8">
                {/* Tour types */}
                <div className="col-span-3 border-r border-slate-100 pr-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-600">
                    Tour Types
                  </p>
                  <ul className="space-y-1">
                    {categories.map((cat) => (
                      <li key={cat}>
                        <button
                          type="button"
                          onMouseEnter={() => setTourType(cat)}
                          onClick={() => {
                            setTourType(cat);
                            navigate(`/trips?category=${encodeURIComponent(cat)}`);
                            setOpenMenu(null);
                          }}
                          className={cn(
                            "w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition",
                            tourType === cat
                              ? "bg-orange-50 text-orange-700"
                              : "text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {TOUR_TYPE_LABELS[cat] || cat}
                        </button>
                      </li>
                    ))}
                    <li>
                      <Link
                        to="/trips"
                        onClick={() => setOpenMenu(null)}
                        className="mt-2 block px-3 py-2 text-sm font-semibold text-orange-600 hover:underline"
                      >
                        View all trips →
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Destinations / States grid */}
                <div className="col-span-5 px-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-600">
                    Tours
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {destinationsForType.map((dest) => {
                      const count = filterTripsByDestination(
                        filteredByType,
                        dest
                      ).length;
                      const thumb = filterTripsByDestination(
                        filteredByType,
                        dest
                      )[0];
                      const img =
                        thumb?.banner ||
                        thumb?.banners?.[0] ||
                        null;
                      return (
                        <button
                          key={dest}
                          type="button"
                          onMouseEnter={() => setHoverState(dest)}
                          onClick={() => {
                            navigate(`/destinations/${slugify(dest)}`);
                            setOpenMenu(null);
                          }}
                          className={cn(
                            "group relative overflow-hidden rounded-xl border text-center transition",
                            activeState === dest
                              ? "border-orange-400 shadow-md ring-2 ring-orange-200"
                              : "border-slate-200 hover:border-orange-300 hover:shadow-sm"
                          )}
                        >
                          <div className="relative h-16 w-full bg-gradient-to-br from-orange-100 to-amber-50">
                            {img ? (
                              <img
                                src={img}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <MapPin className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-orange-400" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          </div>
                          <div className="bg-white px-2 py-2">
                            <div
                              className={cn(
                                "truncate text-xs font-bold",
                                activeState === dest
                                  ? "text-orange-700"
                                  : "text-slate-800"
                              )}
                            >
                              {dest}
                            </div>
                            <div className="text-[10px] font-medium text-slate-500">
                              {count} tour{count === 1 ? "" : "s"}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {destinationsForType.length === 0 && (
                      <p className="col-span-3 text-sm text-slate-500">
                        No destinations for this tour type yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview trips for hovered state */}
                <div className="col-span-4 border-l border-slate-100 pl-4">
                  <p className="mb-3 text-sm font-bold text-slate-900">
                    {activeState || "Select destination"}
                  </p>
                  {activeState ? (
                    <>
                      <ul className="max-h-64 space-y-0.5 overflow-y-auto">
                        {tripsForState.map((trip: any) => {
                          const days =
                            trip.durationDays ||
                            trip.days ||
                            (String(trip.duration || "").match(/(\d+)/)?.[1]
                              ? `${String(trip.duration).match(/(\d+)/)?.[1]}D`
                              : "1D");
                          const badge =
                            typeof days === "number" ? `${days}D` : days;
                          return (
                            <li key={trip._id}>
                              <button
                                type="button"
                                onClick={() => goToTrip(trip)}
                                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2.5 text-left hover:bg-orange-50"
                              >
                                <span className="flex min-w-0 items-start gap-2">
                                  <LayoutGrid className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                                  <span className="text-sm font-medium text-slate-800 line-clamp-2">
                                    {trip.title}
                                  </span>
                                </span>
                                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                  {badge}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                        {tripsForState.length === 0 && (
                          <li className="text-sm text-slate-500">
                            No tours listed.
                          </li>
                        )}
                      </ul>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/destinations/${slugify(activeState)}`);
                          setOpenMenu(null);
                        }}
                        className="mt-3 w-full rounded-xl border-2 border-orange-500 bg-white py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-500 hover:text-white"
                      >
                        See more
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Hover a destination to preview tours.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---- Special trips dropdown ---- */}
          {openMenu === "special" && (
            <div className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white shadow-xl">
              <div className="mx-auto flex max-w-7xl flex-wrap gap-4 px-4 py-5 sm:px-6 lg:px-8">
                <Link
                  to="/#special-trips"
                  onClick={() => setOpenMenu(null)}
                  className="w-52 rounded-xl border border-orange-100 bg-orange-50 p-4 transition hover:border-orange-300 hover:shadow-sm"
                >
                  <p className="text-sm font-bold text-orange-800">
                    Special trips
                  </p>
                  <p className="mt-1 text-xs text-orange-700/80">
                    Special trips designed for special persons
                  </p>
                </Link>
                <div className="flex flex-wrap gap-2">
                  {(specialSections as any[]).length > 0 ? (
                    (specialSections as any[]).map((sec) => (
                      <Link
                        key={sec._id}
                        to={`/#special-${sec._id}`}
                        onClick={() => setOpenMenu(null)}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-orange-300 hover:bg-orange-50"
                      >
                        {sec.title}
                      </Link>
                    ))
                  ) : (
                    <>
                      {[
                        "Special Summer trips",
                        "Special Winter trips",
                        "Special Monsoon trips",
                        "Special Beach trips",
                      ].map((label) => (
                        <Link
                          key={label}
                          to="/#special-trips"
                          onClick={() => setOpenMenu(null)}
                          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-orange-300 hover:bg-orange-50"
                        >
                          {label}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---- More dropdown ---- */}
          {openMenu === "more" && (
            <div className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white shadow-xl">
              <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-4 sm:px-6 lg:px-8">
                {[
                  { label: "Testimonial", to: "/#testimonials" },
                  { label: "About Us", to: "/about-us" },
                  { label: "Privacy Policy", to: "/privacy-policy" },
                  { label: "Terms & Conditions", to: "/terms-condition" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpenMenu(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-orange-300 hover:bg-orange-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ---- Admin dropdown ---- */}
          {openMenu === "admin" && user?.role === "admin" && (
            <div className="absolute left-0 top-full z-50 min-w-[240px] rounded-b-xl border border-t-0 border-slate-200 bg-white py-2 shadow-xl sm:left-4 lg:left-[max(1rem,calc((100%-80rem)/2+1rem))]">
              <div className="flex flex-col">
                {[
                  { label: "Home Layout", to: "/admin/dashboard" },
                  { label: "Trips", to: "/admin/trips" },
                  { label: "Special Sections", to: "/admin/special_sections" },
                  { label: "Bookings", to: "/admin/booked" },
                  { label: "Gallery", to: "/admin/gallery" },
                  { label: "Locations", to: "/admin/pickup-locations" },
                  { label: "Terms & Conditions", to: "/admin/term-and-condition" },
                  { label: "More →", to: "/admin/users" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpenMenu(null)}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("nav.logout")}?
            </h3>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                onClick={handleLogout}
              >
                {t("nav.logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      <Dialog.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Dialog.Content className="fixed top-0 right-0 z-50 flex h-full w-80 flex-col overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-slate-900">Menu</span>
              <button type="button" onClick={() => setIsDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <MobileLink to="/trips" onClick={() => setIsDrawerOpen(false)}>
                All Tours
              </MobileLink>
              {categories.map((cat) => (
                <MobileLink
                  key={cat}
                  to={`/trips?category=${encodeURIComponent(cat)}`}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  {TOUR_TYPE_LABELS[cat] || cat}
                </MobileLink>
              ))}
              <p className="px-2 pt-3 text-xs font-bold uppercase text-orange-600">
                Destinations
              </p>
              {destinations.slice(0, 12).map((d) => (
                <MobileLink
                  key={d}
                  to={`/destinations/${slugify(d)}`}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  {d}
                </MobileLink>
              ))}
              <MobileLink to="/gallery" onClick={() => setIsDrawerOpen(false)}>
                {t("nav.gallery")}
              </MobileLink>
              <MobileLink to="/contact" onClick={() => setIsDrawerOpen(false)}>
                {t("nav.contact")}
              </MobileLink>
              <MobileLink to="/about-us" onClick={() => setIsDrawerOpen(false)}>
                About Us
              </MobileLink>
              {user?.role === "admin" && (
                <MobileLink
                  to="/admin/dashboard"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Admin
                </MobileLink>
              )}
              {user ? (
                <>
                  <MobileLink
                    to="/profile"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {t("nav.profile")}
                  </MobileLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate("/signin");
                  }}
                  className="mt-2 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white"
                >
                  {t("nav.signIn")}
                </button>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

function NavItem({
  label,
  active,
  onClick,
  hasDropdown,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  hasDropdown?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-4 py-3 text-sm font-semibold transition",
        active
          ? "border-b-2 border-orange-500 text-orange-600"
          : "border-b-2 border-transparent text-slate-700 hover:text-orange-600"
      )}
    >
      {label}
      {hasDropdown && (
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition", active && "rotate-180")}
        />
      )}
    </button>
  );
}

function MobileLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-orange-50"
    >
      {children}
    </Link>
  );
}

export default Navbar;
