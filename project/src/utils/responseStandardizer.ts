import { StandardizedResponse, EntityType, Entity, Source } from "../types";

/**
 * Converts tool-specific response formats into a standardized structure
 */
export const standardizeResponse = (rawResponse: string, format: string): StandardizedResponse => {
  try {
    let parsedResponse;
    
    // Parse the response based on its format
    if (format.toLowerCase() === "json") {
      parsedResponse = JSON.parse(rawResponse);
    } else if (format.toLowerCase() === "xml") {
      // In a real application, you would use a proper XML parser
      // This is a simplification for demonstration purposes
      parsedResponse = parseXmlToJson(rawResponse);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    // Create a standardized response structure
    const standardized: StandardizedResponse = {
      summary: extractSummary(parsedResponse),
      entities: extractEntities(parsedResponse),
      links: extractLinks(parsedResponse),
      confidence: extractConfidence(parsedResponse),
      sources: extractSources(parsedResponse),
      metadata: {}
    };
    
    return standardized;
  } catch (error) {
    console.error("Failed to standardize response:", error);
    // Return a minimal standardized response
    return {
      summary: "Failed to standardize response",
      entities: [],
      links: [],
      confidence: 0,
      sources: [],
      metadata: { error: String(error) }
    };
  }
};

// This is a simplified example - a real implementation would be more sophisticated
const extractSummary = (parsedResponse: any): string => {
  // Try to extract summary from different common response formats
  if (parsedResponse.summary) {
    return parsedResponse.summary;
  }
  
  if (parsedResponse.analysis?.summary) {
    return parsedResponse.analysis.summary;
  }
  
  if (parsedResponse.result?.summary) {
    return parsedResponse.result.summary;
  }
  
  // For tools that don't provide a summary, generate one based on the data
  if (parsedResponse.profiles || parsedResponse.social_profiles) {
    const profiles = parsedResponse.profiles || parsedResponse.social_profiles;
    return `Found ${Array.isArray(profiles) ? profiles.length : Object.keys(profiles).length} social profiles.`;
  }
  
  if (parsedResponse.domain) {
    return `Domain information for ${parsedResponse.domain}.`;
  }
  
  if (parsedResponse.name) {
    return `Person information for ${parsedResponse.name}.`;
  }
  
  if (parsedResponse.email || parsedResponse.email_verification?.email) {
    const email = parsedResponse.email || parsedResponse.email_verification?.email;
    return `Email verification for ${email}.`;
  }
  
  return "No summary available";
};

const extractEntities = (parsedResponse: any): Entity[] => {
  const entities: Entity[] = [];
  
  // Extract people
  if (parsedResponse.name) {
    entities.push({
      type: EntityType.PERSON,
      value: parsedResponse.name,
      confidence: 0.9
    });
  }
  
  // Extract emails
  if (parsedResponse.email) {
    entities.push({
      type: EntityType.EMAIL,
      value: parsedResponse.email,
      confidence: 0.9
    });
  } else if (parsedResponse.email_verification?.email) {
    entities.push({
      type: EntityType.EMAIL,
      value: parsedResponse.email_verification.email,
      confidence: 0.9
    });
  } else if (parsedResponse.emails && Array.isArray(parsedResponse.emails)) {
    parsedResponse.emails.forEach((email: string) => {
      entities.push({
        type: EntityType.EMAIL,
        value: email,
        confidence: 0.8
      });
    });
  } else if (parsedResponse.findings?.contact_info?.emails) {
    parsedResponse.findings.contact_info.emails.forEach((email: string) => {
      entities.push({
        type: EntityType.EMAIL,
        value: email,
        confidence: 0.8
      });
    });
  }
  
  // Extract domains
  if (parsedResponse.domain) {
    entities.push({
      type: EntityType.URL,
      value: parsedResponse.domain,
      confidence: 0.9
    });
  }
  
  // Extract social profiles
  const extractProfileEntities = (profiles: any) => {
    if (Array.isArray(profiles)) {
      profiles.forEach(profile => {
        let value = profile.url || profile.username || profile.name;
        if (profile.platform && !value.includes(profile.platform.toLowerCase())) {
          value = `${profile.platform}: ${value}`;
        }
        
        entities.push({
          type: EntityType.SOCIAL_PROFILE,
          value,
          confidence: profile.likelihood || profile.confidence || 0.7
        });
      });
    } else if (typeof profiles === 'object') {
      // Handle object format (e.g., { facebook: "url", twitter: "url" })
      Object.entries(profiles).forEach(([platform, url]) => {
        entities.push({
          type: EntityType.SOCIAL_PROFILE,
          value: `${platform}: ${url}`,
          confidence: 0.7
        });
      });
    }
  };
  
  if (parsedResponse.profiles) {
    extractProfileEntities(parsedResponse.profiles);
  } else if (parsedResponse.social_profiles) {
    extractProfileEntities(parsedResponse.social_profiles);
  } else if (parsedResponse.findings?.social_profiles) {
    extractProfileEntities(parsedResponse.findings.social_profiles);
  }
  
  // Extract locations
  if (parsedResponse.location) {
    entities.push({
      type: EntityType.LOCATION,
      value: parsedResponse.location,
      confidence: 0.8
    });
  } else if (parsedResponse.locations && Array.isArray(parsedResponse.locations)) {
    parsedResponse.locations.forEach((location: string) => {
      entities.push({
        type: EntityType.LOCATION,
        value: location,
        confidence: 0.7
      });
    });
  } else if (parsedResponse.findings?.locations) {
    parsedResponse.findings.locations.forEach((location: string) => {
      entities.push({
        type: EntityType.LOCATION,
        value: location,
        confidence: 0.7
      });
    });
  }
  
  return entities;
};

const extractLinks = (parsedResponse: any): any[] => {
  // In a real application, you would extract relationship information
  // This is a simplified example
  return [];
};

const extractConfidence = (parsedResponse: any): number => {
  if (parsedResponse.confidence) {
    return parsedResponse.confidence;
  }
  
  if (parsedResponse.analysis?.confidence) {
    return parsedResponse.analysis.confidence;
  }
  
  // Default confidence for responses without explicit confidence
  return 0.5;
};

const extractSources = (parsedResponse: any): Source[] => {
  const sources: Source[] = [];
  
  if (parsedResponse.sources && Array.isArray(parsedResponse.sources)) {
    parsedResponse.sources.forEach((source: any) => {
      sources.push({
        name: source.name || "Unknown",
        url: source.url,
        date: source.date ? new Date(source.date) : undefined,
        reliability: source.reliability || 0.5
      });
    });
  }
  
  return sources;
};

// Simplistic XML to JSON converter for demonstration
// In a real application, use a proper XML parser library
const parseXmlToJson = (xml: string): any => {
  // This is a very simplistic parser for demonstration
  // It extracts key XML elements and converts them to a JSON object
  const result: Record<string, any> = {};
  
  // Extract the root element name
  const rootMatch = xml.match(/<([^\s>]+)[\s>]/);
  const rootElement = rootMatch ? rootMatch[1] : "";
  
  result[rootElement] = {};
  
  // Extract simple elements (not handling nested elements properly)
  const regex = /<([^\/>\s]+)>([^<]+)<\/\1>/g;
  let match;
  
  while ((match = regex.exec(xml)) !== null) {
    const [, key, value] = match;
    result[rootElement][key] = value.trim();
  }
  
  return result;
};