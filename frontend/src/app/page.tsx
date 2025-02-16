'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Archive } from "@/components/Archive"
import { Record } from "@/components/Record"
import { Share } from "@/components/Share"
import { BearHead } from "@/components/BearHead"
import { BearBody } from "@/components/BearBody"
import { Letter } from "@/components/Letter"
import { Cloud } from "@/components/Cloud"
import { Stick } from "@/components/Stick"
import { Paper } from "@/components/Paper"
import { Blood } from "@/components/Blood"
import { Coffin } from "@/components/Coffin"
import { RecordNote } from "@/components/RecordNote"
import { X } from 'lucide-react'
import { useState } from 'react'
import { Today } from "@/components/Today"
import { All } from '@/components/All'
import { ArrowLeft } from 'lucide-react'
import { ShareModal } from "@/components/ShareModal"

export default function Home() {
  const [isZoomed, setIsZoomed] = useState(false)
  const [isRecordZoomed, setIsRecordZoomed] = useState(false)
  const [isRecordNoteOpen, setIsRecordNoteOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isAllMode, setIsAllMode] = useState(false)
  const [isDeathAnimating, setIsDeathAnimating] = useState(false)
  const [isDeathComplete, setIsDeathComplete] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const handleLetterClick = () => {
    if (isZoomed) {
      setIsDrawerOpen(true)
    }
  }

  const handlePaperClick = () => {
    if (isRecordZoomed) {
      setIsRecordNoteOpen(true)
    }
  }

  const handleClose = () => {
    setIsDrawerOpen(false)
    setIsZoomed(false)
    setIsRecordZoomed(false)
    setIsAllMode(false)
  }

  const handleRecordNoteClose = () => {
    setIsRecordNoteOpen(false)
    setIsRecordZoomed(false)
  }

  const handleBearClick = () => {
    if (!isDeathAnimating && !isDeathComplete) {
      setIsDeathAnimating(true)
      setTimeout(() => {
        setIsDeathAnimating(false)
        setIsDeathComplete(true)
      }, 2000)
    }
  }

  const handleDeathModalClose = () => {
    setIsDeathComplete(false)
    setIsDeathAnimating(false)
  }

  return (
    <main className="min-h-screen relative overflow-hidden md:hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="w-full h-[50%] bg-[#7CD7FF]" />
        <div className="w-full h-[50%] bg-[#90E050]" />
      </div>

      {/* Death Screen Modal */}
      <AnimatePresence>
        {isDeathComplete && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDeathModalClose}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed inset-0 z-50 flex items-end pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 20, delay: 0.3 }}
                className="w-full bg-black rounded-t-[35px] p-8 text-center pointer-events-auto"
              >
                <p className="text-[#90E050] text-2xl font-medium mb-6">
                  Is William no longer with us?
                </p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 20, delay: 0.5 }}
                  className="w-[180px] h-[180px] mx-auto mb-6 flex items-center justify-center"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Coffin />
                  </div>
                </motion.div>

                <button
                  type="button"
                  onClick={handleDeathModalClose}
                  className="bg-[#90E050] text-black px-12 py-3 rounded-lg text-xl font-medium"
                >
                  Yes
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Layout - Absolutely positioned elements */}
      <div className="relative w-full h-screen">
        {/* Escape Button */}
        <AnimatePresence>
          {(isZoomed || isRecordZoomed) && !isDrawerOpen && (
            <motion.button
              className="fixed top-6 right-6 z-50 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => {
                setIsZoomed(false)
                setIsRecordZoomed(false)
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
            >
              <X className="w-6 h-6 text-gray-800" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Notes Slide Up */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Overlay for closing */}
              <motion.div
                className="fixed inset-0 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleClose()
                }}
                role="button"
                tabIndex={0}
              />

              <div className="flex items-center p-4 bg-[#7CD7FF]">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </motion.button>
                  <h1 className="text-2xl font-medium">ARCHIVE</h1>
                </div>
              </div>

              {/* Tab Interface */}
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 w-screen min-h-screen"
                initial={{ y: "100%" }}
                animate={{ y: "5%" }}
                exit={{ y: "100%" }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 200
                }}
              >
                {/* Header */}
                {/* <div className="flex items-center p-4 bg-[#7CD7FF]">
                  <div className="flex items-center gap-4">
                    <motion.button
                      onClick={handleClose}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </motion.button>
                    <h1 className="text-2xl font-medium">ARCHIVE</h1>
                  </div>
                </div> */}

                {/* Tab Headers */}
                <div className="flex w-full mt-2">
                  <div className="flex gap-0">
                    <motion.button
                      className={`w-[140px] h-[35px] relative ${!isAllMode ? 'z-10' : 'z-0'}`}
                      onClick={() => setIsAllMode(false)}
                    >
                      <div className={`absolute inset-0 ${!isAllMode ? 'bg-[#FFF8E7]' : 'bg-[#9B9B9B]'}`} style={{
                        borderRadius: '35px 35px 0 0',
                      }} />
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-medium">TODAY</span>
                    </motion.button>
                    <motion.button
                      className={`w-[140px] h-[35px] relative -ml-[5px] ${isAllMode ? 'z-10' : 'z-0'}`}
                      onClick={() => setIsAllMode(true)}
                    >
                      <div className={`absolute inset-0 ${isAllMode ? 'bg-[#FFF8E7]' : 'bg-[#9B9B9B]'}`} style={{
                        borderRadius: '35px 35px 0 0',
                      }} />
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-medium">ALL</span>
                    </motion.button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="bg-[#FFF8E7] h-[95vh] -mt-[1px]">
                  {isAllMode ? (
                    <All />
                  ) : (
                    <Today />
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Cloud */}
        <motion.div
          className="absolute top-[10%] -left-[100%]"
          animate={{
            x: isZoomed ? -200 : [200, 900],
            opacity: isDrawerOpen ? 0 : (isZoomed ? 0 : 1)
          }}
          transition={{
            x: {
              duration: isZoomed ? 0.8 : 5,
              repeat: isZoomed ? 0 : Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: isZoomed ? "easeInOut" : "linear"
            },
            opacity: { duration: 0.5 }
          }}
        >
          <Cloud />
        </motion.div>

        {/* Bear Group */}
        <motion.div
          className="absolute w-[220px] h-[220px] left-[5%] bottom-[20%] cursor-pointer"
          animate={{
            x: isZoomed ? -300 : 0,
            opacity: (isDrawerOpen || isRecordZoomed) ? 0 : (isZoomed ? 0 : 1),
          }}
          transition={{
            duration: 0.8,
            rotate: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut"
            },
            ease: "easeInOut"
          }}
          onClick={handleBearClick}
        >
          {/* Bear Body */}
          <div className="absolute inset-0 left-[15px]">
            <BearBody />
          </div>
          {/* Bear Head */}
          <motion.div
            className="absolute top-[-35%] w-[65%] h-[65%] left-[20%]"
            animate={{
              y: isDeathAnimating || isDeathComplete ? 50 : (isZoomed ? 0 : [3, -3, 3]),
              rotate: isDeathAnimating || isDeathComplete ? 5 : (isZoomed ? 0 : [-2, 2, -2])
            }}
            transition={isDeathAnimating ? {
              y: { duration: 0.5, ease: "easeIn" }
            } : {
              duration: 4,
              repeat: isZoomed ? 0 : Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          >
            <BearHead />
          </motion.div>

          {/* Blood */}
          <AnimatePresence>
            {(isDeathAnimating || isDeathComplete) && (
              <motion.div
                className="absolute left-[10%] top-[15%] w-full h-full"
                initial={{ opacity: 0, rotate: 10 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -10 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Blood />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Letter Box */}
        <motion.div
          className="absolute bottom-[42%] right-[8%] cursor-pointer"
          layout
          animate={{
            scale: isZoomed ? 1.5 : 1,
            x: isZoomed ? -100 : 0,
            y: isZoomed ? 50 : 0,
            opacity: (isDrawerOpen || isRecordZoomed) ? 0 : 1
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
          onClick={handleLetterClick}
        >
          <Letter />
        </motion.div>

        {/* Paper and Pencil */}
        <motion.div
          className="absolute w-[200px] h-[140px] left-[2%] bottom-[1%] cursor-pointer"
          animate={{
            scale: isRecordZoomed ? 1.5 : 1,
            x: isRecordZoomed ? 100 : (isZoomed ? -300 : 0),
            y: isRecordZoomed ? -200 : 0,
            opacity: isDrawerOpen ? 0 : (isZoomed ? 0 : 1)
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
          onClick={handlePaperClick}
        >
          <Paper />
        </motion.div>

        {/* Record Note */}
        <AnimatePresence>
          {isRecordNoteOpen && (
            <RecordNote
              isOpen={isRecordNoteOpen}
              onClose={handleRecordNoteClose}
            />
          )}
        </AnimatePresence>

        {/* Signpost */}
        <motion.div
          className="absolute right-[170px] bottom-[280px]"
          animate={{
            x: (isZoomed || isRecordZoomed) ? 300 : 0,
            opacity: isDrawerOpen ? 0 : ((isZoomed || isRecordZoomed) ? 0 : 1)
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          {/* Stick */}
          <div className="absolute inset-0 left-[70px] top-[15px]">
            <Stick />
          </div>

          {/* Signs */}
          <div className="absolute inset-0 flex flex-col justify-between py-8">
            <motion.button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
            >
              <Archive />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIsRecordZoomed(!isRecordZoomed)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
            >
              <Record />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
            >
              <Share />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Message for larger screens */}
      <div className="hidden md:flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Please view on mobile device</p>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}