"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface MetricDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function MetricDetailDialog({
  open,
  onOpenChange,
  title,
  description,
  headerRight,
  children,
}: MetricDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-[#0a0a14]/95 backdrop-blur-2xl border-white/[0.06] text-white rounded-3xl p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-white text-lg font-medium">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-white/35 text-xs mt-1">
                    {description}
                  </DialogDescription>
                )}
              </div>
              {headerRight}
            </div>
          </DialogHeader>
        </div>
        <div className="p-6 pt-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
