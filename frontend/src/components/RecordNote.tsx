import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

type RecordNoteProps = {
  isOpen: boolean
  onClose: () => void
}

export const RecordNote = ({ isOpen, onClose }: RecordNoteProps) => {
  const [content, setContent] = useState('')

  useEffect(() => {
    // Load content from localStorage when component mounts
    const savedContent = localStorage.getItem('recordNote')
    if (savedContent) {
      setContent(savedContent)
    }
  }, [])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    localStorage.setItem('recordNote', newContent)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#7CD7FF] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center p-4 bg-[#7CD7FF]">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-2xl font-medium">RECORD</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#FFF8E7] rounded-t-[35px] p-6 -mt-2">
        <motion.textarea
          className="w-full h-full bg-transparent resize-none outline-none text-lg"
          style={{
            lineHeight: '2.5rem',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 39px, #00000020 40px)',
            backgroundAttachment: 'local',
          }}
          value={content}
          onChange={handleContentChange}
          placeholder="Write your thoughts..."
        />
      </div>
    </motion.div>
  )
} 