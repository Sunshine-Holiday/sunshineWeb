import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { selectCurrentLoading, selectCurrentUser } from "@/store/reducer/auth";
import UpdateProfile from "./UpdateProfile";
import { useUpdateProfile_PicMutation } from "@/store/api/auth";
import { toast } from "react-toastify";
import { IMAGE_URL } from "@/store/store";

const Profile: React.FC = () => {
  const [UpdateProfile_Pic] = useUpdateProfile_PicMutation();
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectCurrentLoading);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(
    `${IMAGE_URL}${user?.profile}`
  );
  console.log(`${IMAGE_URL}/${user?.profile}`);
  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        const imageBase64 = reader.result as string;
        setProfilePicture(imageBase64); // Optimistically update UI

        try {
          // Send the file to the server
          const formData = new FormData();
          formData.append("file", file);

          const response = await UpdateProfile_Pic(formData).unwrap();

          if (response.success) {
            toast.success(response.message);
          }
        } catch (error) {
          console.error("Error updating profile picture:", error);
          toast.error("Failed to update profile picture. Please try again.");
        }
      };

      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <motion.div
          className="h-16 w-16 border-4 border-t-4 border-white rounded-full animate-spin"
          style={{ borderTopColor: "transparent" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <h1 className="text-2xl font-semibold text-white">
          Please log in to view your profile.
        </h1>
      </div>
    );
  }

  const { email, username, createdAt, phone, address } = user;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      {isEditing ? (
        <UpdateProfile user={user} onClose={() => setIsEditing(false)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden"
        >
          <motion.div
            className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.label
              htmlFor="profilePictureInput"
              className="cursor-pointer relative"
            >
              <motion.img
                src={profilePicture}
                alt="Profile"
                className="h-32 w-32 rounded-full border-4 border-white shadow-lg mb-4"
                whileHover={{ scale: 1.1, rotate: 2 }}
              />
              <input
                id="profilePictureInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </motion.label>
            <h1 className="text-3xl font-bold text-white">
              Hello, {username}!
            </h1>
          </motion.div>
          <motion.div
            className="p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Profile Details
            </h2>
            <div className="space-y-4">
              {[
                { label: "Username", value: username },
                { label: "Email", value: email },
                { label: "Phone", value: phone || "Not provided" },
                { label: "Address", value: address || "Not provided" },
                {
                  label: "Joined On",
                  value: new Date(createdAt).toLocaleDateString(),
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <span className="font-semibold text-gray-600">
                    {item.label}:
                  </span>
                  <span className="text-gray-800">{item.value}</span>
                </motion.div>
              ))}
            </div>
            <motion.button
              onClick={() => setIsEditing(true)}
              className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit Profile
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
