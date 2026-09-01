import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetIDbookingQuery } from "@/store/api/booking";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../asserts/favicon.png";
import { FaSpinner } from "react-icons/fa";

interface Package {
  _id: string;
  title: string;
  description: string;
  personCount: number;
  price: number;
}

interface RoomChoice {
  _id: string;
  description: string;
  personCount: number;
  roomCount: number;
  price: number;
}

interface Booking {
  _id: string;
  trip: {
    title: string;
    location: string;
    price: string;
    boardingPoints: { location: string; time: string; details: string }[];
    packages: Package[];
    roomChoices: RoomChoice[];
  };
  user: { email: string; username: string; phone: string };
  selectedDate: string;
  selectedSeats: string[];
  selectedPackage: string | null;
  selectedRoomChoice: string | null;
  paymentStatus: string;
  advancePaid: number;
  remainingBalance: number;
  passengers: {
    name: string;
    age: string;
    gender: string;
    address: string;
    idProof: string;
    idProofNumber: string;
    phoneNumber: string;
  }[];
}

const BookingDetail = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetIDbookingQuery({ id });
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (data && data.booking) {
      setBooking(data.booking);
      console.log("Selected Booking:", data.booking);
    }
  }, [data, id]);

  // Price calculations
  const baseSeatPrice = booking?.trip?.price ? parseInt(booking.trip.price) : 1000;
  const selectedPackage = booking?.selectedPackage
    ? booking.trip.packages.find((pkg) => pkg._id === booking.selectedPackage)
    : null;
  const selectedRoomChoice = booking?.selectedRoomChoice
    ? booking.trip.roomChoices.find((room) => room._id === booking.selectedRoomChoice)
    : null;
  const numPassengers = booking?.passengers?.length || 0;
  const basePrice = selectedPackage ? selectedPackage.price : baseSeatPrice * numPassengers;
  const roomPrice = selectedRoomChoice ? selectedRoomChoice.price : 0;
  const totalPrice = basePrice + roomPrice;
  const gst = totalPrice * 0.05; // 5% GST
  const finalAmount = totalPrice + gst;

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

        // Define cropping parameters (20% from each side)
        const cropX = imgWidth * 0.2;
        const cropY = imgHeight * 0.2;
        const cropWidth = imgWidth * 0.6;
        const cropHeight = imgHeight * 0.6;

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
            ["Selected Date", booking.selectedDate || "N/A"],
            ["Selected Seats", booking.selectedSeats?.join(", ") || "N/A"],
            [
              "Package",
              selectedPackage
                ? `${selectedPackage.title} (Rs ${selectedPackage.price.toLocaleString("en-IN")})`
                : "None",
            ],
            [
              "Room Choice",
              selectedRoomChoice
                ? `${selectedRoomChoice.description} (Rs ${selectedRoomChoice.price.toLocaleString("en-IN")})`
                : "None",
            ],
            [
              selectedPackage ? "Package Price" : "Seat Price",
              `Rs ${basePrice.toLocaleString("en-IN")}`,
            ],
            ["Room Price", `Rs ${roomPrice.toLocaleString("en-IN")}`],
            // ["Subtotal", `Rs ${totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
            // ["GST (5%)", `Rs ${gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
            ["Total Amount", `Rs ${booking.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
            ["Payment Status", booking.paymentStatus || "N/A"],
            ["Advance Paid", `Rs ${booking.advancePaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
            ["Remaining Balance", `Rs ${booking.remainingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
            ["User", booking.user?.username || "N/A"],
            ["Email", booking.user?.email || "N/A"],
            ["Phone", booking.user?.phone || "N/A"],
          ],
          theme: "striped",
          styles: { fontSize: 10 },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: "auto" } },
        });

        // Boarding Points Table
        const boardingStartY = doc.autoTable.previous.finalY + 10;
        doc.text("Boarding Points (Pickup):", 10, boardingStartY);

        if (booking.trip?.boardingPoints && booking.trip.boardingPoints.length > 0) {
          doc.autoTable({
            startY: boardingStartY + 5,
            head: [["Location", "Date", "Time", "Details"]],
            body: booking.trip.boardingPoints.map((point: any) => [
              point.location || "N/A",
              point.date || "—",
              point.time || "N/A",
              point.details || "—",
            ]),
            theme: "grid",
            styles: { fontSize: 10 },
          });
        } else {
          doc.autoTable({
            startY: boardingStartY + 5,
            head: [["Location", "Date", "Time", "Details"]],
            body: [["No boarding points available", "", "", ""]],
            theme: "grid",
            styles: { fontSize: 10 },
          });
        }

        // Drop Points Table
        let currentY = doc.autoTable.previous.finalY + 10;
        if (booking.trip?.dropPoints && booking.trip.dropPoints.length > 0) {
          doc.text("Drop Locations:", 10, currentY);
          doc.autoTable({
            startY: currentY + 5,
            head: [["Location", "Details"]],
            body: booking.trip.dropPoints.map((point: any) => [
              point.location || "N/A",
              point.details || "—",
            ]),
            theme: "grid",
            styles: { fontSize: 10 },
          });
          currentY = doc.autoTable.previous.finalY + 10;
        }

        // Passengers Table
        const passengersStartY = currentY;
        doc.text("Passengers:", 10, passengersStartY);

        if (booking.passengers && booking.passengers.length > 0) {
          doc.autoTable({
            startY: passengersStartY + 5,
            head: [["Name", "Age", "Gender", "Boarding Point", "Drop Location", "ID Proof", "Phone Number"]],
            body: booking.passengers.map((passenger: any) => [
              passenger.name || "Unnamed",
              passenger.age || "N/A",
              passenger.gender || "N/A",
              passenger.address || "N/A",
              passenger.dropLocation || "—",
              `${passenger.idProof || "N/A"} (${passenger.idProofNumber || "N/A"})`,
              passenger.phoneNumber || "N/A",
            ]),
            theme: "grid",
            styles: { fontSize: 9 },
          });
        } else {
          doc.autoTable({
            startY: passengersStartY + 5,
            head: [["Name", "Age", "Gender", "Boarding Point", "Drop Location", "ID Proof", "Phone Number"]],
            body: [["No passenger details available", "", "", "", "", "", ""]],
            theme: "grid",
            styles: { fontSize: 9 },
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
              width: "100px",
              height: "60px",
              overflow: "hidden",
            }}
          >
            <img
              src={logo}
              alt="Sunshine Holiday Packages"
              className="absolute"
              style={{
                width: "140px",
                height: "auto",
                top: "-10px",
                left: "-20px",
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
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <tbody>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Booking ID
                </th>
                <td className="border border-gray-300 px-4 py-2">{booking._id}</td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Trip Title
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.trip?.title || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Location
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.trip?.location || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Selected Date
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.selectedDate || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Selected Seats
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.selectedSeats?.join(", ") || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Package
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {selectedPackage
                    ? `${selectedPackage.title} (Rs ${selectedPackage.price.toLocaleString("en-IN")})`
                    : "None"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Room Choice
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {selectedRoomChoice
                    ? `${selectedRoomChoice.description} (Rs ${selectedRoomChoice.price.toLocaleString("en-IN")})`
                    : "None"}
                </td>
              </tr>
              {/* <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  {selectedPackage ? "Package Price" : "Seat Price"}
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  Rs {basePrice.toLocaleString("en-IN")}
                </td>
              </tr> */}
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Room Price
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  Rs {roomPrice.toLocaleString("en-IN")}
                </td>
              </tr>
            
         
              <tr className="bg-gray-100 font-semibold">
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Total Amount
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  Rs {booking.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Payment Status
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.paymentStatus || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Advance Paid
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  Rs {booking.advancePaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Remaining Balance
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  Rs {booking.remainingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  User
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.user?.username || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Email
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.user?.email || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Phone
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {booking.user?.phone || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Boarding Points Section */}
        <h3 className="text-xl font-semibold mb-4">Boarding Points (Pickup)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Location</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
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
                      {point.date || "—"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {point.time || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {point.details || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-gray-300 px-4 py-2 text-center">
                    No boarding points available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Drop Locations Section */}
        {booking.trip.dropPoints && booking.trip.dropPoints.length > 0 && (
          <>
            <h3 className="text-xl font-semibold mb-4">Drop Locations</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Location</th>
                    <th className="border border-gray-300 px-4 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.trip.dropPoints.map((point: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        {point.location || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {point.details || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Passengers Section */}
        <h3 className="text-xl font-semibold mb-4">Passengers</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Age</th>
                <th className="border border-gray-300 px-4 py-2">Gender</th>
                <th className="border border-gray-300 px-4 py-2">Boarding Point</th>
                <th className="border border-gray-300 px-4 py-2">Drop Location</th>
                <th className="border border-gray-300 px-4 py-2">ID Proof</th>
                <th className="border border-gray-300 px-4 py-2">Phone Number</th>
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
                      {passenger.dropLocation || "—"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {passenger.idProof || "N/A"} - {passenger.idProofNumber || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {passenger.phoneNumber || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="border border-gray-300 px-4 py-2 text-center">
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