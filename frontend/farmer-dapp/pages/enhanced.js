/**
 * Enhanced Farmer Portal with Authentication and Batch Tracking
 */

import Head from 'next/head';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import EnhancedFarmerDashboard from '../components/EnhancedFarmerDashboard';

// Main App Component
function FarmerApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <EnhancedFarmerDashboard />;
}

export default function EnhancedFarmerPortal() {
  return (
    <>
      <Head>
        <title>Enhanced Farmer Portal - TRACE HERB</title>
        <meta name="description" content="Enhanced farmer portal with authentication and batch tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <AuthProvider>
        <FarmerApp />
      </AuthProvider>
    </>
  );
}
