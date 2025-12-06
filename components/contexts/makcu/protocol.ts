import { UART0_START_BYTE } from "./constants";

/**
 * CRC16-CCITT lookup table for faster calculation
 */
const CRC16_TABLE = (() => {
  const table = new Uint16Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    }
    table[i] = crc & 0xFFFF;
  }
  return table;
})();

/**
 * Calculate CRC16-CCITT checksum
 */
export function crc16_ccitt(data: Uint8Array): number {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = ((crc << 8) ^ CRC16_TABLE[((crc >> 8) ^ data[i]) & 0xFF]) & 0xFFFF;
  }
  return crc;
}

/**
 * Build a binary framed request
 * Frame format: [0x50] [CMD] [LEN_LO] [LEN_HI] [PAYLOAD...] [CRC_LO] [CRC_HI]
 */
export function buildBinaryFrame(cmd: number, payload: Uint8Array | null = null): Uint8Array {
  const payloadLen = payload ? payload.length : 0;
  const frameLen = 6 + payloadLen;  // START(1) + CMD(1) + LEN(2) + PAYLOAD + CRC(2)
  const frame = new Uint8Array(frameLen);
  
  frame[0] = UART0_START_BYTE;
  frame[1] = cmd;
  frame[2] = payloadLen & 0xFF;
  frame[3] = (payloadLen >> 8) & 0xFF;
  
  if (payload && payloadLen > 0) {
    frame.set(payload, 4);
  }
  
  // Calculate CRC over everything except CRC itself
  const crc = crc16_ccitt(frame.slice(0, 4 + payloadLen));
  frame[4 + payloadLen] = crc & 0xFF;
  frame[4 + payloadLen + 1] = (crc >> 8) & 0xFF;
  
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
  
  if (startIdx < 0 || data.length < startIdx + 6) {
    return null;  // No start byte or not enough data for minimal frame
  }
  
  const cmd = data[startIdx + 1];
  const payloadLen = data[startIdx + 2] | (data[startIdx + 3] << 8);
  const totalFrameLen = 6 + payloadLen;
  
  if (data.length < startIdx + totalFrameLen) {
    return null;  // Not enough data for complete frame
  }
  
  // Extract frame
  const frame = data.slice(startIdx, startIdx + totalFrameLen);
  
  // Verify CRC
  const receivedCrc = frame[4 + payloadLen] | (frame[4 + payloadLen + 1] << 8);
  const calculatedCrc = crc16_ccitt(frame.slice(0, 4 + payloadLen));
  
  if (receivedCrc !== calculatedCrc) {
    return null;  // CRC mismatch
  }
  
  // Extract payload
  const payload = frame.slice(4, 4 + payloadLen);
  
  return { cmd, payload };
}

