import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Wait until authentication check is complete
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <p className="text-text-muted">Checking your session...</p>
      </div>
    );
  }

  // Redirect users who are not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow authenticated users to access the protected page
  return <Outlet />;
}

export default ProtectedRoute;