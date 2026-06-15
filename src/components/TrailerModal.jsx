import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const TrailerModal = ({ isOpen, onClose, youtubeKey }) => {
  return (
    <AnimatePresence>
      {isOpen && youtubeKey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl aspect-video bg-black/90 rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-10"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/90 hover:scale-105 text-white rounded-full border border-white/10 transition-all z-20 cursor-pointer shadow-lg"
              title="Close Trailer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* YouTube Embed */}
            <iframe
              src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TrailerModal;
