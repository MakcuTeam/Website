import type { Transport } from "@/esp_tool_fix/lib/index.js";
import type { ESPLoader } from "@/esp_tool_fix/lib/index.js";

/**
 * Connection mode types
 */
export type ConnectionMode = "normal" | "flash" | null;
export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "fault";

/**
 * MCU Status - Lightweight polling response (17 bytes from UART0_CMD_STATUS)
 * Used for: connection verification, live uptime, device attach detection
 */
export interface MakcuStatus {
  mcuAlive: boolean;       // MCU responded (always true if we got response)
  deviceAttached: boolean; // USB device connected to MCU's USB host port
  uptime: number;          // MCU uptime in seconds
  sofCount: number;        // USB SOF frame count (for sync/debug)
  freeRamKb: number;       // Free RAM in KB (health indicator)
  hasFault: boolean;       // Fault stored on device (parse error, etc.)
  temp: number;            // MCU temperature in Celsius (-1.0 if unavailable)
  lastPollTime: number;    // Timestamp of last successful poll (ms since epoch)
}

/**
 * Connection state
 */
export interface MakcuConnectionState {
  status: ConnectionStatus;
  mode: ConnectionMode;
  port: SerialPort | null;
  transport: Transport | null;
  loader: ESPLoader | null;
  comPort: string | null;
  detectedBaudRate: number | null;
}

/**
 * Serial data callback (legacy)
 */
export interface SerialDataCallback {
  (data: Uint8Array, isBinary: boolean): void;
}

/**
 * Subscriber types - declare what data they want
 */
export type BinaryFrameSubscriber = (data: Uint8Array) => void;  // Only receives 0x50 binary frames
export type TextLogSubscriber = (data: Uint8Array) => void;      // Only receives non-0x50 data (text logs)

/**
 * Device test types
 */
export type TestStatus = "pass" | "fail" | "not_supported" | "not_tested";

export interface MouseTestResults {
  button1: TestStatus;
  button2: TestStatus;
  button3: TestStatus;
  button4: TestStatus;
  button5: TestStatus;
  xAxis: TestStatus;
  yAxis: TestStatus;
  wheel: TestStatus;
  pan: TestStatus;
  tilt: TestStatus;
}

export interface KeyboardTestResults {
  keyPress: TestStatus;
  keyRelease: TestStatus;
  modifiers: TestStatus;
}

export interface DeviceTestResult {
  success: boolean;
  testMode: number;
  mousePresent: boolean;
  keyboardPresent: boolean;
  mouse?: MouseTestResults;
  keyboard?: KeyboardTestResults;
}

/**
 * Context type - extends state directly
 */
export interface MakcuConnectionContextType extends MakcuConnectionState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommandAndReadResponse: (command: string, timeoutMs?: number) => Promise<Uint8Array | null>;
  sendBinaryCommand: (cmd: number, payload?: Uint8Array, timeoutMs?: number, maxRetries?: number) => Promise<Uint8Array | null>;
  subscribeToSerialData: (callback: SerialDataCallback) => () => void;  // Legacy - receives all data
  subscribeToBinaryFrames: (callback: BinaryFrameSubscriber) => () => void;  // Only 0x50 frames
  subscribeToTextLogs: (callback: TextLogSubscriber) => () => void;  // Only non-0x50 data
  fetchFullDeviceInfo: () => Promise<boolean>;  // Manually trigger full device info fetch
  isConnecting: boolean;
  browserSupported: boolean;
  mcuStatus: MakcuStatus | null;  // Live status from 1-second polling
}

