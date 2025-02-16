import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import { ref, onValue, remove } from 'firebase/database'
import { db } from '@/lib/firebase'
import { MemoryModal } from './MemoryModal'

type Memory = {
    id: string
    topic: string
    image_url: string
    timestamp: string
    summary?: string
    emotion?: string
}

const GRADIENT_VARIATIONS = [
    {
        primary: '#90E050',
        secondary: '#7CD7FF',
    },
    {
        primary: '#FF6B6B',
        secondary: '#FFD93D',
    },
    {
        primary: '#4FACFE',
        secondary: '#00F2FE',
    }
]

export const Today = () => {
    const [memories, setMemories] = useState<Memory[]>([])
    const [isLoadingMemories, setIsLoadingMemories] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
    const [rejectedMemories, setRejectedMemories] = useState<Set<string>>(new Set())
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

    useEffect(() => {
        const memoriesRef = ref(db, 'memories')
        const unsubscribe = onValue(memoriesRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                // Convert Firebase object to array and filter for today's memories
                const memoriesArray = Object.entries(data).map(([id, memory]) => ({
                    id,
                    ...(memory as Omit<Memory, 'id'>)
                }))

                // Filter for today's memories
                const today = new Date().toISOString().split('T')[0]
                const todayMemories = memoriesArray.filter(memory =>
                    memory.timestamp.startsWith(today)
                )

                setMemories(todayMemories)
            } else {
                setMemories([])
            }
            setIsLoadingMemories(false)
        })

        return () => unsubscribe()
    }, [])

    const currentMemory = memories[currentIndex]
    const hasMoreMemories = memories && currentIndex < memories.length

    // Reset error state and check if image is already loaded
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!currentMemory?.image_url) {
            setIsLoading(false)
            return
        }
        
        const img = new Image()
        img.src = currentMemory.image_url
        
        if (img.complete || loadedImages.has(currentMemory.image_url)) {
            setIsLoading(false)
            setHasError(false)
        } else {
            setIsLoading(true)
            setHasError(false)
            
            img.onload = () => {
                setLoadedImages(prev => new Set(prev).add(currentMemory.image_url))
                setIsLoading(false)
                setHasError(false)
            }
            
            img.onerror = () => {
                setIsLoading(false)
                setHasError(true)
            }
        }
    }, [currentIndex, currentMemory?.image_url, loadedImages])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const gradientColors = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * GRADIENT_VARIATIONS.length)
        return GRADIENT_VARIATIONS[randomIndex]
    }, [currentIndex])

    const handleImageLoad = () => {
        if (currentMemory?.image_url) {
            setLoadedImages(prev => new Set(prev).add(currentMemory.image_url))
            setIsLoading(false)
            setHasError(false)
        }
    }

    const handleImageError = () => {
        setIsLoading(false)
        setHasError(true)
    }

    const handleReject = async () => {
        if (!currentMemory) return
        try {
            // Add to rejected set before deleting
            setRejectedMemories(prev => new Set(prev).add(currentMemory.id))
            const memoryRef = ref(db, `memories/${currentMemory.id}`)
            await remove(memoryRef)
            setCurrentIndex(prev => prev + 1)
        } catch (error) {
            console.error('Failed to delete memory:', error)
        }
    }

    const handleDoubleClick = (memory: Memory) => {
        setSelectedMemory(memory)
        setModalOpen(true)
    }

    if (isLoadingMemories) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="text-xl font-medium">Loading memories...</p>
            </div>
        )
    }

    if (!hasMoreMemories || !currentMemory) {
        // Show summary of decisions
        const totalMemories = memories.length + rejectedMemories.size
        const remainingMemories = memories.length
        
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="text-xl font-medium mb-4">All done for today!</p>
                <p className="text-lg text-gray-600">
                    You kept {remainingMemories} out of {totalMemories} memories
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <motion.div
                className="relative w-[280px]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                }}
                onDoubleClick={() => handleDoubleClick(currentMemory)}
            >
                <div className="bg-white p-6 border-2 border-black">
                    <div className="w-full aspect-square relative mb-4 border-2 border-black overflow-hidden">
                        <AnimatePresence>
                            {(!currentMemory?.image_url || isLoading || hasError) && (
                                <motion.div
                                    className="absolute inset-0 bg-gray-100 flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className="w-48 h-48"
                                        animate={{
                                            scale: [1, 1.2, 0.9, 1.1, 1],
                                            rotate: [0, 90, 180, 270, 360],
                                            borderRadius: [
                                                "60% 40% 30% 70% / 60% 30% 70% 40%",
                                                "30% 60% 70% 40% / 50% 60% 30% 60%",
                                                "60% 40% 30% 70% / 60% 30% 70% 40%",
                                                "40% 60% 70% 30% / 40% 40% 60% 50%",
                                                "60% 40% 30% 70% / 60% 30% 70% 40%"
                                            ],
                                            background: [
                                                `linear-gradient(45deg, ${gradientColors.primary}, ${gradientColors.secondary})`,
                                                `linear-gradient(135deg, ${gradientColors.secondary}, ${gradientColors.primary})`,
                                                `linear-gradient(225deg, ${gradientColors.primary}, ${gradientColors.secondary})`,
                                                `linear-gradient(315deg, ${gradientColors.secondary}, ${gradientColors.primary})`,
                                                `linear-gradient(45deg, ${gradientColors.primary}, ${gradientColors.secondary})`
                                            ]
                                        }}
                                        transition={{
                                            duration: 8,
                                            repeat: Number.POSITIVE_INFINITY,
                                            ease: "easeInOut",
                                            times: [0, 0.25, 0.5, 0.75, 1]
                                        }}
                                        style={{
                                            filter: "blur(8px)"
                                        }}
                                    />
                                    <motion.div
                                        className="absolute w-40 h-40"
                                        animate={{
                                            scale: [1.1, 0.9, 1.2, 0.8, 1.1],
                                            rotate: [360, 270, 180, 90, 0],
                                            borderRadius: [
                                                "40% 60% 70% 30% / 40% 40% 60% 50%",
                                                "60% 40% 30% 70% / 60% 30% 70% 40%",
                                                "40% 60% 70% 30% / 40% 40% 60% 50%",
                                                "30% 60% 70% 40% / 50% 60% 30% 60%",
                                                "40% 60% 70% 30% / 40% 40% 60% 50%"
                                            ],
                                            background: [
                                                `linear-gradient(225deg, ${gradientColors.secondary}, ${gradientColors.primary})`,
                                                `linear-gradient(315deg, ${gradientColors.primary}, ${gradientColors.secondary})`,
                                                `linear-gradient(45deg, ${gradientColors.secondary}, ${gradientColors.primary})`,
                                                `linear-gradient(135deg, ${gradientColors.primary}, ${gradientColors.secondary})`,
                                                `linear-gradient(225deg, ${gradientColors.secondary}, ${gradientColors.primary})`
                                            ]
                                        }}
                                        transition={{
                                            duration: 8,
                                            repeat: Number.POSITIVE_INFINITY,
                                            ease: "easeInOut",
                                            times: [0, 0.25, 0.5, 0.75, 1]
                                        }}
                                        style={{
                                            filter: "blur(4px)"
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.img
                            src={currentMemory.image_url}
                            alt={currentMemory.topic}
                            className="w-full h-full object-cover"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isLoading || hasError ? 0 : 1 }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <motion.p 
                        className="text-center text-lg font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {currentMemory.topic}
                    </motion.p>
                </div>
            </motion.div>

            <motion.div 
                className="flex gap-12 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <motion.button
                    type="button"
                    className="w-16 h-16 bg-[#90E050] rounded-lg flex items-center justify-center text-2xl font-bold border-2 border-black"
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    O
                </motion.button>
                <motion.button
                    type="button"
                    className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center text-2xl font-bold border-2 border-black"
                    onClick={handleReject}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    X
                </motion.button>
            </motion.div>

            <MemoryModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                memory={selectedMemory}
            />
        </div>
    )
}