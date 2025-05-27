import { Investigation, InvestigationType, ToolResult, ResultStatus, StandardizedResponse } from "../types";
import { getToolById } from "./toolService";
import { standardizeResponse } from "../utils/responseStandardizer";

// This would typically be stored in a database
let investigations: Investigation[] = [];

export const createInvestigation = (
  query: string,
  type: InvestigationType,
  toolIds: string[]
): Investigation => {
  const newInvestigation: Investigation = {
    id: Date.now().toString(),
    query,
    type,
    date: new Date(),
    toolIds,
    results: toolIds.map(toolId => ({
      toolId,
      status: ResultStatus.PENDING,
      rawResponse: "",
      processedAt: new Date(),
      executionTimeMs: 0
    }))
  };
  
  investigations.push(newInvestigation);
  return newInvestigation;
};

export const getInvestigationById = (id: string): Investigation | undefined => {
  return investigations.find(inv => inv.id === id);
};

export const getAllInvestigations = (): Investigation[] => {
  return [...investigations];
};

export const deleteInvestigation = (id: string): boolean => {
  const initialLength = investigations.length;
  investigations = investigations.filter(inv => inv.id !== id);
  return investigations.length !== initialLength;
};

export const updateToolResult = (
  investigationId: string,
  toolId: string,
  rawResponse: string,
  executionTimeMs: number
): Investigation | null => {
  const investigation = investigations.find(inv => inv.id === investigationId);
  
  if (!investigation) {
    return null;
  }
  
  const resultIndex = investigation.results.findIndex(res => res.toolId === toolId);
  
  if (resultIndex === -1) {
    return null;
  }
  
  // Update the raw response
  investigation.results[resultIndex] = {
    ...investigation.results[resultIndex],
    rawResponse,
    status: ResultStatus.COMPLETED,
    processedAt: new Date(),
    executionTimeMs
  };
  
  // Attempt to standardize the response
  try {
    const tool = getToolById(toolId);
    if (tool) {
      const standardizedResponse = standardizeResponse(rawResponse, tool.responseFormat);
      investigation.results[resultIndex].standardizedResponse = standardizedResponse;
    }
  } catch (error) {
    console.error(`Failed to standardize response for tool ${toolId}:`, error);
  }
  
  return investigation;
};

export const rateToolResult = (
  investigationId: string,
  toolId: string,
  score: number,
  notes?: string
): Investigation | null => {
  const investigation = investigations.find(inv => inv.id === investigationId);
  
  if (!investigation) {
    return null;
  }
  
  const resultIndex = investigation.results.findIndex(res => res.toolId === toolId);
  
  if (resultIndex === -1) {
    return null;
  }
  
  investigation.results[resultIndex] = {
    ...investigation.results[resultIndex],
    score,
    notes
  };
  
  return investigation;
};

// Simulates running an investigation against tools
// In a real application, this would make actual API calls
export const runInvestigation = async (investigation: Investigation): Promise<Investigation> => {
  const updatedInvestigation = { ...investigation };
  
  // Process each tool in parallel
  const resultPromises = investigation.toolIds.map(async toolId => {
    const tool = getToolById(toolId);
    if (!tool) {
      return {
        toolId,
        status: ResultStatus.FAILED,
        rawResponse: "Tool not found",
        processedAt: new Date(),
        executionTimeMs: 0
      };
    }
    
    // Simulate API call with random delay
    const startTime = Date.now();
    try {
      // In a real app, this would be an actual API call
      const rawResponse = await simulateApiCall(investigation.query, tool.name);
      const executionTimeMs = Date.now() - startTime;
      
      const result: ToolResult = {
        toolId,
        status: ResultStatus.COMPLETED,
        rawResponse,
        processedAt: new Date(),
        executionTimeMs
      };
      
      // Attempt to standardize the response
      try {
        const standardizedResponse = standardizeResponse(rawResponse, tool.responseFormat);
        result.standardizedResponse = standardizedResponse;
      } catch (error) {
        console.error(`Failed to standardize response for tool ${toolId}:`, error);
      }
      
      return result;
    } catch (error) {
      return {
        toolId,
        status: ResultStatus.FAILED,
        rawResponse: String(error),
        processedAt: new Date(),
        executionTimeMs: Date.now() - startTime
      };
    }
  });
  
  updatedInvestigation.results = await Promise.all(resultPromises);
  
  // Update the investigation in our "database"
  const index = investigations.findIndex(inv => inv.id === investigation.id);
  if (index !== -1) {
    investigations[index] = updatedInvestigation;
  }
  
  return updatedInvestigation;
};

// Helper function to simulate API call with mock data
const simulateApiCall = (query: string, toolName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const delay = 1000 + Math.random() * 2000; // Random delay between 1-3 seconds
    
    setTimeout(() => {
      // 10% chance of failure to simulate real-world conditions
      if (Math.random() < 0.1) {
        reject(new Error(`API call to ${toolName} failed`));
        return;
      }
      
      // Generate mock response based on tool and query
      const response = generateMockResponse(query, toolName);
      resolve(response);
    }, delay);
  });
};

const generateMockResponse = (query: string, toolName: string): string => {
  // This would generate appropriate mock data based on the tool and query
  // For a real app, this would be replaced with actual API calls
  
  const mockResponses: Record<string, any> = {
    SocialNetsQuery: {
      query,
      profiles: [
        { platform: "Twitter", username: `${query.toLowerCase().replace(/\s+/g, "")}`, likelihood: 0.85 },
        { platform: "LinkedIn", name: query, position: "Software Engineer", likelihood: 0.78 },
        { platform: "Instagram", username: `${query.toLowerCase().split(" ")[0]}`, likelihood: 0.65 }
      ],
      summary: `Found 3 potential profiles for ${query} with varying confidence levels.`
    },
    DomainIntelligence: {
      domain: query.includes(".") ? query : `${query}.com`,
      registrar: "GoDaddy.com, LLC",
      created: "2015-03-17T14:32:15Z",
      expires: "2025-03-17T14:32:15Z",
      nameservers: ["ns1.example.com", "ns2.example.com"],
      ip: "192.168.1.1",
      location: "United States"
    },
    PersonFinder: {
      name: query,
      age: 35,
      locations: ["New York, NY", "San Francisco, CA"],
      emails: [`${query.toLowerCase().replace(/\s+/g, ".")}@gmail.com`],
      phones: ["+1 (555) 123-4567"],
      relatives: ["Jane Doe", "John Doe Jr."],
      social_profiles: {
        facebook: `facebook.com/${query.toLowerCase().replace(/\s+/g, "")}`,
        twitter: `twitter.com/${query.toLowerCase().replace(/\s+/g, "")}`,
        linkedin: `linkedin.com/in/${query.toLowerCase().replace(/\s+/g, "-")}`
      }
    },
    EmailVerify: `
      <?xml version="1.0" encoding="UTF-8"?>
      <email_verification>
        <email>${query}</email>
        <valid>true</valid>
        <disposable>false</disposable>
        <deliverable>true</deliverable>
        <domain_age>2563</domain_age>
        <first_name>John</first_name>
        <last_name>Doe</last_name>
        <company>Example Corp</company>
      </email_verification>
    `,
    CyberEye: {
      input: query,
      analysis: {
        type: query.includes("@") ? "email" : (query.includes(".") ? "domain" : "person"),
        confidence: 0.89,
        summary: `Comprehensive analysis for ${query} reveals moderate digital footprint.`
      },
      findings: {
        social_profiles: [
          { platform: "Twitter", url: `https://twitter.com/${query.toLowerCase().replace(/\s+/g, "")}` },
          { platform: "LinkedIn", url: `https://linkedin.com/in/${query.toLowerCase().replace(/\s+/g, "-")}` }
        ],
        contact_info: {
          emails: [`${query.toLowerCase().replace(/\s+/g, ".")}@gmail.com`],
          phones: ["+1 (555) 123-4567"]
        },
        locations: ["New York, NY"],
        associations: ["Example Corp", "Tech Meetup Group"],
        related_entities: ["Jane Doe", "Example Corp"]
      }
    }
  };
  
  const mockResponse = mockResponses[toolName] || { error: "No mock data available for this tool" };
  return JSON.stringify(mockResponse, null, 2);
};