import { cn } from "@/lib/utils";
import React from "react";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  loading: boolean;
}
const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, loading, ...props }, ref) => (
    <div ref={ref} className="relative">
      {loading && (
        <div className="flex-col gap-6 absolute inset-0 flex items-center backdrop-blur-sm bg-black/50 justify-center z-30">
          <div className="w-8 h-8 border-2 dark:border-t-white border-t-black rounded-full animate-spin" />
        </div>
      )}
      <div {...props} className={cn(className)} />
    </div>
  )
);

Loading.displayName = "Loading";

export default Loading;
