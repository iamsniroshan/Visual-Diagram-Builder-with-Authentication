import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  loading?: boolean;
}

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="w-10 h-10 border-4 border-black/10 dark:border-white/10 border-t-[#007bff] dark:border-t-[#4a9eff] rounded-full animate-spin"></div>
      <p>{message}</p>
    </div>
  );
}
