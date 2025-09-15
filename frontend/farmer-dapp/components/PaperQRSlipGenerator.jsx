import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCodeIcon,
  PrinterIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  CalendarIcon,
  KeyIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const PaperQRSlipGenerator = ({ farmerId, farmerName }) => {
  const [generatedSlips, setGeneratedSlips] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef(null);

  // Generate new paper QR slip
  const generateQRSlip = async (entryData = null) => {
    setIsGenerating(true);

    try {
      // If no entry data provided, create a mock entry
      const mockEntry = entryData || {
        species: 'Ashwagandha',
        quantity: 15,
        location: { lat: 12.9716, lng: 77.5946 },
        notes: 'Good quality harvest'
      };

      const response = await fetch('http://localhost:3000/api/sms/generate-paper-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmerId,
          entryId: `ENT-${Date.now().toString(36).toUpperCase()}`
        })
      });

      const result = await response.json();

      if (result.success) {
        const slip = {
          ...result.data,
          entryData: mockEntry,
          generatedAt: new Date().toISOString(),
          status: 'active'
        };

        setGeneratedSlips(prev => [slip, ...prev]);
        setSelectedSlip(slip);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating QR slip:', error);
      alert('Failed to generate QR slip. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Print QR slip
  const printQRSlip = (slip) => {
    setSelectedSlip(slip);
    setShowPrintPreview(true);
    
    // Trigger print after a short delay to allow modal to render
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Copy slip data to clipboard
  const copySlipData = (slip) => {
    const slipText = `
TRACE HERB - Paper QR Slip
==========================
QR Code: ${slip.qrCode}
OTP: ${slip.otp}
Entry ID: ${slip.entryId}
Farmer: ${farmerName}
Generated: ${new Date(slip.generatedAt).toLocaleString()}

SMS Activation:
Send "OTP ${slip.otp} ${slip.qrCode}" to +91-TRACE-HERB

Valid for 7 days
Support: 1800-TRACE-HERB
    `.trim();

    navigator.clipboard.writeText(slipText).then(() => {
      alert('Slip data copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  // Share slip via Web Share API
  const shareSlip = (slip) => {
    if (navigator.share) {
      navigator.share({
        title: 'TRACE HERB QR Slip',
        text: `QR Code: ${slip.qrCode}\nOTP: ${slip.otp}\nActivate via SMS: OTP ${slip.otp} ${slip.qrCode}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      copySlipData(slip);
    }
  };

  // Get slip status color
  const getSlipStatusColor = (slip) => {
    const daysLeft = Math.ceil((new Date(slip.generatedAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
    
    if (daysLeft <= 0) return 'text-red-600 bg-red-100';
    if (daysLeft <= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  // Get days remaining
  const getDaysRemaining = (slip) => {
    const daysLeft = Math.ceil((new Date(slip.generatedAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <QrCodeIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">📄 Paper QR Slips</h3>
              <p className="text-sm text-gray-600">Generate offline QR codes with OTP activation</p>
            </div>
          </div>
          
          <button
            onClick={() => generateQRSlip()}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <DocumentTextIcon className="w-5 h-5" />
                <span>Generate Slip</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📋 How Paper QR Slips Work:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Generate QR slips when you don't have internet connectivity</li>
            <li>• Each slip contains a unique QR code and 6-digit OTP</li>
            <li>• Print or write down the slip details</li>
            <li>• When you get network, SMS the OTP and QR code to activate</li>
            <li>• Slips are valid for 7 days from generation</li>
          </ul>
        </div>
      </div>

      {/* Generated Slips */}
      {generatedSlips.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            📋 Generated Slips ({generatedSlips.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedSlips.map((slip, index) => (
              <motion.div
                key={slip.qrCode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                {/* Slip Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <QrCodeIcon className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-gray-900">QR Slip</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSlipStatusColor(slip)}`}>
                    {getDaysRemaining(slip)} days left
                  </span>
                </div>

                {/* Slip Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">QR Code:</span>
                    <code className="font-mono font-semibold text-indigo-600">{slip.qrCode}</code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">OTP:</span>
                    <code className="font-mono font-semibold text-green-600">{slip.otp}</code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Entry ID:</span>
                    <code className="font-mono text-gray-800">{slip.entryId}</code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Generated:</span>
                    <span className="text-gray-800">
                      {new Date(slip.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* SMS Activation Command */}
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-purple-700 mb-1">SMS to activate:</p>
                  <code className="text-sm font-mono text-purple-800 bg-white px-2 py-1 rounded">
                    OTP {slip.otp} {slip.qrCode}
                  </code>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => printQRSlip(slip)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <PrinterIcon className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                  
                  <button
                    onClick={() => copySlipData(slip)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  
                  <button
                    onClick={() => shareSlip(slip)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      <AnimatePresence>
        {showPrintPreview && selectedSlip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-white print:relative print:inset-auto print:p-0"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 print:shadow-none print:rounded-none print:max-w-none">
              {/* Print Header */}
              <div className="text-center mb-6 print:mb-4">
                <h2 className="text-2xl font-bold text-gray-900 print:text-xl">🌿 TRACE HERB</h2>
                <p className="text-sm text-gray-600">Blockchain Herb Traceability</p>
                <div className="w-full h-px bg-gray-300 my-4"></div>
              </div>

              {/* QR Code Placeholder */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3">
                  <QrCodeIcon className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600">QR Code: {selectedSlip.qrCode}</p>
              </div>

              {/* Slip Information */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm font-medium text-gray-700">QR Code:</span>
                  <code className="text-sm font-mono font-bold">{selectedSlip.qrCode}</code>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm font-medium text-gray-700">OTP:</span>
                  <code className="text-sm font-mono font-bold text-green-600">{selectedSlip.otp}</code>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm font-medium text-gray-700">Entry ID:</span>
                  <code className="text-sm font-mono">{selectedSlip.entryId}</code>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm font-medium text-gray-700">Farmer:</span>
                  <span className="text-sm">{farmerName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm font-medium text-gray-700">Generated:</span>
                  <span className="text-sm">{new Date(selectedSlip.generatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm font-medium text-gray-700">Valid Until:</span>
                  <span className="text-sm">
                    {new Date(new Date(selectedSlip.generatedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Activation Instructions */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  SMS Activation
                </h4>
                <p className="text-sm text-purple-800 mb-2">
                  Send this SMS to activate your QR code:
                </p>
                <div className="bg-white border border-purple-300 rounded p-2">
                  <code className="text-sm font-mono text-purple-900">
                    OTP {selectedSlip.otp} {selectedSlip.qrCode}
                  </code>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  Send to: +91-TRACE-HERB
                </p>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                <p>📞 Support: 1800-TRACE-HERB</p>
                <p>🌐 www.traceherb.com</p>
                <p className="mt-2">⚠️ Keep this slip safe until activation</p>
              </div>

              {/* Close Button (hidden in print) */}
              <div className="print:hidden mt-6 flex justify-center">
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Statistics */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Usage Statistics</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{generatedSlips.length}</div>
            <div className="text-sm text-gray-600">Total Generated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {generatedSlips.filter(slip => getDaysRemaining(slip) > 0).length}
            </div>
            <div className="text-sm text-gray-600">Active Slips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {generatedSlips.filter(slip => getDaysRemaining(slip) <= 2 && getDaysRemaining(slip) > 0).length}
            </div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {generatedSlips.filter(slip => getDaysRemaining(slip) <= 0).length}
            </div>
            <div className="text-sm text-gray-600">Expired</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperQRSlipGenerator;
