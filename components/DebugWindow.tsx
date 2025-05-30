import React, { forwardRef, useImperativeHandle, useState } from "react";

import { Dictionary } from "@/lib/dictionaries";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";

export const DebugWindow = forwardRef<
  {},
  { dict: Dictionary; progress?: number }
>((props, ref) => {
  const [info, setInfo] = useState(["Welcome!"]);

  useImperativeHandle(ref, () => ({
    addInfo: (newInfo: string) => {
      if (newInfo.trim() === "") {
        return;
      }
      setInfo((prev) => [...prev, newInfo]);
    },
    clearInfo: () => {
      setInfo([]);
    },
  }));

  const chatContainerRef = useScrollToBottom<HTMLDivElement>({
    dependency: [info],
    smooth: true,
  });

  return (
    <div className="flex-1 border rounded backdrop-blur-sm">
      <div className="p-4  border-b border-b-gray-300 dark:border-white/5">
        <Button size="xs" onClick={() => setInfo([])}>
          {props.dict.tools.clearDebugInfo}
        </Button>
      </div>

      <div
        className="w-full h-44 text-sm overflow-y-auto"
        ref={chatContainerRef}
      >
        {info.map((e, k) => (
          <span
            key={k}
            className="block border-b text-xs border-gray-300 py-2 px-4 dark:border-white/5"
          >
            {e}
          </span>
        ))}
      </div>
      <div className="p-4 border-t">
        <Progress value={props.progress} max={10} aria-label="Loading..." />
      </div>
    </div>
  );
});
