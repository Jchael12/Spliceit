import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Heading, IconButton, Sheet, CloseIcon } from "@plop-ui/react";

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open) return null;

  const widths = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[rgba(20,24,48,0.38)] p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className={`w-full ${widths[size] || widths.md}`}>
        <Sheet
          tape="mustard"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{ padding: "clamp(22px, 4vw, 34px)" }}
          className="max-h-[calc(100dvh-32px)] overflow-y-auto"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Heading level={2} scribble={false} writeOn={false} id="modal-title">
                {title}
              </Heading>
              {description ? (
                <p className="paper-soft mt-2 text-[15px] leading-snug">
                  {description}
                </p>
              ) : null}
            </div>
            <IconButton
              icon={<CloseIcon />}
              label="Close dialog"
              variant="plain"
              size="sm"
              onClick={onClose}
            />
          </div>
          <div>{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </Sheet>
      </div>
    </div>,
    document.body,
  );
}
