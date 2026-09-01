import * as XLSX from "xlsx";

export type SeatInfo = { seat?: string; busIndex?: number };

export type PassengerHistoryRow = {
  bookingId?: string;
  passenger?: {
    name?: string;
    phoneNumber?: string;
    address?: string;
    dropLocation?: string;
    email?: string;
  };
  /** Individual seat assigned to this passenger (preferred) */
  seat?: SeatInfo | null;
  seatNumber?: string;
  busIndex?: number | null;
  selectedSeats?: SeatInfo[];
  remainingBalance?: number;
  price?: number;
  advancePaid?: number;
  paymentStatus?: string;
};

export type ExportTripBookingsOptions = {
  passengerHistory: PassengerHistoryRow[];
  tripName?: string;
  selectedDate?: string;
  /** Optional extra filename prefix */
  filePrefix?: string;
};

function formatSeat(seat: SeatInfo | null | undefined): string {
  if (!seat) return "—";
  const seatNo = String(seat.seat ?? "").trim();
  if (!seatNo) return "—";
  if (seatNo === "N/A" || seatNo === "block") return seatNo;
  const busIndex = Number(seat.busIndex);
  if (Number.isFinite(busIndex)) {
    return `${seatNo} (Bus ${busIndex + 1})`;
  }
  return seatNo;
}

/**
 * Resolve the single seat this passenger booked.
 * Prefer API `seat` / `seatNumber`; fall back to index within booking.
 */
function resolveIndividualSeat(
  row: PassengerHistoryRow,
  passengerIndexInBooking: number
): string {
  // 1) Backend assigned individual seat object
  if (row.seat && (row.seat.seat != null || row.seatNumber)) {
    return formatSeat({
      seat: row.seat.seat ?? row.seatNumber,
      busIndex:
        row.seat.busIndex != null ? row.seat.busIndex : row.busIndex ?? undefined,
    });
  }

  // 2) Flat seatNumber from API
  if (row.seatNumber != null && String(row.seatNumber).trim() !== "") {
    return formatSeat({
      seat: String(row.seatNumber),
      busIndex: row.busIndex ?? undefined,
    });
  }

  // 3) Map by passenger order within same booking (selectedSeats[i] ↔ passenger i)
  const seats = Array.isArray(row.selectedSeats) ? row.selectedSeats : [];
  if (seats[passengerIndexInBooking]) {
    return formatSeat(seats[passengerIndexInBooking]);
  }

  // 4) Only one seat on booking → that seat
  if (seats.length === 1) {
    return formatSeat(seats[0]);
  }

  return "—";
}

const EXPORT_HEADERS = [
  "Seat No",
  "Name",
  "Phone No",
  "Pickup Point",
  "Drop Point",
  "Remaining Amount",
] as const;

/** Amount columns (0-based index in sheet row) */
const AMOUNT_COLUMNS = [5]; // Remaining only (total / advance paid omitted)

/**
 * Build one Excel row per passenger with THEIR individual seat:
 * Seat No | Name | Phone No | Pickup Point | Drop Point | Remaining Amount
 * (Total amount and advance/paid amount are not exported.)
 */
export function buildBookingExportRows(passengerHistory: PassengerHistoryRow[]) {
  const passengerIndexByBooking: Record<string, number> = {};

  return passengerHistory.map((row) => {
    const bookingId = String(row.bookingId ?? "unknown");
    const pIndex = passengerIndexByBooking[bookingId] ?? 0;
    passengerIndexByBooking[bookingId] = pIndex + 1;

    const seatNo = resolveIndividualSeat(row, pIndex);
    const totalAmount = Number(row.price ?? 0);
    const paidAmount = Number(row.advancePaid ?? 0);
    // Prefer stored remaining; fall back to total - paid
    const remainingAmount =
      row.remainingBalance != null && row.remainingBalance !== undefined
        ? Number(row.remainingBalance)
        : Math.max(0, totalAmount - paidAmount);

    return {
      "Seat No": seatNo,
      Name: row.passenger?.name?.trim() || "—",
      "Phone No": row.passenger?.phoneNumber?.trim() || "—",
      "Pickup Point": row.passenger?.address?.trim() || "—",
      "Drop Point": row.passenger?.dropLocation?.trim() || "—",
      "Remaining Amount": remainingAmount,
    };
  });
}

/**
 * Download trip booking details for a particular date as .xlsx
 */
export function exportTripBookingsToExcel({
  passengerHistory,
  tripName = "Trip",
  selectedDate = "",
  filePrefix = "Trip_Bookings",
}: ExportTripBookingsOptions): void {
  if (!passengerHistory?.length) {
    throw new Error("No booking data available to export");
  }

  const rows = buildBookingExportRows(passengerHistory);

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [...EXPORT_HEADERS],
  });

  // Column widths for readable layout
  worksheet["!cols"] = [
    { wch: 18 }, // Seat No
    { wch: 24 }, // Name
    { wch: 16 }, // Phone No
    { wch: 28 }, // Pickup Point
    { wch: 18 }, // Remaining Amount
  ];

  // Format amount columns as ₹ numbers
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let R = range.s.r + 1; R <= range.e.r; R++) {
    for (const c of AMOUNT_COLUMNS) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c });
      const cell = worksheet[cellRef];
      if (cell && typeof cell.v === "number") {
        cell.t = "n";
        cell.z = "₹#,##0.00";
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

  // Summary sheet (no total / advance paid — remaining only)
  const sumRemaining = rows.reduce(
    (s, r) => s + Number(r["Remaining Amount"] || 0),
    0
  );

  const metaSheet = XLSX.utils.aoa_to_sheet([
    ["Trip", tripName],
    ["Travel Date", selectedDate],
    ["Exported At", new Date().toLocaleString()],
    ["Total Passengers", rows.length],
    [],
    ["Sum Remaining Amount", sumRemaining],
  ]);
  metaSheet["!cols"] = [{ wch: 22 }, { wch: 40 }];
  // Format summary amount cell
  const remainingCell = metaSheet["B6"];
  if (remainingCell && typeof remainingCell.v === "number") {
    remainingCell.t = "n";
    remainingCell.z = "₹#,##0.00";
  }
  XLSX.utils.book_append_sheet(workbook, metaSheet, "Summary");

  const safeTrip = String(tripName)
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 40);
  const safeDate = String(selectedDate).replace(/[^\d-]/g, "") || "date";
  const filename = `${filePrefix}_${safeTrip}_${safeDate}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
