import { motion } from 'framer-motion';

const SpyAnalysisOverlay = ({ data }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-4 right-4 w-96 bg-black/90 border-2 border-green-500 p-4 shadow-cyber"
    >
        <div className="glow-overlay"></div>
        <div className="scanline"></div>
        <h3 className="text-green-500 text-xl mb-4 font-bold">IDENTITY MATCH FOUND</h3>
        <div className="space-y-2">
            {/* Keep your spy analysis content here */}
        </div>
    </motion.div>
);

export default SpyAnalysisOverlay;