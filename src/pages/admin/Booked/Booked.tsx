import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useDeleteTripsMutation,
  useGettripsQuery,
} from "@/store/api/trips";
import { useDateWiseQuery } from "@/store/api/booking";
import { toast } from "react-toastify";
import { fadeInUp, staggerChildren } from "@/utils/animations";
import { TripCard } from "../components/trips/TripCardBooked";
import { TripFilters } from "@/pages/trips/TripFilters";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/asserts/favicon.png";

const BookedPage = () => {
  const navigate = useNavigate();

  const { data = [], isLoading, error } = useGettripsQuery({});
  const [deleteTrips] = useDeleteTripsMutation();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= SALES MODAL ================= */
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");

  const {
    data: salesData,
    isFetching,
    refetch,
  } = useDateWiseQuery(date, { skip: !date });

  /* ================= FILTERED TRIPS ================= */
  const filteredTrips = useMemo(() => {
    return data.filter((trip: any) => {
      const matchesCategory =
        selectedCategory === "All" || trip.category === selectedCategory;

      const matchesSearch =
        trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.location?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [data, selectedCategory, searchQuery]);

  /* ================= PDF GENERATOR ================= */
const generateSalesPDF = () => {
  if (!salesData) return;

  // ✅ Landscape PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  /* ================= HEADER ================= */
  doc.addImage(logo, "PNG", 10, 8, 40, 18);

  doc.setFontSize(18);
  doc.text("Sunshine Holiday Packages", pageWidth / 2, 18, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.text(
    "sunshineholidaypackages@gmail.com | +91 9975375975",
    pageWidth / 2,
    25,
    { align: "center" }
  );

  doc.setFontSize(15);
  doc.text("Day-wise Sales Report", pageWidth / 2, 36, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.text(`Date: ${salesData.date ?? "N/A"}`, 14, 45);
  doc.text(`Total Bookings: ${salesData.totalBookings ?? "-"}`, 14, 52);
  doc.text(
    `Total Sales: Rs ${salesData.totalSales?.toFixed(2) ?? "0.00"}`,
    14,
    59
  );

  /* ================= TABLE DATA ================= */
  const rows: any[] = [];

  salesData.bookings.forEach((booking: any) => {
    booking.passengers.forEach((p: any) => {
      rows.push([
        p?.name || "N/A",
        p?.email || "N/A",
        p?.phoneNumber || "N/A",
        p?.age ?? "N/A",
        p?.gender || "N/A",
        p?.idProof || "N/A",
        p?.idProofNumber || "N/A",
        booking?.tripName || "N/A",
        `Rs ${booking?.tripPrice?.toFixed(2) ?? "0.00"}`,
      ]);
    });
  });

  /* ================= TABLE ================= */
  autoTable(doc, {
    startY: 68,
    head: [
      [
        "Name",
        "Email",
        "Phone",
        "Age",
        "Gender",
        "ID Proof",
        "ID Number",
        "Trip Name",
        "Price",
      ],
    ],
    body: rows,

    theme: "grid",

    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
      valign: "middle",
    },

    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      halign: "center",
      fontSize: 10,
    },

    columnStyles: {
      0: { cellWidth: 35 }, // Name
      1: { cellWidth: 50 }, // Email
      2: { cellWidth: 32 }, // Phone
      3: { cellWidth: 15, halign: "center" }, // Age
      4: { cellWidth: 22, halign: "center" }, // Gender
      5: { cellWidth: 25 }, // ID Proof
      6: { cellWidth: 32 }, // ID Number
      7: { cellWidth: 40 }, // Trip Name
      8: { cellWidth: 20, halign: "right" }, // Price
    },
  });

  doc.save(`Sales_Report_${salesData.date}.pdf`);
};



  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <h1 className="text-4xl font-bold text-gray-900">
              Discover Our Trips
            </h1>
            <p className="text-gray-600 mt-2">
              Choose from our curated adventures
            </p>
          </motion.div>

          {/* ✅ SALES BUTTON */}
          <Button onClick={() => setOpen(true)}>Generate Sales</Button>
        </div>

        {/* SEARCH */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by trip name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>
        </div>

        <TripFilters
          filterTrips={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        {/* TRIPS */}
        {isLoading ? (
          <div className="text-center mt-8">Loading trips...</div>
        ) : error ? (
          <div className="text-center mt-8 text-red-600">
            Error loading trips
          </div>
        ) : (
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8"
          >
            {filteredTrips.map((trip: any) => (
              <motion.div key={trip._id} variants={fadeInUp}>
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ================= SALES MODAL ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Day-wise Sales</DialogTitle>
          </DialogHeader>

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Button
            disabled={!date || isFetching}
            onClick={async () => {
              await refetch();
              generateSalesPDF();
            }}
          >
            {isFetching ? "Generating..." : "Generate PDF"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookedPage;
