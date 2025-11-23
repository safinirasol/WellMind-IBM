// components/HRDashboard.tsx
'use client'
import { useState, useEffect } from 'react'
import NotificationToast, { Toast } from './NotificationToast'
import ConfirmModal from './ConfirmModal'

interface DashboardData {
  summary: {
    total_employees: number
    total_surveys: number
    high_risk_count: number
    medium_risk_count: number
    low_risk_count: number
    average_risk: number
    average_hours: number
    average_stress: number
  }
  departments: Array<{
    department: string
    count: number
    avg_risk: number
  }>
  recent_submissions: Array<any>
}

interface Employee {
  id: number
  name: string
  department: string
  email: string
  latest_risk_score: number
  latest_risk_label: string
  work_hours: number
  stress_level: number
  last_submission: string
  hedera_verified: boolean
}

export default function HRDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'employees'>('overview')
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  const [sendingEmail, setSendingEmail] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; employeeId?: number; employeeName?: string; employeeEmail?: string }>({ isOpen: false })

  useEffect(() => {
    fetchDashboardData()
    fetchEmployees()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLabel = (score: number) => {
    return score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low'
  }

  const filteredEmployees = riskFilter === 'All' 
    ? employees 
    : employees.filter(e => e.latest_risk_label === riskFilter)

  const handleSendEmail = async (employeeId: number, employeeName: string, employeeEmail: string) => {
    openConfirmModal(employeeId, employeeName, employeeEmail)
  }

  const addToast = (type: Toast['type'], title: string, message?: string, duration: number = 4000) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, title, message, duration }])
    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const openConfirmModal = (employeeId: number, employeeName: string, employeeEmail: string) => {
    setConfirmModal({ isOpen: true, employeeId, employeeName, employeeEmail })
  }

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false })
  }

  const handleConfirmSendEmail = async () => {
    const { employeeId, employeeName, employeeEmail } = confirmModal
    if (!employeeId || !employeeName || !employeeEmail) return

    setSendingEmail(employeeId)
    try {
      // DEMO MODE: Skip actual email sending
      console.log(`📧 [DEMO] Would send wellness email to ${employeeName} (${employeeEmail})`);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Uncomment below to enable real email sending (requires GMAIL_APP_PASSWORD in .env):
      /*
      const res = await fetch('/api/employees/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, employeeName, employeeEmail }),
      })
      if (!res.ok) {
        throw new Error('Email API failed');
      }
      */
      
      addToast('success', 'Email Sent (Demo)', `Wellness email logged for ${employeeName}`, 5000)
    } catch (error) {
      console.error('Error sending email:', error)
      addToast('error', 'Error', 'An error occurred while sending the email', 5000)
    } finally {
      setSendingEmail(null)
      closeConfirmModal()
    }
  }

  const handleGenerateReport = async () => {
    const infoId = addToast('info', 'Generating Report', 'Please wait...', 0)
    try {
      const res = await fetch('/api/employees/export-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskFilter: riskFilter === 'All' ? null : riskFilter, format: 'pdf' }),
      })

      if (res.ok) {
        const contentType = res.headers.get('Content-Type') || ''
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        if (contentType.includes('pdf')) {
          a.download = `burnout-report-${new Date().toISOString().split('T')[0]}.pdf`
        } else {
          a.download = `burnout-report-${new Date().toISOString().split('T')[0]}.html`
        }
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        addToast('success', 'Report Generated', 'Your report has been downloaded successfully', 5000)
      } else {
        addToast('error', 'Failed to Generate Report', 'Please try again later', 5000)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      addToast('error', 'Error', 'An error occurred while generating the report', 5000)
    } finally {
      // remove the 'Generating' toast
      if (infoId) removeToast(infoId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <NotificationToast toasts={toasts} onRemove={removeToast} />
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Send Risk Advisory Email"
        message={`Send a burnout risk advisory email to ${confirmModal.employeeName}? They will receive guidance on managing their stress and wellness resources.`}
        actionLabel="Send Email"
        cancelLabel="Cancel"
        isDangerous={false}
        isLoading={sendingEmail === confirmModal.employeeId}
        onConfirm={handleConfirmSendEmail}
        onCancel={closeConfirmModal}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-600">Employee Burnout Monitoring</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Employees ({employees.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleGenerateReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm"
            >
              📥 Generate Report
            </button>
          </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">Total Employees</h3>
              <p className="text-3xl font-bold text-blue-600">{dashboardData?.summary?.total_employees ?? 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">Surveys Submitted</h3>
              <p className="text-3xl font-bold text-green-600">{dashboardData?.summary?.total_surveys ?? 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">High Risk Cases</h3>
              <p className="text-3xl font-bold text-red-600">{dashboardData?.summary?.high_risk_count ?? 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">Avg Risk Score</h3>
              <p className="text-3xl font-bold text-orange-600">{dashboardData?.summary?.average_risk ?? 0}</p>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-medium">High Risk</span>
                  <span className="font-bold">{dashboardData?.summary?.high_risk_count ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-600 font-medium">Medium Risk</span>
                  <span className="font-bold">{dashboardData?.summary?.medium_risk_count ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">Low Risk</span>
                  <span className="font-bold">{dashboardData?.summary?.low_risk_count ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
              <div className="space-y-3">
                {dashboardData?.departments?.map((dept) => (
                  <div key={dept.department} className="flex justify-between items-center">
                    <span className="font-medium">{dept.department}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{dept.count} surveys</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(getRiskLabel(dept.avg_risk))}`}>
                        {dept.avg_risk}
                      </span>
                    </div>
                  </div>
                )) ?? (
                  <div className="text-center text-gray-500 py-4">
                    No department data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData?.recent_submissions?.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {submission.employee_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{submission.department}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(submission.label)}`}>
                          {submission.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{submission.risk_score}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{submission.work_hours}h</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{submission.stress_level}/10</td>
                    </tr>
                  )) ?? (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                        No recent submissions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Employees ({filteredEmployees.length})</h3>
              <div className="flex gap-2">
                {['All', 'High', 'Medium', 'Low'].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setRiskFilter(risk as 'All' | 'High' | 'Medium' | 'Low')}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      riskFilter === risk
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Submission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{employee.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{employee.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(employee.latest_risk_label)}`}>
                          {employee.latest_risk_label} {employee.latest_risk_score && `(${employee.latest_risk_score})`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {employee.last_submission ? new Date(employee.last_submission).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        {employee.hedera_verified ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {employee.latest_risk_label === 'High' && (
                          <button
                            onClick={() => handleSendEmail(employee.id, employee.name, employee.email)}
                            disabled={sendingEmail === employee.id}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium text-xs"
                          >
                            {sendingEmail === employee.id ? 'Sending...' : 'Send Email'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}