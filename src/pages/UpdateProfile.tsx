import { useUpdateProfileMutation } from "@/store/api/auth";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface UpdateProfileProps {
  user: {
    username: string;
    email: string;
    phone?: string;
    address?: string;
  };
  onClose: () => void;
}

const UpdateProfile: React.FC<UpdateProfileProps> = ({ user, onClose }) => {
  const [updateProfile] = useUpdateProfileMutation();
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add logic to send the updated data to the server.
    try {
      console.log("Updated data:", formData);
     const resp= await updateProfile(formData).unwrap();
     console.log("Updated data:", resp);
     toast.success("Profile updated successfully");
      onClose(); // Close the edit form after submission.
    } catch (error:any) {
        console.log("Error updating profile", error?.data?.message);
      toast.error(error?.data?.message||"Error updating profile");
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600">Username</label>
          <input
            required
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-600">Email</label>
          <input
            required
            type="email"
            readOnly
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-600">Phone</label>
          <input
            required
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-600">Address</label>
          <input
            required
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
