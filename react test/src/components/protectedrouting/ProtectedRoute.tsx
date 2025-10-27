import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("https://react-test-dtwl.vercel.app/api/verify_token/verifytoken", {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const result = await response.json();
        
        if (result.valid) {
          console.log("Token is valid");
          setIsValid(true);
        } else {
          console.log("Token invalid or expired:", result.message);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsValid(false);
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsValid(false);
      }
      
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Verifying session...
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;