import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetIDbookingQuery } from "@/store/api/booking";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../asserts/favicon.png";
import { FaSpinner } from "react-icons/fa";

const BookingDetail = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetIDbookingQuery({ id });
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (data && data.booking) {
      const selectedBooking = data.booking;
      setBooking(selectedBooking);
    }
  }, [data, id]);

  const totalAmount = booking?.selectedSeats?.length * (booking?.trip?.price || 0);
  const gst = totalAmount * 0.05; // 5% GST
  const finalAmount = totalAmount + gst;

  const handleDownloadInvoice = () => {
    if (booking) {
      const doc = new jsPDF() as any;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add logo with cropping
      const img = new Image();
      img.src = logo;
      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const aspectRatio = imgWidth / imgHeight;

        // Define desired display size
        let width = 40,
          height = 20;
        if (aspectRatio > 1) height = width / aspectRatio;
        else width = height * aspectRatio;

        // Define cropping parameters (e.g., crop 20% from each side)
        const cropX = imgWidth * 0.2; // Start 20% from the left
        const cropY = imgHeight * 0.2; // Start 20% from the top
        const cropWidth = imgWidth * 0.6; // Use 60% of the width
        const cropHeight = imgHeight * 0.6; // Use 60% of the height

        // Add cropped image to PDF
        doc.addImage(
          img,
          "PNG",
          10,
          10,
          width,
          height,
          undefined,
          undefined,
          0,
          cropX,
          cropY,
          cropWidth,
          cropHeight
        );

        // Add company details
        doc.setFontSize(16);
        doc.text("Sunshine Holiday Packages", pageWidth / 2, 20, {
          align: "center",
        });
        doc.setFontSize(10);
        doc.text(
          "For inquiries: sunshineholidaypackages@gmail.com",
          pageWidth / 2,
          25,
          { align: "center" }
        );
        doc.text(
          "Phone: +91 9975375975 / +91 9175757178 | Website: www.sunshineholidaypackages.com",
          pageWidth / 2,
          30,
          { align: "center" }
        );

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
            [
              "Price per seat",
              `INR ${booking?.trip?.price || 0}*${booking?.selectedSeats?.length || 0}`,
            ],
            ["Subtotal", `INR ${totalAmount.toFixed(2)}`],
            ["GST (5%)", `INR ${gst.toFixed(2)}`],
            ["Total Amount", `INR ${finalAmount.toFixed(2)}`],
            ["User Email", booking.user?.email || "N/A"],
            ["Selected Date", booking?.selectedDate || "N/A"],
            ["Selected Seats", booking?.selectedSeats?.join(", ") || "N/A"],
          ],
          theme: "striped",
          styles: { fontSize: 10 },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: "auto" } },
        });

        // Boarding Points Table
        const boardingStartY = doc.autoTable.previous.finalY + 10;
        doc.text("Boarding Points:", 10, boardingStartY);

        if (booking.trip?.boardingPoints && booking.trip.boardingPoints.length > 0) {
          doc.autoTable({
            startY: boardingStartY + 5,
            head: [["Location", "Time", "Details"]],
            body: booking.trip.boardingPoints.map((point: any) => [
              point.location || "N/A",
              point.time || "N/A",
              point.details || "N/A",
            ]),
            theme: "grid",
            styles: { fontSize: 10 },
          });
        } else {
          doc.autoTable({
            startY: boardingStartY + 5,
            head: [["Location", "Time", "Details"]],
            body: [["No boarding points available", "", ""]],
            theme: "grid",
            styles: { fontSize: 10 },
          });
        }

        // Passengers Table
        const passengersStartY = doc.autoTable.previous.finalY + 10;
        doc.text("Passengers:", 10, passengersStartY);

        if (booking.passengers && booking.passengers.length > 0) {
          doc.autoTable({
            startY: passengersStartY + 5,
            head: [["Name", "Age", "Gender", "Boarding Point", "ID Proof"]],
            body: booking.passengers.map((passenger: any) => [
              passenger.name || "Unnamed",
              passenger.age || "N/A",
              passenger.gender || "N/A",
              passenger.address || "N/A",
              `${passenger.idProof || "N/A"} (${passenger.idProofNumber || "N/A"})`,
            ]),
            theme: "grid",
            styles: { fontSize: 10 },
          });
        } else {
          doc.autoTable({
            startY: passengersStartY + 5,
            head: [["Name", "Age", "Gender", "Boarding Point", "ID Proof"]],
            body: [["No passenger details available", "", "", "", ""]],
            theme: "grid",
            styles: { fontSize: 10 },
          });
        }

        // Add footer
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8);
        doc.text(
          "Thank you for choosing Sunshine Holiday Packages!",
          pageWidth / 2,
          footerY,
          { align: "center" }
        );

        // Save PDF
        doc.save(`Invoice_${booking._id}.pdf`);
      };
    }
  };

  const renderWebInvoice = () => {
    return (
      <div className="mx-auto max-w-4xl bg-white p-8 shadow-lg rounded-lg text-center my-8">
        <div className="mb-8">
          {/* Cropped logo using a container with overflow hidden */}
          <div
            className="mx-auto relative"
            style={{
              width: "100px", // Container width
              height: "60px", // Container height
              overflow: "hidden",
            }}
          >
            <img
              src={logo}
              alt="Sunshine Holiday Packages"
              className="absolute"
              style={{
                width: "140px", // Larger than container to allow cropping
                height: "auto",
                top: "-10px", // Adjust to crop top
                left: "-20px", // Adjust to crop left
              }}
            />
          </div>
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
                  {booking.trip.title || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Location
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.trip.location || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Price per seat
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  ₹{booking?.trip?.price || 0} * {booking?.selectedSeats?.length || 0}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Subtotal
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  ₹{totalAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  GST (5%)
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  ₹{gst.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-gray-100 font-semibold">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Total Amount
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  ₹{finalAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  User Email
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.user.email || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Selected Date
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.selectedDate || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Selected Seats
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.selectedSeats?.join(", ") || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Boarding Points Section */}
        <h3 className="text-xl font-semibold mb-4">Boarding Points</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Location</th>
                <th className="border border-gray-300 px-4 py-2">Time</th>
                <th className="border border-gray-300 px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {booking.trip.boardingPoints && booking.trip.boardingPoints.length > 0 ? (
                booking.trip.boardingPoints.map((point: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {point.location || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {point.time || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {point.details || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="border border-gray-300 px-4 py-2 text-center">
                    No boarding points available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Passengers Section */}
        <h3 className="text-xl font-semibold mb-4">Passengers</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Age</th>
                <th className="border border-gray-300 px-4 py-2">Gender</th>
                <th className="border border-gray-300 px-4 py-2">
                  Boarding Point
                </th>
                <th className="border border-gray-300 px-4 py-2">ID Proof</th>
              </tr>
            </thead>
            <tbody>
              {booking.passengers && booking.passengers.length > 0 ? (
                booking.passengers.map((passenger: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {passenger.name || "Unnamed"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {passenger.age || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {passenger.gender || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {passenger.address || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {passenger.idProof || "N/A"} - {passenger.idProofNumber || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-4 py-2 text-center">
                    No passenger details available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleDownloadInvoice}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
        >
          Download Invoice (PDF)
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  if (isError) {
    console.error(error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error fetching booking details.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="w-full px-4 flex justify-center">
        {booking ? (
          renderWebInvoice()
        ) : (
          <div>No booking found with the provided ID.</div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;