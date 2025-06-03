import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../../utils/animations";

interface PassengerFormProps {
  seatNumber: string;
  index: number;
  tripDetails: {
    boardingPoints: {
      details: string;
      location: string;
      time: string;
      _id: string;
    }[];
  };
  onChange: (index: number, data: PassengerData) => void;
  passengers: PassengerData[];
}

export interface PassengerData {
  name: string;
  age: string;
  gender: "male" | "female" | "other";
  idProof: "aadhar" | "pan";
  idProofNumber: string;
  address: string;
}

export const PassengerForm = ({
  seatNumber,
  tripDetails,
  index,
  onChange,
  passengers,
}: PassengerFormProps) => {
  const [errors, setErrors] = useState({
    name: false,
    age: false,
    gender: false,
    idProof: false,
    idProofNumber: false,
    address: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    name: "",
    age: "",
    gender: "",
    idProof: "",
    idProofNumber: "",
    address: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const updatedData: PassengerData = {
      ...passengers[index],
      [name]: value,
    };

    onChange(index, updatedData);

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim() === "",
    }));
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white p-6 rounded-lg shadow-sm mb-4"
    >
      <h3 className="font-medium mb-4">
        Passenger {index + 1} - Seat {seatNumber}
      </h3>
  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={passengers[index]?.name || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : ""
            }`}
            aria-invalid={errors.name ? "true" : "false"}
            required
          />
          {errors.name && <p className="text-red-500 text-xs">{errorMessages.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="text"
            name="age"
            value={passengers[index]?.age || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.age ? "border-red-500" : ""
            }`}
            aria-invalid={errors.age ? "true" : "false"}
            required
          />
          {errors.age && <p className="text-red-500 text-xs">{errorMessages.age}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={passengers[index]?.gender || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.gender ? "border-red-500" : ""
            }`}
            aria-invalid={errors.gender ? "true" : "false"}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs">{errorMessages.gender}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Proof Type
          </label>
          <select
            name="idProof"
            value={passengers[index]?.idProof || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.idProof ? "border-red-500" : ""
            }`}
            required
          >
            <option value="">Select ID Proof</option>
            <option value="aadhar">Aadhar</option>
            <option value="pan">PAN</option>
          </select>
          {errors.idProof && <p className="text-red-500 text-xs">{errorMessages.idProof}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Proof Number
          </label>
          <input
            type="text"
            name="idProofNumber"
            value={passengers[index]?.idProofNumber || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.idProofNumber ? "border-red-500" : ""
            }`}
            aria-invalid={errors.idProofNumber ? "true" : "false"}
            required
          />
          {errors.idProofNumber && <p className="text-red-500 text-xs">{errorMessages.idProofNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Location
          </label>
          <select
            name="address"
            value={passengers[index]?.address || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.address ? "border-red-500" : ""
            }`}
            aria-invalid={errors.address ? "true" : "false"}
            required
          >
            <option value="">Select Pickup Location</option>
            {tripDetails.boardingPoints.map((point) => (
              <option key={point._id} value={point.location}>
                {point.location} - {point.time}
              </option>
            ))}
          </select>
          {errors.address && <p className="text-red-500 text-xs">{errorMessages.address}</p>}
        </div>
      </div>
    </motion.div>
  );
};