
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authPages = ['/login', '/register'];
    const isAuthPage = authPages.includes(pathname);
    const token = localStorage.getItem('studyflow_token');

    if (isAuthPage) {
      if (token) {
        router.replace('/');
        return;
      }

      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    if (!token) {
      router.replace('/login');
      return;
    }

    setIsAuthenticated(true);
    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff9fc] text-slate-700 dark:bg-slate-950 dark:text-slate-100">
        <p className="font-semibold">Checking your session...</p>
      </div>
    );
  }

  if (
    !isAuthenticated &&
    !['/login', '/register'].includes(pathname)
  ) {
    return null;
  }

  return <>{children}</>;
}
