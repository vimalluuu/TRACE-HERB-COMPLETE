/**
 * Login Page for Consumer Portal
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../lib/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && !loading) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleLoginSuccess = (authData: any) => {
    // Redirect to home page after successful login
    router.push('/');
  };

  const handleLoginError = (error: any) => {
    console.error('Login error:', error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login - TRACE HERB Consumer Portal</title>
        <meta name="description" content="Login to access the TRACE HERB Consumer Portal" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <LoginForm
            portal="consumer"
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            showPortalSelector={false}
            className="w-full"
          />
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-green-600 hover:text-green-500">
                Contact your administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
