'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, TrendingUp, Target, Lightbulb, Brain, Ruler, Award } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import {
  calculateSizeRecommendations,
  analyzeBrandComparisons,
  generateFitInsights,
  type FitData,
  type FitInsights
} from '@/lib/size-analytics'

interface InsightsDashboardProps {
  onGoBack?: () => void
}

export function InsightsDashboard({ onGoBack }: InsightsDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<'Kenny' | 'Rene' | 'both'>('Kenny')
  const [insights, setInsights] = useState<FitInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [rawData, setRawData] = useState<FitData[]>([])

  const supabase = createClient()

  useEffect(() => {
    loadFitData()
  }, [])

  useEffect(() => {
    if (rawData.length > 0 && selectedUser !== 'both') {
      generateInsights()
    }
  }, [rawData, selectedUser])

  const loadFitData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sneaker_experiences')
        .select('user_name, brand, size_tried, fit_rating')
        .eq('interaction_type', 'tried')
        .not('size_tried', 'is', null)
        .not('fit_rating', 'is', null)

      if (error) {
        console.error('Error loading fit data:', error)
        return
      }

      // Transform to FitData format with frequency calculation
      const transformedData: FitData[] = []
      const groupedData = data.reduce((acc, item) => {
        const key = `${item.user_name}-${item.brand}-${item.size_tried}-${item.fit_rating}`
        if (!acc[key]) {
          acc[key] = { ...item, frequency: 0 }
        }
        acc[key].frequency += 1
        return acc
      }, {} as Record<string, any>)

      Object.values(groupedData).forEach((item: any) => {
        transformedData.push({
          user_name: item.user_name,
          brand: item.brand,
          size_tried: item.size_tried,
          fit_rating: item.fit_rating,
          frequency: item.frequency
        })
      })

      setRawData(transformedData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = () => {
    if (selectedUser === 'both') return

    const userInsights = generateFitInsights(rawData, selectedUser)
    setInsights(userInsights)
  }

  const getConsistencyBadge = (score: number) => {
    if (score >= 80) return { label: 'Very Consistent', color: 'bg-green-100 text-green-800' }
    if (score >= 60) return { label: 'Mostly Consistent', color: 'bg-blue-100 text-blue-800' }
    if (score >= 40) return { label: 'Somewhat Consistent', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Inconsistent', color: 'bg-red-100 text-red-800' }
  }

  const getSizeAdjustmentIcon = (adjustment: string) => {
    switch (adjustment) {
      case 'runs small': return '📏↗️'
      case 'runs large': return '📏↙️'
      default: return '✅'
    }
  }

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Analyzing your fit data...</p>
        </CardContent>
      </Card>
    )
  }

  if (rawData.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Try-On Data Available</h3>
          <p className="text-gray-600 mb-4">
            Start trying on sneakers and rating their fit to unlock powerful insights!
          </p>
          {onGoBack && (
            <Button onClick={onGoBack} className="bg-blue-600 hover:bg-blue-700">
              Start Tracking Experiences
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Fit Insights
          </h1>
          <p className="text-gray-600">AI-powered size recommendations and fit analysis</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedUser} onValueChange={(value: any) => setSelectedUser(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kenny">Kenny</SelectItem>
              <SelectItem value="Rene">Rene</SelectItem>
              <SelectItem value="both">Compare</SelectItem>
            </SelectContent>
          </Select>
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack}>
              ← Back
            </Button>
          )}
        </div>
      </div>

      {selectedUser === 'both' ? (
        // Comparison view
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Comparison view coming soon...</p>
          </CardContent>
        </Card>
      ) : (
        insights && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {insights.preferredSize}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Target className="h-3 w-3" />
                    Preferred Size
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {insights.brandComparisons.filter(b => b.perfectFitSize).length}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Award className="h-3 w-3" />
                    Perfect Fit Brands
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {insights.brandComparisons.length}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Brands Analyzed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {insights.consistencyScore}%
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Consistency
                  </div>
                  <Badge
                    className={`text-xs mt-1 ${getConsistencyBadge(insights.consistencyScore).color}`}
                    variant="secondary"
                  >
                    {getConsistencyBadge(insights.consistencyScore).label}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Brand Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Brand Sizing Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.brandComparisons.map((brand) => (
                    <div
                      key={brand.brand}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-medium text-lg">{brand.brand}</div>
                        <div className="text-2xl">
                          {getSizeAdjustmentIcon(brand.sizeAdjustment)}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {brand.sizeAdjustment}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            {brand.perfectFitSize || 'N/A'}
                          </div>
                          <div className="text-gray-500">Perfect Fit</div>
                        </div>

                        <div className="text-center">
                          <div className="font-medium">
                            {brand.averageSize.toFixed(1)}
                          </div>
                          <div className="text-gray-500">Avg Size</div>
                        </div>

                        <div className="text-center">
                          <div className="font-medium">
                            {brand.averageFitRating}/5
                          </div>
                          <div className="text-gray-500">Avg Fit</div>
                        </div>

                        <div className="text-center">
                          <div className="font-medium text-blue-600">
                            {brand.totalTryOns}
                          </div>
                          <div className="text-gray-500">Try-ons</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Size Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Smart Size Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(insights.sizeRecommendations).map(([brand, rec]) => (
                    <div key={brand} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{brand}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-lg font-bold">
                            {rec.recommendedSize}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {rec.confidence}% confidence
                          </div>
                        </div>
                      </div>

                      <Progress value={rec.confidence} className="h-2 mb-2" />

                      <div className="text-sm text-gray-600">
                        {rec.reasoning}
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        Based on {rec.basedOnData.length} data point{rec.basedOnData.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consistency Score Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fit Consistency Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Overall Consistency Score</span>
                      <span className="font-bold">{insights.consistencyScore}%</span>
                    </div>
                    <Progress value={insights.consistencyScore} className="h-3" />
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <p>
                      <strong>What this means:</strong>
                    </p>
                    {insights.consistencyScore >= 80 && (
                      <p>🎯 You have very consistent sizing preferences! Your fit data shows clear patterns that make accurate recommendations possible.</p>
                    )}
                    {insights.consistencyScore >= 60 && insights.consistencyScore < 80 && (
                      <p>👍 You have fairly consistent sizing, with some variation across brands. Our recommendations should be quite reliable.</p>
                    )}
                    {insights.consistencyScore >= 40 && insights.consistencyScore < 60 && (
                      <p>⚠️ Your sizing varies somewhat across experiences. Try more sneakers to improve recommendation accuracy.</p>
                    )}
                    {insights.consistencyScore < 40 && (
                      <p>📊 Your fit preferences vary significantly. This could indicate different preferences for different activities or styles.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  )
}