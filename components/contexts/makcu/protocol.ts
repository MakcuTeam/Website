import { UART0_START_BYTE } from "./constants";

/**
 * Build a binary framed request
 * Frame format: [0x50] [CMD] [LEN_LO] [LEN_HI] [PAYLOAD...]
 */
export function buildBinaryFrame(cmd: number, payload: Uint8Array | null = null): Uint8Array {
  const payloadLen = payload ? payload.length : 0;
  const frameLen = 4 + payloadLen;  // START(1) + CMD(1) + LEN(2) + PAYLOAD
  const frame = new Uint8Array(frameLen);
  
  frame[0] = UART0_START_BYTE;
  frame[1] = cmd;
  frame[2] = payloadLen & 0xFF;
  frame[3] = (payloadLen >> 8) & 0xFF;
  
  if (payload && payloadLen > 0) {
    frame.set(payload, 4);
  }
  
  return frame;
}

/**
 * Parse a binary framed response - returns payload or null if invalid
 */
export function parseBinaryFrame(data: Uint8Array): { cmd: number; payload: Uint8Array } | null {
  // Find start byte (UART0 uses 0x50)
  let startIdx = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i] === UART0_START_BYTE) {
      startIdx = i;
      break;
    }
  }
  
  if (startIdx < 0 || data.length < startIdx + 4) {
    return null;  // No start byte or not enough data for minimal frame
  }
  
  const cmd = data[startIdx + 1];
  const payloadLen = data[startIdx + 2] | (data[startIdx + 3] << 8);
  const totalFrameLen = 4 + payloadLen;
  
  if (data.length < startIdx + totalFrameLen) {
    return null;  // Not enough data for complete frame
  }
  
  // Extract frame
  const frame = data.slice(startIdx, startIdx + totalFrameLen);

  // Extract payload
  const payload = frame.slice(4, 4 + payloadLen);
  
  return { cmd, payload };
}

