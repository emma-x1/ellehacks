import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

interface AccessItem {
  id: number
  email: string
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [accessList, setAccessList] = useState<AccessItem[]>([])
  const [isShared, setIsShared] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim() && !accessList.some(item => item.email === email.trim())) {
      setAccessList([...accessList, { id: Date.now(), email: email.trim() }])
      setEmail('')
    }
  }

  const handleRemoveAccess = (id: number) => {
    setAccessList(accessList.filter(item => item.id !== id))
  }

  const handleShare = () => {
    setIsShared(true)
    // After 2 seconds, close the modal
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  if (isShared) {
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-[#7CD7FF] flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-[#90E050] rounded-full flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-medium text-center text-white">
          Thank you for using Memoize!
        </h2>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#7CD7FF] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-2xl font-medium">Share</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#FFF8E7] p-6 flex flex-col">
        <h2 className="text-2xl font-medium text-center mb-2">Leave behind memories</h2>
        <h2 className="text-2xl font-medium text-center mb-8">for your loved ones</h2>

        {/* Email Input Form */}
        <form onSubmit={handleEmailSubmit} className="mb-8">
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={handleEmailChange}
            className="w-full px-4 py-3 border border-black rounded-lg bg-transparent"
          />
        </form>

        {/* Access List */}
        <div className="flex-1">
          <h3 className="text-lg mb-4">Who has access</h3>
          <div className="space-y-4">
            <AnimatePresence>
              {accessList.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#7CD7FF] rounded-full overflow-hidden flex items-center justify-center text-white text-xl">
                      {item.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{item.email}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemoveAccess(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Share Button */}
        <motion.button
          className="w-full bg-black text-white py-4 rounded-lg text-xl font-medium mt-6"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          disabled={accessList.length === 0}
        >
          Share
        </motion.button>
      </div>
    </motion.div>
  )
} 