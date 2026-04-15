import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <span className="font-bold text-lg">📦 Digital Parcel Repository</span>
      <div className="flex items-center gap-3">
        <span className="text-sm">Hi, {auth?.name}</span>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
