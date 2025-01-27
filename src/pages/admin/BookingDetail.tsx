import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetIDbookingQuery } from "@/store/api/booking";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../asserts/Sunshine.png"; // Adjust the path based on your project structure

const BookingDetail = () => {
  const { id } = useParams(); // Get the booking ID from the URL
  const { data, isLoading, isError, error } = useGetIDbookingQuery({ id }); // Adjust the query to get individual booking
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (data && data.booking) {
      const selectedBooking = data.booking;
      setBooking(selectedBooking);
    }
  }, [data, id]);

  const handleDownloadInvoice = () => {
    if (booking) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
  
      // Add logo
      const img = new Image();
      img.src = logo;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let width = 40, height = 20;
        if (aspectRatio > 1) height = width / aspectRatio;
        else width = height * aspectRatio;
        doc.addImage(img, "PNG", 10, 10, width, height);
  
        // Add company details
        doc.setFontSize(16);
        doc.text("Sunshine Holiday Packages", pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text("For inquiries: sunshineholidaypackages@gmail.com", pageWidth / 2, 25, { align: "center" });
        doc.text("Phone: +91 9975375975 / +91 9175757178 | Website: www.sunshineholidaypackages.com", pageWidth / 2, 30, { align: "center" });
  
        // Add Invoice title
        doc.setFontSize(14);
        doc.text("Invoice", pageWidth / 2, 40, { align: "center" });
  
        // Booking Details Table
        doc.setFontSize(12);
        doc.text("Booking Details:", 10, 50);
        doc.autoTable({
          startY: 55,
          head: [["Field", "Details"]],
          body: [
            ["Booking ID", booking._id],
            ["Trip Title", booking.trip?.title || "N/A"],
            ["Location", booking.trip?.location || "N/A"],
            ["Price", `INR ${booking.price || 0}`],
            ["User Email", booking.user?.email || "N/A"],
            ["Selected Date", new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(booking.selectedDate))],
            ["Selected Seats", booking.selectedSeats.join(", ")],
          ],
          theme: "striped",
          styles: { fontSize: 10 },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: "auto" } },
        });
  
        // Passengers Table
        const passengersStartY = doc.autoTable.previous.finalY + 10;
        doc.text("Passengers:", 10, passengersStartY);
        doc.autoTable({
          startY: passengersStartY + 5,
          head: [["Name", "Age", "Gender", "Address", "ID Proof"]],
          body: booking.passengers.map((passenger) => [
            passenger.name || "Unnamed",
            passenger.age || "N/A",
            passenger.gender || "N/A",
            passenger.address || "N/A",
            `${passenger.idProof || "N/A"} (${passenger.idProofNumber || "N/A"})`,
          ]),
          theme: "grid",
          styles: { fontSize: 10 },
        });
  
        // Add footer
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8);
        doc.text("Thank you for choosing Sunshine Holiday Packages!", pageWidth / 2, footerY, { align: "center" });
  
        // Save PDF
        doc.save(`Invoice_${booking._id}.pdf`);
      };
    }
  };
  
  
  

  const renderWebInvoice = () => {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg text-center">
        <div className="mb-8">
          <img
            src={logo}
            alt="Sunshine Holiday Packages"
            className="w-24 h-auto mx-auto"
          />
          <h3 className="text-2xl font-semibold mt-4">
            Sunshine Holiday Packages
          </h3>
          <p className="text-gray-600 mt-2">
            For inquiries: sunshineholidaypackages@gmail.com
          </p>
          <p className="text-gray-600">
            Phone: +91 9975375975 / +91 9175757178 | Website:
            www.sunshineholidaypackages.com
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">Invoice</h2>

        <div className="mb-6">
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Booking ID
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking._id}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Trip Title
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.trip.title}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Location
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.trip.location}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Price
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  ₹{booking.price}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  User Email
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.user.email}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Selected Date
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(booking.selectedDate).toLocaleString()}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Selected Seats
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.selectedSeats.join(", ")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mb-4">Passengers</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Age</th>
              <th className="border border-gray-300 px-4 py-2">Gender</th>
              <th className="border border-gray-300 px-4 py-2">Address</th>
              <th className="border border-gray-300 px-4 py-2">ID Proof</th>
            </tr>
          </thead>
          <tbody>
            {booking.passengers.map((passenger, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">
                  {passenger.name || "Unnamed"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {passenger.age}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {passenger.gender}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {passenger.address}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {passenger.idProof} ({passenger.idProofNumber})
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={handleDownloadInvoice}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Download Invoice (PDF)
        </button>
      </div>
    );
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center">
        Error fetching booking details.
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      {booking ? (
        renderWebInvoice()
      ) : (
        <div>No booking found with the provided ID.</div>
      )}
    </div>
  );
};

export default BookingDetail;
