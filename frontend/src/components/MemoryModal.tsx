import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'

interface MemoryModalProps {
    memory: {
        id: string
        date: string
        time: string
        topic: string
        summary: string
        context: string
        dallEPrompt: string
        metadata: {
            conversationType: string
            emotionalTone: string
            importanceLevel: number
            visualStyle: string
        }
        "image_url": string
    }
    onClose: () => void
}

export function MemoryModal({ memory, onClose }: MemoryModalProps) {
    if (!memory) {
        return null
    }
    return (
        <>
            <motion.div
                className="fixed inset-0 bg-black/40 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                className="fixed inset-x-0 top-[5%] bottom-0 z-50 bg-white rounded-t-[35px] p-6 overflow-y-auto"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 200
                }}
            >
                {/* Close Button */}
                <motion.button
                    className="absolute top-6 right-6"
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <X className="w-6 h-6" />
                </motion.button>

                {/* Memory Content */}
                <div className="space-y-6">
                    {/* Image */}
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                        <Image
                            src={memory.image_url}
                            alt={memory.topic}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Date and Time */}
                    <p className="text-gray-500">
                        {memory.date} • {memory.time}
                    </p>

                    {/* Topic */}
                    <h2 className="text-2xl font-medium">Topic: {memory.topic}</h2>

                    {/* Summary */}
                    <div>
                        <h3 className="font-medium mb-2">Summary:</h3>
                        <p>{memory.summary}</p>
                    </div>

                    {/* Context */}
                    <div>
                        <h3 className="font-medium mb-2">Context:</h3>
                        <p>{memory.context}</p>
                    </div>

                    {/* DALL-E Prompt */}
                    <div>
                        <h3 className="font-medium mb-2">DALL-E Prompt:</h3>
                        <p>{memory.dallEPrompt}</p>
                    </div>

                    {/* Metadata */}
                    <div>
                        <h3 className="font-medium mb-2">Metadata:</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Conversation Type: {memory.metadata.conversationType}</li>
                            <li>Emotional Tone: {memory.metadata.emotionalTone}</li>
                            <li>Importance Level: {memory.metadata.importanceLevel}</li>
                            <li>Visual Style: {memory.metadata.visualStyle}</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </>
    )
} 