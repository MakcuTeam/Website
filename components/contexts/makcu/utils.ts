import { CONNECTION_TIMEOUTS, SERIAL_PORT_CONFIG, BAUD_RATES } from "./constants";

/**
 * Calculate timeout based on 8N1 symbol periods (like firmware UART hardware timeout)
 * 8N1 format: 10 bits per symbol (1 start + 8 data + 1 stop)
 * Uses symbol periods of silence to detect end of frame (same as ESP32 UART hardware)
 */
export function calculateTimeout(
  baudRate: number,
  maxFrameBytes: number = CONNECTION_TIMEOUTS.MAX_FRAME_BYTES,
  silenceSymbols: number = CONNECTION_TIMEOUTS.SILENCE_SYMBOLS,
  fastMode: boolean = false
): number {
  const bitsPerSymbol = 10; // 8N1: 1 start + 8 data + 1 stop
  
  // Frame transmission time
  const frameTimeMs = (maxFrameBytes * bitsPerSymbol * 1000) / baudRate;
  
  // Silence detection time (10 symbol periods = 100 bits = end of frame indicator)
  // This mimics ESP32 UART hardware timeout behavior
  // In fast mode, use fewer symbol periods for quicker failure detection
  const silenceSymbolsToUse = fastMode ? 5 : silenceSymbols;
  const silenceTimeMs = (silenceSymbolsToUse * bitsPerSymbol * 1000) / baudRate;
  
  // Total: frame time + silence detection + small overhead for Windows/WebSerial
  // In fast mode, reduce overhead for quicker detection
  const overheadMs = fastMode ? 10 : 20;
  const calculatedTimeout = Math.ceil(frameTimeMs + silenceTimeMs + overheadMs);
  
  // Minimum 50ms (for very fast baud rates), maximum 3000ms (safety limit)
  // In fast mode, cap at 500ms for quick failure
  const maxTimeout = fastMode ? 500 : 3000;
  return Math.max(50, Math.min(maxTimeout, calculatedTimeout));
}

/**
 * Calculate optimal retry count based on baud rate
 * Faster baud rates need fewer retries (less likely to have errors)
 */
export function calculateMaxRetries(baudRate: number): number {
  if (baudRate >= 2000000) return 3; // 4M baud: 3 retries
  if (baudRate >= 1000000) return 4; // 1M+ baud: 4 retries
  return 5; // 115200 baud: 5 retries (more prone to errors)
}

/**
 * Calculate retry delay based on 8N1 symbol periods
 * Uses symbol periods to ensure clean separation between retries
 * 5-10 symbol periods = enough time for line to clear
 */
export function calculateRetryDelay(baudRate: number, symbolPeriods: number = 5): number {
  const bitsPerSymbol = 10; // 8N1
  const delayMs = (symbolPeriods * bitsPerSymbol * 1000) / baudRate;
  // Minimum 10ms, maximum 200ms (safety limits)
  return Math.max(10, Math.min(200, Math.ceil(delayMs)));
}

/**
 * Open serial port with specified baud rate and standard configuration
 */
export async function openPortWithBaudRate(
  port: SerialPort,
  baudRate: number
): Promise<void> {
  await port.open({
    baudRate,
    ...SERIAL_PORT_CONFIG,
  });
}

/**
 * Safely close serial port, releasing all locks first
 */
export async function safeClosePort(port: SerialPort): Promise<void> {
  try {
    // Release reader lock if exists
    if (port.readable && port.readable.locked) {
      try {
        const reader = port.readable.getReader();
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      } catch (e) {
        // Ignore lock release errors
      }
    }
    
    // Release writer lock if exists
    if (port.writable && port.writable.locked) {
      try {
        const writer = port.writable.getWriter();
        writer.releaseLock();
      } catch (e) {
        // Ignore lock release errors
      }
    }
    
    // Now close the port
    if (port.readable || port.writable) {
      await port.close();
      // Small delay to let OS release the port
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (e) {
    // Ignore close errors - port might already be closed
  }
}

/**
 * Get COM port name (if available)
 * Note: WebSerial API doesn't expose COM port numbers for security/privacy reasons
 */
export function getComPort(_port: SerialPort): string | null {
  // WebSerial API specification doesn't provide COM port information
  // The port selection dialog shows the device name, but not the COM port number
  // This is by design for security and privacy reasons
  return null;
}

/**
 * Cookie utilities
 */
export function setCookie(name: string, value: string, hours: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

