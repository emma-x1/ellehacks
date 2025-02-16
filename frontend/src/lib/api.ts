import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Memory } from './store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const queryKeys = {
  memories: ['memories'] as const,
  memory: (id: string) => ['memory', id] as const,
  todayMemories: ['memories', 'today'] as const,
}

export const getMemories = async (): Promise<Memory[]> => {
  const response = await fetch(`${API_URL}/memories`)
  if (!response.ok) {
    throw new Error('Failed to fetch memories')
  }
  return response.json()
}

export const getMemory = async (id: string): Promise<Memory> => {
  const response = await fetch(`${API_URL}/memory/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch memory ${id}`)
  }
  return response.json()
}

export const generateImages = async () => {
  const response = await fetch(`${API_URL}/generate-images`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Failed to generate images')
  }
  return response.json()
}

export const getTodayMemories = async (): Promise<Memory[]> => {
  // TODO: Replace with your Firebase config
  const response = await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_URL}/memories.json`)
  if (!response.ok) {
    throw new Error('Failed to fetch memories')
  }
  const data = await response.json()
  
  // Convert Firebase object to array and filter for today's memories
  const memories = Object.entries(data || {}).map(([id, memory]) => ({
    id,
    ...(memory as Omit<Memory, 'id'>)
  }))

  // Filter for today's memories (you may want to adjust this logic)
  const today = new Date().toISOString().split('T')[0]
  return memories.filter(memory => memory.timestamp.startsWith(today))
}

export const deleteMemory = async (id: string): Promise<void> => {
  // TODO: Replace with your Firebase config
  const response = await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_URL}/memories/${id}.json`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete memory')
  }
}

export const useMemories = () => {
  return useQuery({
    queryKey: queryKeys.memories,
    queryFn: getMemories,
  })
}

export const useMemory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.memory(id),
    queryFn: () => getMemory(id),
    enabled: !!id,
  })
}

export const useGenerateImages = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: generateImages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memories })
    },
  })
}

export const useTodayMemories = () => {
  return useQuery({
    queryKey: queryKeys.todayMemories,
    queryFn: getTodayMemories,
  })
}

export const useDeleteMemory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayMemories })
    },
  })
} 