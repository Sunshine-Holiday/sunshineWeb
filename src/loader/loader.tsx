export const LoadingSkeleton = ({imagelogo}:{imagelogo:string}) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative h-44 w-44 bg-gray-300 animate-pulse rounded-full">
        <img
          src={imagelogo}
          alt="logo"
          className="absolute inset-0 h-24 w-26 m-auto opacity-100 animate-blink object-cover rounded-full"
        />
      </div>
    </div>
  );
  