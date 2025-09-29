'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  Bell,
  BellOff,
  Trash2,
  Plus,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Link2
} from 'lucide-react'

interface PriceMonitor {
  id: string
  product_url: string
  store_name: string
  target_price: number | null
  last_price: number | null
  last_checked_at: string | null
  is_active: boolean
  notification_sent: boolean
  created_at: string
  sneakers?: {
    brand: string
    model: string
    colorway: string | null
  }
}

interface PriceMonitorManagerProps {
  sneaker_id?: string
  user_name: string
  className?: string
}

export function PriceMonitorManager({ sneaker_id, user_name, className = "" }: PriceMonitorManagerProps) {
  const [monitors, setMonitors] = useState<PriceMonitor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [monitoringStatus, setMonitoringStatus] = useState<{
    isActive: boolean
    activeTasks: number
  } | null>(null)

  // Add new monitor form
  const [newMonitor, setNewMonitor] = useState({
    product_url: '',
    store_name: '',
    target_price: ''
  })

  useEffect(() => {
    fetchMonitors()
    checkMonitoringStatus()
  }, [user_name])

  const fetchMonitors = async () => {
    try {
      const response = await fetch(`/api/price-monitors?user_name=${encodeURIComponent(user_name)}`)
      const result = await response.json()

      if (result.success) {
        setMonitors(result.monitors)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to fetch price monitors')
    }
  }

  const checkMonitoringStatus = async () => {
    try {
      const response = await fetch('/api/monitor-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
      })
      const result = await response.json()

      if (result.success) {
        setMonitoringStatus({
          isActive: result.isActive,
          activeTasks: result.activeTasks
        })
      }
    } catch (error) {
      console.warn('Failed to check monitoring status:', error)
    }
  }

  const addMonitor = async () => {
    if (!newMonitor.product_url || !newMonitor.store_name) {
      setError('Product URL and Store Name are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/price-monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_url: newMonitor.product_url,
          store_name: newMonitor.store_name,
          user_name,
          target_price: newMonitor.target_price ? parseFloat(newMonitor.target_price) : null,
          sneaker_id
        })
      })

      const result = await response.json()

      if (result.success) {
        setNewMonitor({ product_url: '', store_name: '', target_price: '' })
        await fetchMonitors()
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to add price monitor')
    } finally {
      setLoading(false)
    }
  }

  const toggleMonitor = async (id: string, is_active: boolean) => {
    try {
      const response = await fetch('/api/price-monitors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !is_active })
      })

      const result = await response.json()

      if (result.success) {
        await fetchMonitors()
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to update monitor')
    }
  }

  const updateManualPrice = async (id: string, price: number) => {
    try {
      setLoading(true)
      const response = await fetch('/api/price-monitors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          last_price: price,
          last_checked_at: new Date().toISOString()
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchMonitors()
        setError(null)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to update price')
    } finally {
      setLoading(false)
    }
  }

  const deleteMonitor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price monitor?')) return

    try {
      const response = await fetch(`/api/price-monitors?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchMonitors()
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to delete monitor')
    }
  }

  const startMonitoring = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/monitor-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })

      const result = await response.json()
      if (result.success) {
        await checkMonitoringStatus()
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to start monitoring')
    } finally {
      setLoading(false)
    }
  }

  const stopMonitoring = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/monitor-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      })

      const result = await response.json()
      if (result.success) {
        await checkMonitoringStatus()
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to stop monitoring')
    } finally {
      setLoading(false)
    }
  }

  const checkPricesNow = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/monitor-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-now' })
      })

      const result = await response.json()
      if (result.success) {
        await fetchMonitors()
        setError(null)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to check prices')
    } finally {
      setLoading(false)
    }
  }

  const getStoreName = (url: string) => {
    try {
      const hostname = new URL(url).hostname.toLowerCase()
      if (hostname.includes('shoepalace.com')) return 'Shoe Palace'
      if (hostname.includes('hibbett.com')) return 'Hibbett'
      if (hostname.includes('jdsports.com')) return 'JD Sports'
      return 'Other Store'
    } catch {
      return 'Unknown Store'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Price Monitoring
            </div>
            <div className="flex items-center gap-2">
              {monitoringStatus && (
                <Badge variant={monitoringStatus.isActive ? "default" : "secondary"}>
                  {monitoringStatus.isActive ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monitors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monitors">Price Monitors ({monitors.length})</TabsTrigger>
              <TabsTrigger value="controls">System Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="monitors" className="space-y-4">
              {error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Add New Monitor Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Price Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="product_url">Product URL</Label>
                      <Input
                        id="product_url"
                        type="url"
                        placeholder="https://www.shoepalace.com/..."
                        value={newMonitor.product_url}
                        onChange={(e) => {
                          const url = e.target.value
                          setNewMonitor({
                            ...newMonitor,
                            product_url: url,
                            store_name: getStoreName(url)
                          })
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="store_name">Store Name</Label>
                      <Input
                        id="store_name"
                        placeholder="Store Name"
                        value={newMonitor.store_name}
                        onChange={(e) => setNewMonitor({ ...newMonitor, store_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_price">Target Price ($)</Label>
                      <Input
                        id="target_price"
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        value={newMonitor.target_price}
                        onChange={(e) => setNewMonitor({ ...newMonitor, target_price: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addMonitor} disabled={loading} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Price Monitor
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Monitors */}
              <div className="space-y-3">
                {monitors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No price monitors set up yet.</p>
                    <p className="text-sm">Add a product URL above to start tracking prices.</p>
                  </div>
                ) : (
                  monitors.map((monitor) => (
                    <Card key={monitor.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{monitor.store_name}</Badge>
                              {monitor.is_active ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <Bell className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <BellOff className="w-3 h-3 mr-1" />
                                  Paused
                                </Badge>
                              )}
                              {monitor.target_price && monitor.last_price && monitor.last_price <= monitor.target_price && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  Target Hit!
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-gray-400" />
                                <a
                                  href={monitor.product_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate max-w-md"
                                >
                                  {monitor.product_url}
                                </a>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                <div>
                                  <span className="text-gray-500">Current Price:</span>
                                  <div className="font-medium">
                                    {monitor.last_price ? `$${monitor.last_price.toFixed(2)}` : 'Unknown'}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Target Price:</span>
                                  <div className="font-medium">
                                    {monitor.target_price ? `$${monitor.target_price.toFixed(2)}` : 'No target'}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Last Checked:</span>
                                  <div className="font-medium text-xs">
                                    {monitor.last_checked_at
                                      ? new Date(monitor.last_checked_at).toLocaleString()
                                      : 'Never'
                                    }
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Status:</span>
                                  <div className="flex items-center gap-1">
                                    {monitor.last_price ? (
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Clock className="w-3 h-3 text-yellow-600" />
                                    )}
                                    <span className="text-xs">
                                      {monitor.last_price ? 'Working' : 'Pending'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            {!monitor.last_price && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const manualPrice = prompt('Enter current price (numbers only):', '')
                                  if (manualPrice && !isNaN(parseFloat(manualPrice))) {
                                    updateManualPrice(monitor.id, parseFloat(manualPrice))
                                  }
                                }}
                                title="Manually set current price"
                              >
                                <DollarSign className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={monitor.is_active ? "outline" : "default"}
                              onClick={() => toggleMonitor(monitor.id, monitor.is_active)}
                            >
                              {monitor.is_active ? (
                                <BellOff className="w-4 h-4" />
                              ) : (
                                <Bell className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteMonitor(monitor.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="controls" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Monitoring System Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Automatic Monitoring</h4>
                      <p className="text-sm text-gray-600">
                        {monitoringStatus?.isActive
                          ? 'System is checking prices every hour and generating daily summaries'
                          : 'Automatic price checking is currently disabled'
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {monitoringStatus?.isActive ? (
                        <Button onClick={stopMonitoring} disabled={loading} variant="outline">
                          Stop Monitoring
                        </Button>
                      ) : (
                        <Button onClick={startMonitoring} disabled={loading}>
                          Start Monitoring
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Manual Price Check</h4>
                      <p className="text-sm text-gray-600">
                        Check all active monitors right now
                      </p>
                    </div>
                    <Button onClick={checkPricesNow} disabled={loading} variant="outline">
                      Check Prices Now
                    </Button>
                  </div>

                  {monitoringStatus && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">System Status</h4>
                      <div className="text-sm space-y-1">
                        <div>Status: {monitoringStatus.isActive ? '✅ Active' : '❌ Inactive'}</div>
                        <div>Active Tasks: {monitoringStatus.activeTasks}</div>
                        <div>Schedule: Hourly price checks, daily summaries at 9 AM</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}