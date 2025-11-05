// API Types
export interface UserProfile {
  user_id: string;
  age: number;
  gender: string;
  conditions: string;
  [key: string]: any;
}

export interface QuestionnaireResponse {
  tracking_style: string;
  motivation: string;
  time_spent: string;
  tech_comfort: string;
  dashboard_preference: string;
}

export interface PersonaCalculationRequest {
  user_profile: UserProfile;
  questionnaire_responses: QuestionnaireResponse;
}

export interface PersonaResult {
  persona: string;
  confidence: number;
  reasoning: string;
}

export interface AIContentRequest {
  query: string;
  persona: string;
  context?: any;
}

export interface AIContentResponse {
  response: string;
  persona_adapted: boolean;
  sources?: string[];
}

export interface AIGenerationRequest {
  persona: string;
  lab_results: LabResult[];
  template_type: string;
  user_context?: any;
}

export interface AIGenerationResponse {
  content: string;
  ui_components: any;
  recommendations: string[];
}

export interface AIPromptResponse {
  prompt_template: string;
  persona_context: string;
  instructions: string[];
}

export interface LabResult {
  name: string;
  value: number;
  unit: string;
  reference_range: {
    min: number;
    max: number;
  };
  category: string;
  status: "normal" | "high" | "low" | "critical";
}

export interface AdaptiveViewResponse {
  persona: string;
  ui_components: {
    layout: string;
    components: {
      header: {
        type: string;
        title: string;
        subtitle: string;
      };
      results_view: {
        type: string;
        data: LabResult[];
        config: {
          type: string;
          highlight_abnormal: boolean;
          use_plain_language: boolean;
          show_reference_ranges: boolean;
        };
      };
      summary: {
        type: string;
        content: string;
        config: {
          type: string;
          include_recommendations: boolean;
          medical_context: boolean;
        };
      };
    };
    styling: {
      font_size: string;
      contrast: string;
      colors: string;
    };
    persona: string;
  };
  lab_results: LabResult[];
  recommendations: string[];
  cache_hit: boolean;
}

export interface PersonaInfo {
  persona?: string;
  name: string;
  description: string;
  category: string;
  status?: string;
  strengths?: string[];
  focus_areas?: string[];
  dashboard_type?: string;
  ui_preferences?: {
    show_detailed_charts?: boolean;
    show_trends?: boolean;
    show_raw_data?: boolean;
    complexity_level?: string;
    show_medical_context?: boolean;
    highlight_abnormal?: boolean;
    simple_language?: boolean;
  };
}

// API configuration
const API_BASE_URL = 'https://healthlens-api-master-320501699885.us-central1.run.app/api/v1';

// API client functions
export const api = {
  // Get adaptive view (main endpoint)
  getAdaptiveView: async (userId: string, reportId?: string) => {
    const params = new URLSearchParams({ user_id: userId });
    if (reportId) params.append('report_id', reportId);
    
    const response = await fetch(`${API_BASE_URL}/adaptive-view?${params}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  // Persona related endpoints
  persona: {
    calculate: async (userProfile: any, questionnaireResponses: any) => {
      const response = await fetch(`${API_BASE_URL}/persona/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_profile: userProfile,
          questionnaire_responses: questionnaireResponses
        })
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    },

    getInfo: async (personaType: string) => {
      const response = await fetch(`${API_BASE_URL}/persona/info/${personaType}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    }
  },

  // Data related endpoints
  data: {
    getUserProfile: async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/data/profile/${userId}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    },

    getLabResults: async (userId: string, reportId?: string) => {
      const params = reportId ? `?report_id=${reportId}` : '';
      const response = await fetch(`${API_BASE_URL}/data/lab-results/${userId}${params}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    },

    getAbnormalResults: async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/data/lab-results/${userId}/abnormal`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    }
  },

  // AI related endpoints
  ai: {
    // Get AI prompt template for persona
    getPrompt: async (personaType: string): Promise<AIPromptResponse> => {
      const response = await fetch(`${API_BASE_URL}/ai/prompt/${personaType}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    },

    // Generate AI content
    generate: async (request: AIGenerationRequest): Promise<AIGenerationResponse> => {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    },

    // Legacy endpoint for backward compatibility
    generateContent: async (query: string, persona: string, context?: any) => {
      const response = await fetch(`${API_BASE_URL}/ai/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          persona,
          context
        })
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    }
  },

  // Health check endpoint
  health: {
    check: async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      return response.json();
    }
  }
};