import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
      <span className="font-bold text-lg">📦 Digital Parcel Repo</span>
      <div className="flex items-center gap-4">
        <span className="text-sm">Hi, {auth?.name}</span>
        <button onClick={handleLogout} className="bg-white text-blue-700 px-3 py-1 rounded text-sm font-medium">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
