import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Hook for getting adaptive view data
export const useAdaptiveView = (userId: string, reportId?: string) => {
  return useQuery({
    queryKey: ['adaptiveView', userId, reportId],
    queryFn: () => api.getAdaptiveView(userId, reportId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for calculating persona
export const useCalculatePersona = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userProfile, questionnaireResponses }: {
      userProfile: any;
      questionnaireResponses: any;
    }) => api.persona.calculate(userProfile, questionnaireResponses),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['adaptiveView'] });
    },
  });
};

// Hook for getting user profile
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => api.data.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting lab results
export const useLabResults = (userId: string, reportId?: string) => {
  return useQuery({
    queryKey: ['labResults', userId, reportId],
    queryFn: () => api.data.getLabResults(userId, reportId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting abnormal results
export const useAbnormalResults = (userId: string) => {
  return useQuery({
    queryKey: ['abnormalResults', userId],
    queryFn: () => api.data.getAbnormalResults(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for generating AI content
export const useGenerateAIContent = () => {
  return useMutation({
    mutationFn: ({ persona, labResults, userContext }: {
      persona: string;
      labResults: any[];
      userContext?: any;
    }) => api.ai.generateContent(persona, labResults, userContext),
  });
};