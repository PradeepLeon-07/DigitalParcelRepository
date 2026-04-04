import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" />;
  if (role && auth.role !== role) return <Navigate to="/login" />;
  return children;
};

export default PrivateRoute;
