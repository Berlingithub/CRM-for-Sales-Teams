'use client'

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { TrendingUp, Users, Target, DollarSign, BarChart3, PieChart } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch stats')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's what's happening with your sales today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats?.totalLeads || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-secondary-600" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Opportunities</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats?.totalOpportunities || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pipeline Value</dt>
                      <dd className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalValue || 0)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {stats?.totalLeads > 0 ? Math.round((stats?.totalOpportunities / stats?.totalLeads) * 100) : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Leads by Status */}
            <div className="bg-white shadow-lg rounded-lg">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Leads by Status</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(stats?.leadsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          status === 'New' ? 'bg-blue-500' :
                          status === 'Contacted' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700">{status}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Opportunities by Stage */}
            <div className="bg-white shadow-lg rounded-lg">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <PieChart className="h-6 w-6 text-secondary-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Opportunities by Stage</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(stats?.opportunitiesByStage || {}).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          stage === 'Discovery' ? 'bg-purple-500' :
                          stage === 'Proposal' ? 'bg-orange-500' :
                          stage === 'Won' ? 'bg-green-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700">{stage}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="/leads"
                  className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Add New Lead
                </a>
                <a
                  href="/opportunities"
                  className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-secondary-700 bg-secondary-100 hover:bg-secondary-200 transition-colors"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Create Opportunity
                </a>
                <div className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  View Reports
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}