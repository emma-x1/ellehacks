import { create } from 'zustand'

export interface Memory {
  id: string
  topic: string
  dalle_prompt?: string
  image_url?: string
  timestamp: string
  sentences: string[]
  context: string
  summary: string
  metadata: {
    emotional_tone: string
    importance_level: number
    conversation_type: string
    visual_style: string
  }
}

interface AppState {
  selectedMemory: Memory | null
  setSelectedMemory: (memory: Memory | null) => void
  isGeneratingImages: boolean
  setIsGeneratingImages: (isGenerating: boolean) => void
}

export const useStore = create<AppState>()((set) => ({
  selectedMemory: null,
  setSelectedMemory: (memory) => set({ selectedMemory: memory }),
  isGeneratingImages: false,
  setIsGeneratingImages: (isGenerating) => set({ isGeneratingImages: isGenerating }),
})) 