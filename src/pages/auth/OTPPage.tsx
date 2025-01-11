import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthCard } from "./components/AuthCard";
import { useOtpVerifyMutation } from "@/store/api/auth";

interface OTPInputProps {
  length: number;
  onChange: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length, onChange }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    let value = e.target.value;
    if (value.length > 1) value = value.slice(-1); // Allow only 1 character

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    onChange(updatedOtp.join("")); // Pass the OTP string to the parent component

    // Move to the next input field if the current one is filled
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus(); // Focus next input
    }
    // Move to the previous field if backspace is pressed
    else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus(); // Focus previous input
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Prevent moving left or right when typing a single character in an empty field
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus(); // Focus previous input when backspace is pressed
      }
    }
  };

  return (
    <div className="flex justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el!)}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onFocus={() => inputRefs.current[index]?.select()}
          onKeyDown={(e) => handleKeyDown(e, index)} // Handle backspace key down
          className="w-10 h-10 text-center text-xl border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mx-2"
        />
      ))}
    </div>
  );
};

const OTPPage: React.FC = () => {
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {}; // Handle missing email gracefully
  const [verifyforgetPasswordlOTP] = useOtpVerifyMutation();

  // Redirect if email is not available inside useEffect
  useEffect(() => {
    if (!email) {
      navigate("/"); // Redirect to the home page
    }
  }, [email, navigate]); // Dependency array ensures this runs when email is available

  const handleOtpChange = (otpValue: string) => {
    setOtp(otpValue);
  };

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      alert("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      const resp = await verifyforgetPasswordlOTP({
        email: email,
        otp: otp,
      }).unwrap();

      if (resp.success) {
        navigate("/reset-password", { state: { email: email, otp } });
      }
    } catch (error) {
      console.error("Failed to verify OTP: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    console.log("Resend OTP");
    // Implement resend OTP logic here
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1530789253388-582c481c54b0')",
      }}
    >
      <AuthCard
        title="Verify OTP"
        subtitle="Enter the 6-digit code sent to your email."
      >
        <div className="mt-6">
          <OTPInput length={6} onChange={handleOtpChange} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full mt-6 py-2 rounded-md text-white ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            "Verify OTP"
          )}
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          Didn't receive the code?{" "}
          <button
            className="text-blue-600 hover:underline"
            onClick={handleResend}
            disabled={loading}
          >
            Resend OTP
          </button>
        </p>
      </AuthCard>
    </div>
  );
};

export default OTPPage;
