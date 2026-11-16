import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import roleHome from '../utils/roleHome';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to={user ? roleHome(user.role) : '/login'} className="text-2xl font-bold">Local Volunteer Platform</Link>
      <div>
        {user ? (
          <>
            {user.role === 'organiser' && <Link to="/organiser/opportunities" className="mr-4">My opportunities</Link>}
            {user.role === 'volunteer' && <Link to="/opportunities" className="mr-4">Browse</Link>}
            <Link to="/profile" className="mr-4">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
