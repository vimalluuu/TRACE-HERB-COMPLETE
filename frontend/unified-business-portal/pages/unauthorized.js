import { useRouter } from 'next/router';
import { XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Unauthorized() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this portal.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              This portal is restricted to authorized users only. Please contact your administrator if you believe this is an error.
            </p>
            
            <button
              onClick={handleGoBack}
              className="inline-flex items-center btn-primary"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Login
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Need Access?</h3>
          <p className="text-sm text-blue-700">
            Contact your system administrator to request access to the appropriate portal for your role.
          </p>
        </div>
      </div>
    </div>
  );
}
