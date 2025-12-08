"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import type { Locale } from "@/lib/locale";
import { Send, Trash2 } from "lucide-react";
import Link from "next/link";

type SerialTerminalProps = {
  lang: Locale;
};

interface SerialLine {
  id: number;
  timestamp: number;
  type: "incoming" | "outgoing";
  data: string;
  rawBytes?: string;
}

export function SerialTerminal({ lang }: SerialTerminalProps) {
  const { status, mode, port, subscribeToTextLogs } = useMakcuConnection();
  const [lines, setLines] = useState<SerialLine[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineIdRef = useRef(0);
  const currentLineBufferRef = useRef("");
  const isCn = lang === "cn";
  
  // Serial terminal is only available in normal mode
  const isNormalMode = status === "connected" && mode === "normal";

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [lines]);

  // Subscribe to incoming text/log data (non-0x50 data only)
  // Subscribe in both normal and flash mode - flash logs come through textLogSubscribers
  useEffect(() => {
    if (status !== "connected" || !subscribeToTextLogs) return;

    const handleTextLogData = (value: Uint8Array) => {
      // This callback only receives non-0x50 data (text/logs)
      // No filtering needed - the broadcaster already filtered it

      // Decode as text (UTF-8)
      let textData = "";
      let hexBytes = "";
      try {
        textData = new TextDecoder("utf-8", { fatal: false }).decode(value);
      } catch (e) {
        textData = `[Binary: ${value.length} bytes]`;
      }

      // Filter out ESPLoader warnings that are harmless
      // These warnings appear even though we're providing correct flash settings
      const filteredWarnings = [
        "image file at 0x0 doesn't look like an image file",
        "so not changing any flash settings",
      ];
      
      // Process text data line by line
      setLines((prev) => {
        const newLines: SerialLine[] = [];
        let buffer = currentLineBufferRef.current;

        // Process each character
        for (let i = 0; i < textData.length; i++) {
          const char = textData[i];
          const nextChar = textData[i + 1];

          // Check for line terminators
          if (char === "\r" && nextChar === "\n") {
            // CRLF - check if this line should be filtered
            const lineToCheck = (buffer + currentLineBufferRef.current).toLowerCase();
            const shouldFilter = filteredWarnings.some(warning => lineToCheck.includes(warning));
            
            if (!shouldFilter && (buffer.length > 0 || prev.length === 0 || prev[prev.length - 1]?.data.length > 0)) {
              newLines.push({
                id: lineIdRef.current++,
                timestamp: Date.now(),
                type: "incoming",
                data: buffer,
                rawBytes: hexBytes,
              });
            }
            buffer = "";
            i++; // Skip the LF
          } else if (char === "\n") {
            // LF - check if this line should be filtered
            const lineToCheck = (buffer + currentLineBufferRef.current).toLowerCase();
            const shouldFilter = filteredWarnings.some(warning => lineToCheck.includes(warning));
            
            if (!shouldFilter && (buffer.length > 0 || prev.length === 0 || prev[prev.length - 1]?.data.length > 0)) {
              newLines.push({
                id: lineIdRef.current++,
                timestamp: Date.now(),
                type: "incoming",
                data: buffer,
                rawBytes: hexBytes,
              });
            }
            buffer = "";
          } else if (char === "\r") {
            // CR alone - check if this line should be filtered
            const lineToCheck = (buffer + currentLineBufferRef.current).toLowerCase();
            const shouldFilter = filteredWarnings.some(warning => lineToCheck.includes(warning));
            
            if (!shouldFilter && (buffer.length > 0 || prev.length === 0 || prev[prev.length - 1]?.data.length > 0)) {
              newLines.push({
                id: lineIdRef.current++,
                timestamp: Date.now(),
                type: "incoming",
                data: buffer,
                rawBytes: hexBytes,
              });
            }
            buffer = "";
          } else {
            buffer += char;
          }
        }

        // Update buffer
        currentLineBufferRef.current = buffer;

        // If buffer has content but no new line was created in this chunk, we'll keep it for next chunk
        // Add remaining buffer as a line only if we have other lines or it's significant
        if (buffer.length > 0 && textData.length > 0 && newLines.length === 0) {
          // This is continuing a previous line, don't create new line yet
        }

        // Handle binary data
        if (textData.length === 0 && value.length > 0) {
          // Lazily compute hex only if we need to show it
          if (!hexBytes) {
            hexBytes = Array.from(value)
              .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
              .join(" ");
          }
          newLines.push({
            id: lineIdRef.current++,
            timestamp: Date.now(),
            type: "incoming",
            data: `[Binary: ${value.length} bytes]`,
            rawBytes: hexBytes,
          });
        }

        // Limit to last 1000 lines to prevent memory issues
        const allLines = [...prev, ...newLines];
        return allLines.slice(-1000);
      });
    };

    const unsubscribe = subscribeToTextLogs(handleTextLogData);

    return () => {
      unsubscribe();
      currentLineBufferRef.current = "";
    };
  }, [status, subscribeToTextLogs]);

  const sendCommand = useCallback(async () => {
    if (!port || !isNormalMode || !inputValue.trim() || isSending) return;

    const command = inputValue.trim();
    const commandWithNewline = command.endsWith("\n") ? command : command + "\n";
    const commandBytes = new TextEncoder().encode(commandWithNewline);

    // Add outgoing line
    setLines((prev) => [
      ...prev.slice(-1000),
      {
        id: lineIdRef.current++,
        timestamp: Date.now(),
        type: "outgoing",
        data: command,
      },
    ]);

    // Add command to history (avoid duplicates if it's the same as the last command)
    setCommandHistory((prev) => {
      const newHistory = prev.length > 0 && prev[prev.length - 1] === command
        ? prev
        : [...prev, command];
      // Limit history to last 100 commands
      return newHistory.slice(-100);
    });

    setIsSending(true);
    setInputValue("");
    setHistoryIndex(-1); // Reset history index after sending

    try {
      // Get writer
      const writer = port.writable?.getWriter();
      if (writer) {
        await writer.write(commandBytes);
        console.log(`[SERIAL TERMINAL] TX: Successfully wrote ${commandBytes.length} bytes`);
        writer.releaseLock();
      } else {
        throw new Error("Port not writable");
      }
    } catch (error) {
      console.error(`[SERIAL TERMINAL] TX Error:`, error);
      // Add error line
      setLines((prev) => [
        ...prev.slice(-1000),
        {
          id: lineIdRef.current++,
          timestamp: Date.now(),
          type: "incoming",
          data: `[Error sending: ${error instanceof Error ? error.message : String(error)}]`,
        },
      ]);
    } finally {
      setIsSending(false);
      // Refocus the input box after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [port, isNormalMode, inputValue, isSending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        setHistoryIndex((prevIndex) => {
          const newIndex = prevIndex < 0 ? commandHistory.length - 1 : Math.max(0, prevIndex - 1);
          setInputValue(commandHistory[newIndex]);
          return newIndex;
        });
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex >= 0) {
        setHistoryIndex((prevIndex) => {
          const newIndex = prevIndex + 1;
          if (newIndex >= commandHistory.length) {
            // Reached the end, clear input
            setInputValue("");
            return -1;
          }
          setInputValue(commandHistory[newIndex]);
          return newIndex;
        });
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCommand();
    } else {
      // If user starts typing, reset history index
      if (historyIndex !== -1) {
        setHistoryIndex(-1);
      }
    }
  };

  const clearTerminal = () => {
    setLines([]);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={clearTerminal}
          disabled={lines.length === 0}
          className="ml-auto"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isCn ? "清空" : "Clear"}
        </Button>
      </div>
        {/* Terminal Output */}
        <div
          ref={scrollContainerRef}
          className="w-full h-[500px] bg-card/50 border border-border rounded-md p-4 font-mono text-sm overflow-y-auto overflow-x-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {status !== "connected" ? (
            <div className="text-muted-foreground">
              {isCn ? (
                <>设备未连接，请查看<Link href={`/${lang}/setup`} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline">设置页面</Link>。</>
              ) : (
                <>Device not connected, please see the <Link href={`/${lang}/setup`} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline">setup page</Link>.</>
              )}
            </div>
          ) : mode === "flash" && lines.length === 0 ? (
            <div className="text-muted-foreground">
              {isCn 
                ? "刷写模式下，刷写日志将显示在这里。串口命令输入已禁用。" 
                : "In flash mode, flash logs will appear here. Serial command input is disabled."}
            </div>
          ) : lines.length === 0 ? (
            <div className="text-muted-foreground">
              {isCn ? "等待数据..." : "Waiting for data..."}
            </div>
          ) : (
            <div className="space-y-0.5">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className={`flex items-start gap-2 ${
                    line.type === "outgoing"
                      ? "text-blue-400"
                      : "text-green-400"
                  }`}
                >
                  <span className="text-muted-foreground text-xs shrink-0">
                    [{formatTimestamp(line.timestamp)}]
                  </span>
                  <span className={line.type === "outgoing" ? "text-blue-400" : "text-green-400"}>
                    {line.type === "outgoing" ? ">" : "<"}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-words">
                    {line.data || "[Empty]"}
                  </span>
                  {line.rawBytes && (
                    <span className="text-xs text-muted-foreground/60 shrink-0">
                      ({line.rawBytes.substring(0, 40)}
                      {line.rawBytes.length > 40 ? "..." : ""})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Reset history index when user manually types
              if (historyIndex !== -1) {
                setHistoryIndex(-1);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={isCn ? "输入命令并按 Enter 发送..." : "Enter command and press Enter to send..."}
            disabled={!isNormalMode || isSending}
            className="font-mono"
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              sendCommand();
            }}
            disabled={!isNormalMode || !inputValue.trim() || isSending}
            size="default"
            type="button"
            onMouseDown={(e) => {
              // Prevent button from taking focus when clicked
              e.preventDefault();
            }}
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isCn ? "发送中..." : "Sending..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                {isCn ? "发送" : "Send"}
              </span>
            )}
          </Button>
        </div>
    </div>
  );
}

