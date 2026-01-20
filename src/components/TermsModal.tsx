import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
}

const TermsModal = ({ open, onClose, content }: TermsModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white max-w-3xl w-full rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Terms & Conditions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto prose prose-sm">
          {/* ⚠️ trusted HTML from backend */}
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        <div className="p-4 border-t text-right">
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsModal;