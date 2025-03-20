
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Locale } from "@/lib/locale";
import { Dictionary } from "@/lib/dictionaries";
import { Button } from "./ui/button";

export const DebugWindow = forwardRef<{}, { dict: Dictionary }>(
  (props, ref) => {
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

    return (
      <div className="flex-1 border-l dark:bg-black bg-slate-200 text-black dark:text-white">
        <div className="p-2  border-b border-b-gray-300 dark:border-white/5">
          <Button size="xs" onClick={() => setInfo([])}>
            {props.dict.tools.clearDebugInfo}
          </Button>
        </div>
        <div className="w-full h-56 text-sm overflow-y-auto">
          {info.map((e, k) => (
            <span
              key={k}
              className="block border-b text-xs border-gray-300 py-2 px-3 dark:border-white/5 "
            >
              {e}
            </span>
          ))}
        </div>
      </div>
    );
  }
);
