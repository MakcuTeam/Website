import React, { forwardRef, useImperativeHandle, useState } from "react";

import { Dictionary } from "@/lib/dictionaries";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";

export interface DebugWindowRef {
  addInfo: (newInfo: string) => void;
  clearInfo: () => void;
}

export const DebugWindow = forwardRef<
  DebugWindowRef,
  { dict: Dictionary; progress?: number }
>((props, ref) => {
  const [info, setInfo] = useState([
    "1. Connect device",
    "2. Select firmware",
    "3. Click Flash",
  ]);

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
    <div className="flex-1 h-64 border rounded backdrop-blur-sm relative">
      <div className="p-4  border-b border-b-gray-300 dark:border-white/5">
        <Button onClick={() => setInfo([])}>
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
            className="block whitespace-pre-line border-b text-sm border-gray-300 py-2 px-4 dark:border-white/5"
          >
            {e}
          </span>
        ))}
      </div>
      <div className="p-4 border-t">
        <Progress value={props.progress} max={100} aria-label="Loading..." />
      </div>
    </div>
  );
});

DebugWindow.displayName = "DebugWindow";
