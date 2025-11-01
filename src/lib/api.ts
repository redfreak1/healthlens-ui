// API configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

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
    generateContent: async (persona: string, labResults: any[], userContext?: any) => {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          lab_results: labResults,
          template_type: 'default',
          user_context: userContext
        })
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    }
  }
};