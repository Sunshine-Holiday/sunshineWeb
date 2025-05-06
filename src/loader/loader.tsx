
import logo1 from "../asserts/logo_sunshine.gif";

export const LoadingSkeleton = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-6">
    <div className="relative h-72 w-72 bg-gray-300 animate-pulse flex items-center justify-center overflow-hidden rounded-full">
    <img
  src={logo1}
  alt="Sunshine Holiday Packages Logo"
  className="h-full w-full object-cover"
/>
    </div>
    <div className="flex flex-col items-center space-y-2">
      <div className="bg-gray-300 h-4 w-32 rounded animate-pulse"></div>
      <div className="bg-gray-300 h-4 w-24 rounded animate-pulse"></div>
    </div>
    <div className="text-lg font-medium text-gray-600 animate-bounce">
      Loading, please wait...
    </div>
  </div>
);
