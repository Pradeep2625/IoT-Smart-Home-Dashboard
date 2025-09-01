import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { authService } from '@/services/authService';
import { setUser } from '@/redux/slices/dashboardSlice';
import {jwtDecode} from "jwt-decode";

interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
  const token = authService.getToken();
  if (token) {
    const decoded: JwtPayload = jwtDecode(token);
    dispatch(setUser({
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    }));
  } else {
    navigate('/login');
  }
}, [navigate, dispatch]);

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;