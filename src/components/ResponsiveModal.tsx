import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Optional max height for mobile drawer. */
  maxHeight?: string;
  /** Optional className for the inner content surface. */
  className?: string;
}

/**
 * Renders a bottom-sheet drawer on mobile (<768px) and a centered dialog on wider screens.
 * Use this for any modal that should feel native on phones while staying conventional on desktop.
 */
const ResponsiveModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxHeight = "85vh",
  className,
}: ResponsiveModalProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={className} style={{ maxHeight }}>
          {(title || description) && (
            <DrawerHeader className="text-left">
              {title && <DrawerTitle className="font-heading">{title}</DrawerTitle>}
              {description && (
                <DrawerDescription className="font-body">{description}</DrawerDescription>
              )}
            </DrawerHeader>
          )}
          <div className="px-5 pb-6 overflow-y-auto">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle className="font-heading">{title}</DialogTitle>}
            {description && (
              <DialogDescription className="font-body">{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default ResponsiveModal;
