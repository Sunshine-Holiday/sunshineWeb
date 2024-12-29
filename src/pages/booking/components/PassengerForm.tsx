import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../../utils/animations";

interface PassengerFormProps {
  seatNumber: string;
  index: number;
  onChange: (index: number, data: PassengerData) => void;
}

export interface PassengerData {
  name: string;
  age: string;
  gender: "male" | "female" | "other";
  idProof: "aadhar" | "pan" | "";
  idProofNumber: string;
  address: string;
}

export const PassengerForm = ({
  seatNumber,
  index,
  onChange,
}: PassengerFormProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    onChange(index, {
      name: name === "name" ? value : "",
      age: name === "age" ? value : "",
      gender:
        name === "gender" ? (value as "male" | "female" | "other") : "male",
      idProof: name === "idProof" ? (value as "aadhar" | "pan" | "") : "",
      idProofNumber: name === "idProofNumber" ? value : "",
      address: name === "address" ? value : "",
    });
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
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="number"
            name="age"
            min="1"
            max="120"
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Proof (Aadhar/PAN)
          </label>
          <select
            name="idProof"
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
         
            <option value="aadhar">Aadhar</option>
            <option value="pan">PAN</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Proof Number
          </label>
          <input
            type="text"
          
            name="idProofNumber"
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Address
          </label>
          <input
            type="text"
            name="address"
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </motion.div>
  );
};
