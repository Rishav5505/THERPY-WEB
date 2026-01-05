import { motion } from "framer-motion";

const Skeleton = ({ className, repeat = 1 }) => {
    const items = Array.from({ length: repeat });

    return (
        <>
            {items.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`bg-slate-200 dark:bg-slate-800 rounded-2xl ${className}`}
                />
            ))}
        </>
    );
};

export default Skeleton;
