# MAKCU Troubleshooting

## Prerequisites

Before troubleshooting, ensure you have:

1. **CH343 Driver Installed**: MAKCU requires the CH343 USB-to-serial driver to be loaded on your computer. Please see the flash page for the download link and installation instructions.

2. **Correct COM Port**: The COM port for USB 2 should be below 10. If your COM port number is 10 or higher, you may experience connection issues.

3. **Both Sides Flashed**: Make sure you have correctly set up and flashed MAKCU on both the left side (device) and right side (host).

4. **Supported Device**: Ensure you have a supported mouse or keyboard connected. MAKCU supports both keyboard and mouse devices.

## LED Status Guide

MAKCU uses LEDs on both sides to indicate system status and help you troubleshoot issues. The LEDs can be solid (on or off) or blinking at different speeds.

### Left Side (Device Side)

The left side LED shows the status of the USB device connection to your computer.

#### Solid ON (Green)
- **Meaning**: USB device is connected and working correctly
- **What it means**: Your mouse or keyboard is properly enumerated and ready to use
- **Action**: No action needed - everything is working

#### Solid OFF
- **Meaning**: No USB device connected
- **What it means**: The device is not currently connected to your computer
- **Action**: Check USB cable connection and ensure device is powered on

#### Slow Blink (500ms on, 500ms off)
- **Meaning**: Warning - system is adjusting settings
- **When it occurs**: 
  - Baud rate is being changed
  - System is reconfiguring
- **Action**: Wait a few seconds - this should resolve automatically. If it persists, try restarting MAKCU.

#### Fast Blink (100ms on, 100ms off)
- **Meaning**: Error - connection problem detected
- **When it occurs**:
  - USB host (right side) has stopped responding
  - Bridge connection between left and right sides is broken
  - Host crash or timeout detected
- **Action**: 
  1. Check the connection between left and right sides
  2. Check the right side LED status (see below)
  3. Try unplugging and reconnecting both USB cables
  4. If problem persists, reflash both sides

### Right Side (Host Side)

The right side LED shows the status of the USB host connection to your mouse/keyboard.

#### Solid ON (Green)
- **Meaning**: USB host is connected and working correctly
- **What it means**: Your mouse or keyboard is detected and the host is ready
- **Action**: No action needed - everything is working

#### Solid OFF
- **Meaning**: No USB device connected to host
- **What it means**: No mouse or keyboard is connected to the right side
- **Action**: Connect a supported mouse or keyboard to the right side USB port

#### Slow Blink (500ms on, 500ms off)
- **Meaning**: Warning - temporary issue detected
- **When it occurs**:
  - USB request is busy (normal during operation)
  - System is handling a temporary condition
- **Action**: Usually resolves automatically. If it persists, check device connection.

#### Fast Blink (100ms on, 100ms off)
- **Meaning**: Error - serious problem detected
- **When it occurs**:
  - USB device (left side) has stopped responding
  - Bridge connection between left and right sides is broken
  - Timer or USB request failures
  - Device crash or timeout detected
- **Action**: 
  1. Check the connection between left and right sides
  2. Check the left side LED status (see above)
  3. Try unplugging and reconnecting both USB cables
  4. If problem persists, reflash both sides

## Troubleshooting Steps

### Both LEDs Fast Blinking

**Problem**: Both left and right sides show fast blink (error state)

**Possible Causes**:
- Bridge connection between sides is broken
- UART communication failure
- One side has crashed or reset

**What to Do**:
1. Power cycle both sides (unplug and replug USB cables)
2. Check physical connections between left and right sides
3. Verify both sides are powered correctly
4. Reflash both sides if problem persists

### Left Side Fast Blink, Right Side Normal

**Problem**: Left side shows error, right side is working

**Possible Causes**:
- Right side (host) has crashed or stopped responding
- Bridge heartbeat timeout on left side

**What to Do**:
1. Check right side LED - if it's also showing error, see "Both LEDs Fast Blinking"
2. Try restarting the right side
3. Reflash the right side if needed

### Right Side Fast Blink, Left Side Normal

**Problem**: Right side shows error, left side is working

**Possible Causes**:
- Left side (device) has crashed or stopped responding
- Bridge heartbeat timeout on right side

**What to Do**:
1. Check left side LED - if it's also showing error, see "Both LEDs Fast Blinking"
2. Try restarting the left side
3. Reflash the left side if needed

### Slow Blink Persists

**Problem**: LED keeps blinking slowly and doesn't resolve

**Possible Causes**:
- System stuck in configuration state
- Baud rate change didn't complete
- Warning condition not clearing

**What to Do**:
1. Wait 10 seconds - some operations take time
2. Power cycle the affected side
3. Check for any error messages in device manager
4. Reflash if problem continues

### LED Not Responding

**Problem**: LED doesn't turn on or change state at all

**Possible Causes**:
- LED hardware issue
- Firmware not running
- Power issue

**What to Do**:
1. Verify device is powered (check USB connection)
2. Check if device is recognized in device manager
3. Try reflashing the firmware
4. If still not working, there may be a hardware issue

### Device Not Working Despite Green LED

**Problem**: LED shows solid ON (green) but mouse/keyboard doesn't work

**Possible Causes**:
- Device driver issue on computer
- USB port problem
- Device compatibility issue

**What to Do**:
1. Check device manager for any error icons
2. Try a different USB port
3. Verify CH343 driver is installed correctly
4. Check if COM port number is below 10
5. Try a different mouse or keyboard to test

## Quick Reference

| LED State | Left Side Meaning | Right Side Meaning | Action |
|-----------|------------------|-------------------|--------|
| Solid ON | Device connected | Host connected | Working - no action needed |
| Solid OFF | No device | No device | Connect device |
| Slow Blink | Warning/Adjusting | Warning/Temporary | Wait, usually resolves |
| Fast Blink | Error - Host issue | Error - Device issue | Check connections, restart, reflash |

## Still Having Issues?

If you've tried all troubleshooting steps and the problem persists:

1. **Verify Setup**: Ensure both sides are correctly flashed and configured
2. **Check Connections**: Verify all USB cables and connections are secure
3. **Driver Check**: Confirm CH343 driver is installed and COM port is below 10
4. **Supported Device**: Ensure you're using a supported mouse or keyboard
5. **Reflash**: Try reflashing both sides with the latest firmware
6. **Hardware Check**: If LEDs don't respond at all, there may be a hardware issue

Remember: MAKCU supports both keyboard and mouse devices. If one type works but the other doesn't, check device compatibility.
