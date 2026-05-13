import { LoaderIcon } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Spinner component based on Shadcn design
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullPage - Whether to show the spinner in a full-page overlay
 */
export function Spinner({ className, fullPage = false, ...props }) {
  const spinnerElement = (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-8 animate-spin text-orange-500", className)}
      {...props}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-4">
        {spinnerElement}
        <p className="text-white/70 text-sm font-medium tracking-widest uppercase animate-pulse">
          Loading
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20 w-full">
      {spinnerElement}
    </div>
  );
}

export function SpinnerCustom() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
    </div>
  );
}

export default Spinner;

