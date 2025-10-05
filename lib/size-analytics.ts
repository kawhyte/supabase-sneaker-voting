// Size recommendation and analytics engine

export interface FitData {
  user_name: string
  brand: string
  size_tried: string
  fit_rating: number
  frequency: number
}

export interface SizeRecommendation {
  recommendedSize: string
  confidence: number
  reasoning: string
  basedOnData: FitData[]
}

export interface BrandComparison {
  brand: string
  averageSize: number
  perfectFitSize: string | null
  totalTryOns: number
  averageFitRating: number
  runsTrueToSize: boolean
  sizeAdjustment: string // "runs small", "runs large", "true to size"
}

export interface FitInsights {
  preferredSize: string
  consistencyScore: number // 0-100, how consistent user's sizing is
  brandComparisons: BrandComparison[]
  sizeRecommendations: Record<string, SizeRecommendation>
}

/**
 * Calculates size recommendations for a user based on their fit history
 */
export function calculateSizeRecommendations(
  userData: FitData[],
  targetBrand: string,
  userName: string
): SizeRecommendation | null {
  // Filter data for this user
  const userExperiences = userData.filter(d => d.user_name === userName)

  // Get user's perfect fits (rating 3) across all brands
  const perfectFits = userExperiences.filter(d => d.fit_rating === 3)

  // Check if user has tried this brand before
  const brandExperiences = userExperiences.filter(d => d.brand === targetBrand)

  if (brandExperiences.length > 0) {
    // User has tried this brand before
    const perfectBrandFits = brandExperiences.filter(d => d.fit_rating === 3)

    if (perfectBrandFits.length > 0) {
      // User has perfect fits in this brand
      const mostCommonPerfectSize = getMostCommonSize(perfectBrandFits)
      return {
        recommendedSize: mostCommonPerfectSize,
        confidence: 95,
        reasoning: `You've found perfect fits in ${targetBrand} size ${mostCommonPerfectSize}`,
        basedOnData: perfectBrandFits
      }
    } else {
      // User has tried brand but no perfect fits, analyze patterns
      const analysis = analyzeSizingPattern(brandExperiences)
      return {
        recommendedSize: analysis.recommendedSize,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        basedOnData: brandExperiences
      }
    }
  }

  if (perfectFits.length === 0) {
    return null // Not enough data
  }

  // User hasn't tried this brand, use cross-brand analysis
  const userMostCommonPerfectSize = getMostCommonSize(perfectFits)
  const brandSizingPattern = analyzeBrandSizing(userData, targetBrand)

  if (!brandSizingPattern) {
    // No data for this brand, use user's most common perfect size
    return {
      recommendedSize: userMostCommonPerfectSize,
      confidence: 60,
      reasoning: `Based on your perfect fits in other brands (${userMostCommonPerfectSize})`,
      basedOnData: perfectFits
    }
  }

  // Calculate size adjustment based on brand patterns
  const adjustment = calculateSizeAdjustment(perfectFits, brandSizingPattern)
  const recommendedSize = adjustSize(userMostCommonPerfectSize, adjustment)

  return {
    recommendedSize,
    confidence: 75,
    reasoning: `${targetBrand} ${adjustment === 0 ? 'runs true to size' : adjustment > 0 ? 'runs small' : 'runs large'} compared to your other brands`,
    basedOnData: [...perfectFits, ...brandSizingPattern]
  }
}

/**
 * Analyzes brand-specific sizing patterns
 */
export function analyzeBrandComparisons(userData: FitData[], userName: string): BrandComparison[] {
  const userExperiences = userData.filter(d => d.user_name === userName)
  const brandGroups = groupBy(userExperiences, 'brand')

  return Object.entries(brandGroups).map(([brand, experiences]) => {
    const perfectFits = experiences.filter(e => e.fit_rating === 3)
    const averageSize = calculateAverageSize(experiences.map(e => e.size_tried))
    const averageFitRating = experiences.reduce((sum, e) => sum + e.fit_rating, 0) / experiences.length

    // Determine if brand runs true to size
    const userOverallAvgSize = calculateUserAverageSize(userData, userName)
    const brandAvgSize = averageSize
    const sizeDifference = brandAvgSize - userOverallAvgSize

    let sizeAdjustment: string
    let runsTrueToSize = false

    if (Math.abs(sizeDifference) < 0.25) {
      sizeAdjustment = "true to size"
      runsTrueToSize = true
    } else if (sizeDifference > 0.25) {
      sizeAdjustment = "runs small"
    } else {
      sizeAdjustment = "runs large"
    }

    return {
      brand,
      averageSize,
      perfectFitSize: perfectFits.length > 0 ? getMostCommonSize(perfectFits) : null,
      totalTryOns: experiences.length,
      averageFitRating: Math.round(averageFitRating * 10) / 10,
      runsTrueToSize,
      sizeAdjustment
    }
  }).sort((a, b) => b.totalTryOns - a.totalTryOns)
}

/**
 * Generates comprehensive fit insights for a user
 */
export function generateFitInsights(userData: FitData[], userName: string): FitInsights {
  const userExperiences = userData.filter(d => d.user_name === userName)
  const perfectFits = userExperiences.filter(d => d.fit_rating === 3)

  // Calculate preferred size (most common perfect fit)
  const preferredSize = perfectFits.length > 0 ? getMostCommonSize(perfectFits) : "Unknown"

  // Calculate consistency score
  const consistencyScore = calculateConsistencyScore(userExperiences)

  // Generate brand comparisons
  const brandComparisons = analyzeBrandComparisons(userData, userName)

  // Generate size recommendations for each brand
  const brands = Array.from(new Set(userData.map(d => d.brand)))
  const sizeRecommendations: Record<string, SizeRecommendation> = {}

  brands.forEach(brand => {
    const recommendation = calculateSizeRecommendations(userData, brand, userName)
    if (recommendation) {
      sizeRecommendations[brand] = recommendation
    }
  })

  return {
    preferredSize,
    consistencyScore,
    brandComparisons,
    sizeRecommendations
  }
}

// Helper functions

function getMostCommonSize(experiences: FitData[]): string {
  const sizeCounts = experiences.reduce((acc, exp) => {
    acc[exp.size_tried] = (acc[exp.size_tried] || 0) + exp.frequency
    return acc
  }, {} as Record<string, number>)

  return Object.entries(sizeCounts).reduce((a, b) =>
    sizeCounts[a[0]] > sizeCounts[b[0]] ? a : b
  )[0]
}

function analyzeSizingPattern(experiences: FitData[]) {
  // Analyze if user needs to size up/down based on fit ratings
  const sizesTooSmall = experiences.filter(e => e.fit_rating <= 2)
  const sizesTooBig = experiences.filter(e => e.fit_rating >= 4)

  if (sizesTooSmall.length > sizesTooBig.length) {
    // Tends to run small, recommend sizing up
    const avgCurrentSize = calculateAverageSize(experiences.map(e => e.size_tried))
    const recommendedSize = (avgCurrentSize + 0.5).toString()
    return {
      recommendedSize,
      confidence: 70,
      reasoning: "Based on your previous experiences, this brand tends to run small for you"
    }
  } else if (sizesTooBig.length > sizesTooSmall.length) {
    // Tends to run large, recommend sizing down
    const avgCurrentSize = calculateAverageSize(experiences.map(e => e.size_tried))
    const recommendedSize = (avgCurrentSize - 0.5).toString()
    return {
      recommendedSize,
      confidence: 70,
      reasoning: "Based on your previous experiences, this brand tends to run large for you"
    }
  }

  // Inconsistent, use most common size
  const mostCommon = getMostCommonSize(experiences)
  return {
    recommendedSize: mostCommon,
    confidence: 50,
    reasoning: "Your experiences with this brand vary, this is your most tried size"
  }
}

function analyzeBrandSizing(userData: FitData[], brand: string): FitData[] {
  return userData.filter(d => d.brand === brand)
}

function calculateSizeAdjustment(userPerfectFits: FitData[], brandData: FitData[]): number {
  const userAvgSize = calculateAverageSize(userPerfectFits.map(f => f.size_tried))
  const brandPerfectFits = brandData.filter(d => d.fit_rating === 3)

  if (brandPerfectFits.length === 0) return 0

  const brandAvgPerfectSize = calculateAverageSize(brandPerfectFits.map(f => f.size_tried))
  return brandAvgPerfectSize - userAvgSize
}

function adjustSize(baseSize: string, adjustment: number): string {
  const numericSize = parseFloat(baseSize)
  const adjustedSize = numericSize + adjustment

  // Round to nearest half size
  return Math.round(adjustedSize * 2) / 2 + ""
}

function calculateAverageSize(sizes: string[]): number {
  const numericSizes = sizes.map(s => parseFloat(s)).filter(s => !isNaN(s))
  return numericSizes.reduce((sum, size) => sum + size, 0) / numericSizes.length
}

function calculateUserAverageSize(userData: FitData[], userName: string): number {
  const userPerfectFits = userData.filter(d => d.user_name === userName && d.fit_rating === 3)
  if (userPerfectFits.length === 0) return 0

  return calculateAverageSize(userPerfectFits.map(f => f.size_tried))
}

function calculateConsistencyScore(experiences: FitData[]): number {
  if (experiences.length < 2) return 0

  const perfectFits = experiences.filter(e => e.fit_rating === 3)
  const perfectFitRatio = perfectFits.length / experiences.length

  // Calculate size variance
  const sizes = experiences.map(e => parseFloat(e.size_tried)).filter(s => !isNaN(s))
  const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length
  const variance = sizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / sizes.length
  const sizeConsistency = Math.max(0, 1 - variance)

  // Combine metrics
  return Math.round((perfectFitRatio * 0.6 + sizeConsistency * 0.4) * 100)
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key])
    groups[groupKey] = groups[groupKey] || []
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}