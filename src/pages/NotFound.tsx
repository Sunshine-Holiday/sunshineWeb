
import { Link } from 'react-router-dom';

const  NotFound=()=> {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <img
          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
          alt="404 Electronics"
          className="w-64 mx-auto mb-6 rounded-lg shadow-lg"
        />
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Oops! Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-6">
          Sorry, we couldn't find the page you were looking for.
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-xl hover:bg-blue-800 transition duration-300"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
}
export default NotFound