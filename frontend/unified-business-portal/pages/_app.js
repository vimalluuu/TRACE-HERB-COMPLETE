import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../utils/auth';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setLoading(false);

      // Redirect logic for protected routes
      const publicRoutes = ['/login', '/unauthorized'];
      const isPublicRoute = publicRoutes.includes(router.pathname);

      if (!currentUser && !isPublicRoute) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} user={user} />;
}
