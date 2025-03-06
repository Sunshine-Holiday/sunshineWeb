import React from "react";
import Dashboard from "@/pages/admin/Dashboard";
import UserManagement from "@/pages/admin/userManagement";
import { Route, Routes } from "react-router-dom";
import Sidebar from "./sidebar";
import Trips from "@/pages/admin/Trips";
import Booked from "@/pages/admin/Booked";
import Gallery from "@/pages/admin/Gallery";
import Blogs from "@/pages/admin/Blogs";
import TermAndCondition from "@/pages/admin/termAndCondition";
import BlogCreatePage from "@/pages/admin/BlogCreate";
import BlogEdit from "@/pages/admin/BlogEdit";
import AddGallery from "@/pages/admin/gallery/AddGallery";
import AddTrips from "@/pages/admin/trips/AdminTripForm";
import AboutPage from "@/pages/admin/aboutPage";
import EditTrips from "@/pages/admin/trips/EditTrips";
import EditPrivacy from "@/pages/admin/EditPrivacy";
import BookingDetail from "@/pages/admin/BookingDetail";
import BookedPage from "@/pages/admin/Booked/Booked";
import BookingDetails from "@/pages/admin/Booked/booking-details";
import BlockTrip from "@/pages/admin/Booked/BlockTrip";
const Layout = () => {
  return (
    <div className="flex h-screen bg-background pt-14">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<EditPrivacy />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/add-trips" element={<AddTrips />} />
          <Route path="/trips/edit" element={<EditTrips />} />
          <Route path="/booked" element={<BookedPage />} />
          <Route path="/block-trip/:id" element={<BlockTrip />} />
          <Route path="/booked-data/:id" element={<Booked />} />
          <Route path="/booking-details" element={<BookingDetails />} />
          <Route path="/booked/:id" element={<BookingDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/add-gallery" element={<AddGallery />} />
          <Route path="/blog" element={<Blogs />} />
          <Route path="/blog/create" element={<BlogCreatePage />} />
          <Route path="/blog/edit/:id" element={<BlogEdit />} />
          <Route path="/term-and-condition" element={<TermAndCondition />} />
        </Routes>
      </main>
    </div>
  );
};

export default Layout;
