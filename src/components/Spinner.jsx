import { motion } from "framer-motion";

const Spinner = ({ fullPage = false }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow */}
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-orange-500/20 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Outer Orbiting Ring */}
        <motion.div
          className="w-24 h-24 rounded-full border-2 border-dashed border-orange-500/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Main Spinning Gradient Ring */}
        <motion.div
          className="absolute w-20 h-20 rounded-full border-t-4 border-l-4 border-orange-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner Counter-Spinning Ring */}
        <motion.div
          className="absolute w-14 h-14 rounded-full border-b-4 border-r-4 border-white/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Center Pulsing Logo/Dot */}
        <motion.div
          className="absolute w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"
          animate={{
            scale: [1, 1.5, 1],
            boxShadow: [
              "0 0 15px rgba(249,115,22,0.8)",
              "0 0 30px rgba(249,115,22,1)",
              "0 0 15px rgba(249,115,22,0.8)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <motion.h3
          className="text-2xl font-black tracking-[0.3em] uppercase text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-200 to-white">
            Loading
          </span>
        </motion.h3>
        
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-orange-500 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000] backdrop-blur-xl"
      >
        {spinnerContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center py-32 w-full"
    >
      {spinnerContent}
    </motion.div>
  );
};

export default Spinner;
