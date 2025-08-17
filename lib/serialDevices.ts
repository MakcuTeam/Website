export interface AllowedDevice {
  vendorId: number;
  productId: number;
}

// Ordered list of approved USB vendor/product ID pairs.
// Extend this list to support additional devices in the future.
export const ALLOWED_DEVICES: AllowedDevice[] = [
  { vendorId: 0x0403, productId: 0x6001 },
  { vendorId: 0x1a86, productId: 0x55d3 },
  { vendorId: 0x303a, productId: 0x0009 },
  { vendorId: 0x303a, productId: 0x1001 },
];

export const isAllowedDevice = (info: SerialPortInfo): boolean =>
  ALLOWED_DEVICES.some(
    (d) =>
      info.usbVendorId === d.vendorId && info.usbProductId === d.productId,
  );
