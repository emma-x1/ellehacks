import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
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

const INITIAL_OFFSET = 100 // Top padding
const MEMORY_GAP = 280 // Increased gap between memories
const MAX_X_OFFSET = 60 // Increased x variation
const MIN_ROTATION = 3 // Minimum rotation
const MAX_ROTATION = 8 // Maximum rotation

const formatDate = (timestamp: string) => {
    // Parse timestamp in format "2025-02-16 06-33-16"
    const [datePart, timePart] = timestamp.split(' ')
    const [year, month, day] = datePart.split('-')
    const [hours, minutes] = timePart.split('-')
    
    const date = new Date(
        Number.parseInt(year, 10),
        Number.parseInt(month, 10) - 1, // Month is 0-based
        Number.parseInt(day, 10),
        Number.parseInt(hours, 10),
        Number.parseInt(minutes, 10)
    )

    const monthName = date.toLocaleString('default', { month: 'short' })
    const dayNum = date.getDate()
    
    // Convert hours to 12-hour format with am/pm
    let hour = date.getHours()
    const ampm = hour >= 12 ? 'pm' : 'am'
    hour = hour % 12
    hour = hour || 12 // Convert 0 to 12
    const minutesStr = date.getMinutes().toString().padStart(2, '0')

    return `${monthName} ${dayNum} • ${hour}:${minutesStr}${ampm}`
}

export const All = () => {
    const [memories, setMemories] = useState<Memory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [randomPositions, setRandomPositions] = useState<Record<string, { x: number, rotate: number }>>({})
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

    useEffect(() => {
        const memoriesRef = ref(db, 'memories')
        const unsubscribe = onValue(memoriesRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                const memoriesArray = Object.entries(data).map(([id, memory]) => ({
                    id,
                    ...(memory as Omit<Memory, 'id'>)
                }))

                const sortedMemories = memoriesArray.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )

                // Generate positions with consideration for previous positions
                const positions: Record<string, { x: number, rotate: number }> = {}
                let prevX = 0 // Track previous x position
                let prevRotation = 0 // Track previous rotation

                for (const memory of sortedMemories) {
                    // Generate new x position that's different from previous
                    let newX: number
                    do {
                        newX = Math.random() * MAX_X_OFFSET * 2 - MAX_X_OFFSET
                    } while (Math.abs(newX - prevX) < MAX_X_OFFSET * 0.4)

                    // Generate rotation that's different from previous
                    let baseRotation = Math.random() * (MAX_ROTATION - MIN_ROTATION) + MIN_ROTATION
                    // Randomly increase intensity sometimes
                    if (Math.random() < 0.3) {
                        baseRotation *= 1.5
                    }
                    // Make sure it's different direction from previous
                    const newRotation = prevRotation > 0 ? -baseRotation : baseRotation
                    
                    positions[memory.id] = {
                        x: newX,
                        rotate: newRotation
                    }
                    
                    prevX = newX
                    prevRotation = newRotation
                }

                setRandomPositions(positions)
                setMemories(sortedMemories)
            } else {
                setMemories([])
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const handleDoubleClick = (memory: Memory) => {
        setSelectedMemory(memory)
        setModalOpen(true)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xl font-medium">Loading memories...</p>
            </div>
        )
    }

    if (memories.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xl font-medium">No memories yet</p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto overflow-x-hidden px-8">
            <div className="relative w-full">
                {memories.map((memory, index) => {
                    const position = randomPositions[memory.id] || { x: 0, rotate: 0 }
                    const isSelected = selectedId === memory.id
                    const yOffset = INITIAL_OFFSET + (index * MEMORY_GAP)
                    const isFirstImage = index === 0

                    return (
                        <motion.div
                            key={memory.id}
                            className="absolute left-1/2"
                            style={{ top: yOffset }}
                            animate={{
                                x: isSelected || isFirstImage ? 0 : position.x,
                                rotate: isSelected || isFirstImage ? 0 : position.rotate,
                                zIndex: isSelected ? 50 : 0,
                                scale: isSelected ? 1.05 : 1,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20
                            }}
                            whileHover={{
                                scale: isSelected ? 1.05 : 1.02,
                            }}
                            onClick={() => setSelectedId(isSelected ? null : memory.id)}
                            onDoubleClick={() => handleDoubleClick(memory)}
                        >
                            <div 
                                className={`relative w-[280px] bg-white p-6 border-2 border-black cursor-pointer transform -translate-x-1/2
                                    ${isSelected ? 'shadow-xl' : 'shadow-md'}`}
                            >
                                {/* Date Display */}
                                <p className="text-center text-sm text-gray-500 mb-4 font-medium">
                                    {formatDate(memory.timestamp)}
                                </p>

                                <div className="w-full aspect-square relative mb-4 border-2 border-black overflow-hidden">
                                    <img
                                        src={memory.image_url}
                                        alt={memory.topic}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                <p className="text-center text-lg font-medium">
                                    {memory.topic}
                                </p>
                            </div>
                        </motion.div>
                    )
                })}
                {/* Spacer div to ensure proper scrolling */}
                <div style={{ height: INITIAL_OFFSET + (memories.length * MEMORY_GAP) }} />
            </div>

            <MemoryModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                memory={selectedMemory}
            />
        </div>
    )
}