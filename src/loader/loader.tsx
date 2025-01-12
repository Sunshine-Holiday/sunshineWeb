import logo from "../asserts/Sunshine.png";

export const LoadingSkeleton = ({
  imagelogo = logo,
}: {
  imagelogo?: string;
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-6">
    <div className="relative h-44 w-44 bg-gray-300 animate-pulse rounded-full">
      <img
        src={imagelogo}
        alt="logo"
        className="absolute inset-0 h-24 w-24 m-auto opacity-100 animate-blink object-cover rounded-full"
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

