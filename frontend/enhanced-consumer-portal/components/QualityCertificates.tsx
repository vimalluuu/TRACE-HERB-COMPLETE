import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BeakerIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  DownloadIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface QualityTest {
  resourceType: 'DiagnosticReport'
  id: string
  identifier: Array<{
    system: string
    value: string
  }>
  status: 'final' | 'preliminary' | 'cancelled'
  category: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  effectiveDateTime: string
  issued: string
  performer: Array<{
    reference: string
    display: string
  }>
  result: Array<{
    reference: string
  }>
  conclusion: string
  conclusionCode: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
}

interface QualityCertificatesProps {
  qualityTests?: QualityTest[]
  qrCode?: string
}

const QualityCertificates: React.FC<QualityCertificatesProps> = ({ qualityTests, qrCode }) => {
  const [selectedTest, setSelectedTest] = useState<QualityTest | null>(null)
  const [expandedTest, setExpandedTest] = useState<string | null>(null)
  const [realQualityData, setRealQualityData] = useState<any>(null)

  // Load real batch data
  React.useEffect(() => {
    const loadBatchData = async () => {
      try {
        const { getBatchByQRCode, batchToQualityMetrics, initializeDemoBatches } = await import('../utils/batchStatusSync.js')

        // Initialize demo batches
        initializeDemoBatches()

        if (qrCode) {
          const batch = getBatchByQRCode(qrCode)
          if (batch) {
            const qualityMetrics = batchToQualityMetrics(batch)
            setRealQualityData(qualityMetrics)
          }
        }
      } catch (error) {
        console.error('Error loading batch data:', error)
      }
    }

    loadBatchData()
  }, [qrCode])

  // Mock quality test data if none provided
  const mockTests: QualityTest[] = [
    {
      resourceType: 'DiagnosticReport',
      id: 'quality-test-001',
      identifier: [{ system: 'http://trace-herb.com/quality-test-id', value: 'QT-2024-001' }],
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'LAB', display: 'Laboratory' }] }],
      code: { coding: [{ system: 'http://trace-herb.com/fhir/CodeSystem/quality-test-type', code: 'comprehensive-analysis', display: 'Comprehensive Quality Analysis' }] },
      subject: { reference: 'Substance/ashwagandha-batch-001' },
      effectiveDateTime: '2024-01-22T11:45:00+05:30',
      issued: '2024-01-22T16:30:00+05:30',
      performer: [{ reference: 'Organization/nabl-lab-001', display: 'NABL Certified Laboratory' }],
      result: [
        { reference: 'Observation/moisture-content-001' },
        { reference: 'Observation/pesticide-analysis-001' },
        { reference: 'Observation/dna-authentication-001' },
        { reference: 'Observation/withanolides-content-001' }
      ],
      conclusion: realQualityData?.testsPassed
        ? 'All Tests Passed - Product meets all quality standards and certifications.'
        : realQualityData?.contaminants === 'Testing in progress'
        ? 'Quality testing in progress. Results pending.'
        : 'All parameters within acceptable limits. Product meets quality standards.',
      conclusionCode: [{ coding: [{
        system: 'http://trace-herb.com/fhir/CodeSystem/quality-status',
        code: realQualityData?.testsPassed ? 'passed' : 'preliminary',
        display: realQualityData?.testsPassed ? 'Quality Test Passed' : 'Quality Test Preliminary'
      }] }]
    }
  ]

  const testsToShow = qualityTests.length > 0 ? qualityTests : mockTests

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'text-green-600 bg-green-100'
      case 'preliminary': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConclusionStatus = (test: QualityTest) => {
    const conclusionCode = test.conclusionCode?.[0]?.coding?.[0]?.code
    return conclusionCode === 'passed' ? 'passed' : 'failed'
  }

  const mockTestResults = {
    'moisture-content-001': { parameter: 'Moisture Content', value: '8.2%', limit: '≤ 10%', status: 'passed' },
    'pesticide-analysis-001': { parameter: 'Pesticide Residues', value: 'Not Detected', limit: '< 0.01 ppm', status: 'passed' },
    'dna-authentication-001': { parameter: 'DNA Authentication', value: 'Withania somnifera', limit: 'Species Match', status: 'passed' },
    'withanolides-content-001': { parameter: 'Withanolides Content', value: '2.8%', limit: '≥ 2.5%', status: 'passed' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BeakerIcon className="w-6 h-6 text-trace-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quality Certificates</h3>
        </div>
        <div className="text-sm text-gray-600">
          {testsToShow.length} certificate{testsToShow.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Quality Tests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testsToShow.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Certificate Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {test.code.coding[0]?.display || 'Quality Analysis'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {test.performer[0]?.display || 'Certified Laboratory'}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>Tested: {format(new Date(test.effectiveDateTime), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BuildingOfficeIcon className="w-3 h-3" />
                      <span>ID: {test.identifier[0]?.value}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                  {getConclusionStatus(test) === 'passed' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Test Results Summary */}
            <div className="p-4">
              <div className="space-y-3">
                {test.result.slice(0, 3).map((result, resultIndex) => {
                  const resultId = result.reference.split('/')[1]
                  const mockResult = mockTestResults[resultId as keyof typeof mockTestResults]
                  
                  if (!mockResult) return null

                  return (
                    <div key={resultId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{mockResult.parameter}</div>
                        <div className="text-xs text-gray-600">Limit: {mockResult.limit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{mockResult.value}</div>
                        <div className={`text-xs ${mockResult.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                          {mockResult.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Conclusion */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong>Conclusion:</strong> {test.conclusion}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
                  className="flex items-center space-x-1 text-sm text-trace-blue-600 hover:text-trace-blue-700 font-medium"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>{expandedTest === test.id ? 'Hide Details' : 'View Details'}</span>
                </button>
                
                <button
                  onClick={() => {
                    // Mock download functionality
                    const link = document.createElement('a')
                    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(test, null, 2))}`
                    link.download = `quality-certificate-${test.identifier[0]?.value}.json`
                    link.click()
                  }}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedTest === test.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100 overflow-hidden"
                >
                  <div className="p-4 bg-gray-50">
                    <h5 className="font-semibold text-gray-900 mb-3">Detailed Test Results</h5>
                    <div className="space-y-4">
                      {test.result.map((result, resultIndex) => {
                        const resultId = result.reference.split('/')[1]
                        const mockResult = mockTestResults[resultId as keyof typeof mockTestResults]
                        
                        if (!mockResult) return null

                        return (
                          <div key={resultId} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-medium text-gray-900">{mockResult.parameter}</h6>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                mockResult.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {mockResult.status === 'passed' ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Result:</span>
                                <span className="ml-2 font-semibold text-gray-900">{mockResult.value}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Limit:</span>
                                <span className="ml-2 font-semibold text-gray-900">{mockResult.limit}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Laboratory Information */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h6 className="font-medium text-blue-900 mb-2">Laboratory Information</h6>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div><strong>Laboratory:</strong> {test.performer[0]?.display}</div>
                        <div><strong>Accreditation:</strong> NABL Certified (ISO/IEC 17025:2017)</div>
                        <div><strong>Test Date:</strong> {format(new Date(test.effectiveDateTime), 'MMMM dd, yyyy')}</div>
                        <div><strong>Report Date:</strong> {format(new Date(test.issued), 'MMMM dd, yyyy')}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Quality Standards Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <DocumentTextIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Quality Standards Compliance</p>
            <p>
              All tests are conducted by NABL-certified laboratories following WHO guidelines for 
              medicinal plant materials and AYUSH Ministry quality standards for Ayurvedic products.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QualityCertificates
