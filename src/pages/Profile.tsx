
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { selectCurrentLoading, selectCurrentUser } from "@/store/reducer/auth";
import UpdateProfile from "./UpdateProfile";
import { useUpdateProfile_PicMutation } from "@/store/api/auth";
import { toast } from "react-toastify";
import { IMAGE_URL } from "@/store/store";
import { useTranslation } from "react-i18next";

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const [UpdateProfile_Pic] = useUpdateProfile_PicMutation();
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectCurrentLoading);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(
    user?.profile ? `${IMAGE_URL}${user.profile}` : "https://via.placeholder.com/150"
  );

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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <motion.div
          className="h-16 w-16 border-4 border-orange-500 rounded-full animate-spin"
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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <h1 className="text-2xl font-semibold text-gray-800">
          {t("profile.pleaseLogin")}
        </h1>
      </div>
    );
  }

  const { email, username, createdAt, phone, address } = user;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-24">
      {isEditing ? (
        <UpdateProfile user={user} onClose={() => setIsEditing(false)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-lg rounded-lg overflow-hidden border border-gray-200"
        >
          <motion.div
            className="flex flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 p-8"
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
                className="h-32 w-32 rounded-full border-4 border-orange-100 shadow-md mb-4 object-cover"
                whileHover={{ scale: 1.1, ring: "2px solid #F97316" }}
              />
              <div className="absolute inset-0 bg-orange-500/30 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">Change</span>
              </div>
              <input
                id="profilePictureInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </motion.label>
            <h1 className="text-4xl font-semibold text-white">
              Hello, {username}!
            </h1>
          </motion.div>
          <motion.div
            className="p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("profile.title")}
            </h2>
            <div className="space-y-6">
              {[
                { label: t("profile.username"), value: username },
                { label: t("profile.email"), value: email },
                { label: t("profile.phone"), value: phone || "—" },
                { label: t("profile.address"), value: address || "—" },
                {
                  label: t("profile.memberSince"),
                  value: new Date(createdAt).toLocaleDateString("en-GB"),
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <span className="font-medium text-gray-600 w-24">
                    {item.label}:
                  </span>
                  <span className="text-gray-800">{item.value}</span>
                </motion.div>
              ))}
            </div>
            <motion.button
              onClick={() => setIsEditing(true)}
              className="mt-8 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit Profile
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      <style jsx>{`
        h1, h2, span, button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .profile-label:hover::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid #F97316;
          opacity: 1;
          transition: opacity 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;
