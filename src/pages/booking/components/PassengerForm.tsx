import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../../utils/animations";
import { useTranslation } from "react-i18next";
import { Armchair, UserRound } from "lucide-react";

interface PassengerFormProps {
  seatNumber: string;
  index: number;
  tripDetails: {
    boardingPoints?: {
      details?: string;
      location: string;
      date?: string;
      time?: string;
      _id?: string;
    }[];
    dropPoints?: {
      details?: string;
      location: string;
      maplink?: string;
      _id?: string;
    }[];
    to?: string;
  };
  onChange: (index: number, data: PassengerData) => void;
  passengers: PassengerData[];
  /** Compact: hide address (shown in separate card) */
  hideAddress?: boolean;
  /** Show selected seat badge prominently */
  showSeatBadge?: boolean;
}

export interface PassengerData {
  title?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  age: string;
  gender: "male" | "female" | "other" | "";
  idProof: "aadhar" | "pan" | "";
  idProofNumber: string;
  address: string;
  dropLocation?: string;
  email: string;
  phoneNumber?: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function combineName(
  title?: string,
  first?: string,
  last?: string,
  fallbackName?: string
) {
  const parts = [title, first, last].map((p) => (p || "").trim()).filter(Boolean);
  if (parts.length) return parts.join(" ");
  return (fallbackName || "").trim();
}

export const PassengerForm = ({
  seatNumber,
  tripDetails,
  index,
  onChange,
  passengers,
  hideAddress = false,
  showSeatBadge = true,
}: PassengerFormProps) => {
  const { t } = useTranslation();
  const p = passengers[index] || ({} as PassengerData);

  // Derive first/last from existing full name if missing
  const firstName =
    p.firstName ||
    (p.name && !p.lastName ? p.name.split(/\s+/).slice(0, -1).join(" ") || p.name : p.firstName) ||
    "";
  const lastName =
    p.lastName ||
    (p.name && p.name.includes(" ")
      ? p.name.split(/\s+/).slice(-1).join(" ")
      : "") ||
    "";

  const [localFirst, setLocalFirst] = useState(firstName);
  const [localLast, setLocalLast] = useState(lastName);
  const [localTitle, setLocalTitle] = useState(p.title || "Mr");

  // Keep local in sync when passenger list is reset
  React.useEffect(() => {
    setLocalFirst(p.firstName || firstName || "");
    setLocalLast(p.lastName || lastName || "");
    setLocalTitle(p.title || "Mr");
  }, [index, p.name, p.firstName, p.lastName, p.title]);

  const pushUpdate = (patch: Partial<PassengerData>) => {
    const next = { ...p, ...patch };
    // Always keep combined name for backend
    next.name = combineName(
      next.title ?? localTitle,
      next.firstName ?? localFirst,
      next.lastName ?? localLast,
      next.name
    );
    onChange(index, next as PassengerData);
  };

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    pushUpdate({ [name]: value } as Partial<PassengerData>);
  };

  const hasBoarding =
    tripDetails.boardingPoints && tripDetails.boardingPoints.length > 0;
  const hasDropPoints =
    Boolean(tripDetails.dropPoints && tripDetails.dropPoints.length > 0);

  return (
    <motion.div
      variants={fadeInUp}
      className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"
    >
      {/* Header with seat */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-50 bg-gradient-to-r from-orange-50 to-amber-50/50 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {t("booking.passenger")} {index + 1}
            </p>
            <p className="text-xs text-slate-500">
              Please provide valid passenger details
            </p>
          </div>
        </div>
        {showSeatBadge && seatNumber && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
            <Armchair className="h-3.5 w-3.5" />
            {seatNumber}
          </span>
        )}
      </div>

      <div className="space-y-4 p-5">
        {/* Row 1: Title + First + Last */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Title</label>
            <select
              value={localTitle}
              onChange={(e) => {
                setLocalTitle(e.target.value);
                pushUpdate({
                  title: e.target.value,
                  firstName: localFirst,
                  lastName: localLast,
                });
              }}
              className={inputClass}
            >
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Miss">Miss</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>First name *</label>
            <input
              type="text"
              placeholder="First name"
              value={localFirst}
              onChange={(e) => {
                setLocalFirst(e.target.value);
                pushUpdate({
                  title: localTitle,
                  firstName: e.target.value,
                  lastName: localLast,
                });
              }}
              className={inputClass}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Last name *</label>
            <input
              type="text"
              placeholder="Last name"
              value={localLast}
              onChange={(e) => {
                setLocalLast(e.target.value);
                pushUpdate({
                  title: localTitle,
                  firstName: localFirst,
                  lastName: e.target.value,
                });
              }}
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Row 2: Email, ID Proof, Age */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>{t("booking.email")} *</label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={p.email || ""}
              onChange={handleField}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>{t("booking.idProof")} *</label>
            <select
              name="idProof"
              value={p.idProof || ""}
              onChange={handleField}
              className={inputClass}
              required
            >
              <option value="">{t("booking.selectId")}</option>
              <option value="aadhar">{t("booking.aadhar")}</option>
              <option value="pan">{t("booking.pan")}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("booking.age")} *</label>
            <input
              type="text"
              name="age"
              placeholder="Age"
              value={p.age || ""}
              onChange={handleField}
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Row 3: Contact, ID No, Gender */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>{t("booking.phone")} *</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="10-digit mobile"
              value={p.phoneNumber || ""}
              onChange={handleField}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>{t("booking.idNumber")} *</label>
            <input
              type="text"
              name="idProofNumber"
              placeholder="ID number"
              value={p.idProofNumber || ""}
              onChange={handleField}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>{t("booking.gender")} *</label>
            <div className="flex h-[42px] items-center gap-4 rounded-xl border border-slate-200 bg-white px-3">
              {(["male", "female"] as const).map((g) => (
                <label
                  key={g}
                  className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-700"
                >
                  <input
                    type="radio"
                    name={`gender-${index}`}
                    checked={p.gender === g}
                    onChange={() => pushUpdate({ gender: g })}
                    className="h-4 w-4 border-slate-300 text-orange-500 focus:ring-orange-400"
                  />
                  {g === "male" ? t("booking.male") : t("booking.female")}
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name={`gender-${index}`}
                  checked={p.gender === "other"}
                  onChange={() => pushUpdate({ gender: "other" })}
                  className="h-4 w-4 border-slate-300 text-orange-500 focus:ring-orange-400"
                />
                {t("booking.other")}
              </label>
            </div>
          </div>
        </div>

        {/* Address / pickup & Drop location */}
        <div
          className={`grid grid-cols-1 gap-3 ${
            hasDropPoints ? "sm:grid-cols-2" : ""
          }`}
        >
          {hasBoarding ? (
            <div>
              <label className={labelClass}>
                {t("booking.pickupLocation")} *
              </label>
              <select
                name="address"
                value={p.address || ""}
                onChange={handleField}
                className={inputClass}
                required
              >
                <option value="">{t("booking.selectPickup")}</option>
                {tripDetails.boardingPoints!.map((point, i) => {
                  const datePart = point.date ? ` [${point.date}]` : "";
                  const timePart = point.time ? ` (${point.time})` : "";
                  return (
                    <option key={point._id || i} value={point.location}>
                      {point.location}{datePart}{timePart}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <div>
              <label className={labelClass}>
                {t("booking.pickupLocation")}
              </label>
              <select
                name="address"
                value={p.address || ""}
                onChange={handleField}
                className={inputClass}
              >
                <option value="">{t("booking.selectPickup")}</option>
              </select>
            </div>
          )}

          {hasDropPoints && (
            <div>
              <label className={labelClass}>Drop Location</label>
              <select
                name="dropLocation"
                value={p.dropLocation || ""}
                onChange={handleField}
                className={inputClass}
              >
                <option value="">Select Drop Location</option>
                {tripDetails.dropPoints!.map((point, i) => (
                  <option key={point._id || i} value={point.location}>
                    {point.location}
                    {point.details ? ` (${point.details})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PassengerForm;
