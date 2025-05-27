import { ToolResult, ComparisonMetric, StandardizedResponse } from "../types";

// Utility to count entities in a standardized response
const countEntities = (response?: StandardizedResponse): number => {
  return response?.entities.length || 0;
};

// Utility to calculate average confidence of entities
const calculateAverageConfidence = (response?: StandardizedResponse): number => {
  if (!response?.entities.length) return 0;
  
  const sum = response.entities.reduce((acc, entity) => acc + entity.confidence, 0);
  return sum / response.entities.length;
};

// Define standard comparison metrics
export const standardMetrics: ComparisonMetric[] = [
  {
    name: "Execution Time",
    description: "How quickly the tool returned results",
    evaluator: (result: ToolResult) => {
      // Lower time is better - max score for <500ms, min score for >5000ms
      const time = result.executionTimeMs;
      if (time <= 500) return 10;
      if (time >= 5000) return 1;
      return 10 - ((time - 500) / 4500) * 9;
    },
    weight: 1
  },
  {
    name: "Entity Count",
    description: "Number of entities identified",
    evaluator: (result: ToolResult) => {
      // More entities is generally better (up to a point)
      const count = countEntities(result.standardizedResponse);
      if (count >= 20) return 10;
      if (count === 0) return 1;
      return 1 + (count / 20) * 9;
    },
    weight: 1.5
  },
  {
    name: "Average Confidence",
    description: "Average confidence level of identified entities",
    evaluator: (result: ToolResult) => {
      // Higher confidence is better
      const avgConfidence = calculateAverageConfidence(result.standardizedResponse);
      return avgConfidence * 10; // Scale 0-1 to 0-10
    },
    weight: 2
  },
  {
    name: "Completeness",
    description: "How complete the response is (has all expected data types)",
    evaluator: (result: ToolResult) => {
      if (!result.standardizedResponse) return 1;
      
      // Check for presence of key data types
      let score = 0;
      
      // Has a summary
      if (result.standardizedResponse.summary?.length > 10) {
        score += 2;
      }
      
      // Has entities of different types
      const entityTypes = new Set(result.standardizedResponse.entities.map(e => e.type));
      score += Math.min(5, entityTypes.size);
      
      // Has sources
      if (result.standardizedResponse.sources.length > 0) {
        score += 2;
      }
      
      // Has links
      if (result.standardizedResponse.links.length > 0) {
        score += 1;
      }
      
      return score;
    },
    weight: 2
  },
  {
    name: "User Rating",
    description: "Manual user rating of result quality",
    evaluator: (result: ToolResult) => {
      return result.score || 5; // Default to middle score if not rated
    },
    weight: 3
  }
];

// Calculate overall score for a tool result
export const calculateOverallScore = (
  result: ToolResult,
  metrics: ComparisonMetric[] = standardMetrics
): number => {
  if (!metrics.length) return 0;
  
  let totalScore = 0;
  let totalWeight = 0;
  
  metrics.forEach(metric => {
    const score = metric.evaluator(result);
    totalScore += score * metric.weight;
    totalWeight += metric.weight;
  });
  
  return totalScore / totalWeight;
};

// Compare two tool results and identify differences
export const compareResults = (
  result1: ToolResult,
  result2: ToolResult
): Record<string, any> => {
  if (!result1.standardizedResponse || !result2.standardizedResponse) {
    return { error: "One or both results don't have standardized responses" };
  }
  
  const r1 = result1.standardizedResponse;
  const r2 = result2.standardizedResponse;
  
  const differences: Record<string, any> = {
    summary: {
      tool1: r1.summary,
      tool2: r2.summary,
      difference: "Qualitative difference in summaries"
    },
    entityCount: {
      tool1: r1.entities.length,
      tool2: r2.entities.length,
      difference: r1.entities.length - r2.entities.length
    },
    confidence: {
      tool1: r1.confidence,
      tool2: r2.confidence,
      difference: r1.confidence - r2.confidence
    },
    uniqueEntities: {
      tool1: getUniqueEntities(r1, r2),
      tool2: getUniqueEntities(r2, r1)
    },
    executionTime: {
      tool1: result1.executionTimeMs,
      tool2: result2.executionTimeMs,
      difference: result1.executionTimeMs - result2.executionTimeMs
    }
  };
  
  return differences;
};

// Helper to find entities in result1 that aren't in result2
const getUniqueEntities = (
  result1: StandardizedResponse,
  result2: StandardizedResponse
): any[] => {
  // In a real application, this would have more sophisticated entity matching
  const entities1 = result1.entities;
  const entities2 = result2.entities;
  
  return entities1.filter(e1 => 
    !entities2.some(e2 => 
      e2.type === e1.type && e2.value === e1.value
    )
  );
};