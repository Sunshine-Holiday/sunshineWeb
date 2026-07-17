import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  /** Modal heading — defaults to Terms & Conditions */
  title?: string;
  loading?: boolean;
}

const TermsModal = ({
  open,
  onClose,
  content,
  title = "Terms & Conditions",
  loading = false,
}: TermsModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-black"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="prose prose-sm max-h-[70vh] overflow-y-auto p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="text-sm text-slate-500">No content available.</p>
          )}
        </div>

        <div className="border-t p-4 text-right">
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsModal;