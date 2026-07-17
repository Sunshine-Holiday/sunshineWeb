// import React from "react";

import { useState } from "react";
import UserManagement from "@/pages/admin/userManagement";
import { Route, Routes } from "react-router-dom";
import Sidebar, { AdminMobileBar } from "./sidebar";
import Trips from "@/pages/admin/Trips";
import Booked from "@/pages/admin/Booked";
import Gallery from "@/pages/admin/Gallery";
// import Blogs from "@/pages/admin/Blogs";
import TermAndCondition from "@/pages/admin/termAndCondition";
// import BlogCreatePage from "@/pages/admin/BlogCreate";
// import BlogEdit from "@/pages/admin/BlogEdit";
import AddGallery from "@/pages/admin/gallery/AddGallery";
import AddTrips from "@/pages/admin/trips/AdminTripForm";
import AboutPage from "@/pages/admin/aboutPage";
import EditTrips from "@/pages/admin/trips/EditTrips";
import EditPrivacy from "@/pages/admin/EditPrivacy";
import BookingDetail from "@/pages/admin/BookingDetail";
import BookedPage from "@/pages/admin/Booked/Booked";
import BookingDetails from "@/pages/admin/Booked/booking-details";
import BlockTrip from "@/pages/admin/Booked/BlockTrip";
import Special_sections from "@/pages/admin/special_sections";
import CreateSpecialSection from "@/pages/admin/CreateSpecialSection";
import EditSpecialSection from "@/pages/admin/EditSpecialSection";
import AdminHomeControl from "@/components/dashboard/Home/home";

import EditReadonlyTrips from "@/pages/admin/trips/EditReadonlytrips";
import AddReadonlyTrips from "@/pages/admin/trips/Add-readonlytrips";
import PickupLocationsPage from "@/pages/admin/PickupLocations";
import BrochuresPage from "@/pages/admin/Brochures";

/**
 * Admin shell sits flush under the sticky dual-row navbar.
 * On mobile the sidebar is a portal drawer opened from AdminMobileBar
 * so it is not clipped by overflow or buried under the site navbar.
 */
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-7rem)] w-full overflow-hidden bg-slate-50 lg:h-[calc(100dvh-7.75rem)]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileBar onOpen={() => setSidebarOpen(true)} />

        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6">
          <div className="mx-auto w-full max-w-[1400px]">
            <Routes>
              <Route path="/dashboard" element={<AdminHomeControl />} />
              <Route path="/special_sections" element={<Special_sections />} />
              <Route
                path="/trips/add-readonlytrips"
                element={<AddReadonlyTrips />}
              />
              <Route
                path="/special_sections/create"
                element={<CreateSpecialSection />}
              />
              <Route
                path="/special_sections/Edit/:id"
                element={<EditSpecialSection />}
              />

              <Route path="/users" element={<UserManagement />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy-policy" element={<EditPrivacy />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/trips/add-trips" element={<AddTrips />} />
              <Route path="/trips/edit" element={<EditTrips />} />
              <Route
                path="/trips/edit-readonly"
                element={<EditReadonlyTrips />}
              />
              <Route
                path="/pickup-locations"
                element={<PickupLocationsPage />}
              />
              <Route path="/brochures" element={<BrochuresPage />} />
              <Route path="/booked" element={<BookedPage />} />
              <Route path="/block-trip/:id" element={<BlockTrip />} />
              <Route path="/booked-data/:id" element={<Booked />} />
              <Route path="/booking-details" element={<BookingDetails />} />
              <Route path="/booked/:id" element={<BookingDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/add-gallery" element={<AddGallery />} />
              {/* <Route path="/blog" element={<Blogs />} />
          <Route path="/blog/create" element={<BlogCreatePage />} />
          <Route path="/blog/edit/:id" element={<BlogEdit />} /> */}
              <Route
                path="/term-and-condition"
                element={<TermAndCondition />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
