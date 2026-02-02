import { ReactNode } from 'react';
import './PrivateRoute.css';

interface PrivateRouteProps {
  children: ReactNode;
  loading?: boolean;
}

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
