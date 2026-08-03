"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface MetricDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function MetricDetailDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: MetricDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#0f0f1a] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-medium">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-white/40">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
