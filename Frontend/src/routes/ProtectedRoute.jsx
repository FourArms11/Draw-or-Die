import { useAuth } from "../context/useAuth";

function ProtectedRoute({ children, fallback = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="standalone-page"><p className="notice">Loading session...</p></div>;
  }

  if (!user) {
    return fallback;
  }

  return children;
}

export default ProtectedRoute;
