import { OsintTool, ToolCategory, ToolCapability } from "../types";

// This mock data would typically be stored in a database
let tools: OsintTool[] = [
  {
    id: "1",
    name: "SocialNetsQuery",
    description: "AI-powered social media analysis tool",
    url: "https://api.socialsleuth.example",
    isActive: true,
    category: ToolCategory.SOCIAL_MEDIA,
    capabilities: [ToolCapability.SOCIAL_PROFILES, ToolCapability.PERSON_SEARCH],
    responseFormat: "JSON"
  },
  {
    id: "2",
    name: "DomainIntelligence",
    description: "WHOIS and domain intelligence platform",
    url: "https://api.domainintel.example",
    isActive: true,
    category: ToolCategory.DOMAIN_INFO,
    capabilities: [ToolCapability.DOMAIN_WHOIS],
    responseFormat: "JSON"
  },
  {
    id: "3",
    name: "PersonFinder",
    description: "Comprehensive person information discovery",
    url: "https://api.personfinder.example",
    isActive: true,
    category: ToolCategory.PERSON_INFO,
    capabilities: [ToolCapability.PERSON_SEARCH, ToolCapability.SOCIAL_PROFILES],
    responseFormat: "JSON"
  },
  {
    id: "4",
    name: "EmailVerify",
    description: "Email verification and intelligence",
    url: "https://api.emailverify.example",
    isActive: true,
    category: ToolCategory.EMAIL_INFO,
    capabilities: [ToolCapability.EMAIL_VERIFICATION],
    responseFormat: "XML"
  },
  {
    id: "5",
    name: "CyberEye",
    description: "All-in-one OSINT platform",
    url: "https://api.cybereye.example",
    isActive: true,
    category: ToolCategory.GENERAL,
    capabilities: [
      ToolCapability.PERSON_SEARCH,
      ToolCapability.SOCIAL_PROFILES,
      ToolCapability.DOMAIN_WHOIS,
      ToolCapability.EMAIL_VERIFICATION,
      ToolCapability.IP_LOOKUP
    ],
    responseFormat: "JSON"
  }
];

export const getAllTools = (): OsintTool[] => {
  return [...tools];
};

export const getToolById = (id: string): OsintTool | undefined => {
  return tools.find(tool => tool.id === id);
};

export const getActiveTools = (): OsintTool[] => {
  return tools.filter(tool => tool.isActive);
};

export const addTool = (tool: Omit<OsintTool, "id">): OsintTool => {
  const newTool = {
    ...tool,
    id: Date.now().toString()
  };
  
  tools.push(newTool);
  return newTool;
};

export const updateTool = (id: string, updates: Partial<OsintTool>): OsintTool | null => {
  const index = tools.findIndex(tool => tool.id === id);
  
  if (index === -1) {
    return null;
  }
  
  tools[index] = { ...tools[index], ...updates };
  return tools[index];
};

export const deleteTool = (id: string): boolean => {
  const initialLength = tools.length;
  tools = tools.filter(tool => tool.id !== id);
  return tools.length !== initialLength;
};

export const toggleToolActive = (id: string): OsintTool | null => {
  const tool = tools.find(tool => tool.id === id);
  
  if (!tool) {
    return null;
  }
  
  tool.isActive = !tool.isActive;
  return tool;
};