# Makcu Command Reference

Welcome to the Makcu help. All commands shown are listed below. For more info, send the command formatted as shown: `km.command(help)`

## Command Categories

### All Commands (Grouped by Category, Alphabetically)

#### General Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `km.baud(help)` | Set UART0 baud rate | `(rate)` - 0=default (115200); empty to query |
| `km.device(help)` | Report keyboard vs mouse usage | `()` - returns (keyboard), (mouse), or (none) |
| `km.echo(help)` | Toggle UART echo | `(enable)` - empty to query |
| `km.fault(help)` | Get stored parse fault info | `()` - returns MAC, endpoint, reason, raw descriptor bytes |
| `km.help(help)` | Show this help | `()` |
| `km.hs(help)` | USB high-speed compatibility | `()` query, `(1/0)` enable/disable *persistent |
| `km.info(help)` | Report system info | `()` - MAC, temp, ram, fw, cpu, uptime |
| `km.log(help)` | Set log level | `(level)` - 0-5, empty to query |
| `km.reboot(help)` | Reboot device | `()` - reboots after response |
| `km.release(help)` | Auto-release monitoring system | `()` get status (0=disabled, else time ms); `(timer_ms)` set timer 500-300000ms (5 min), (0) disables; monitors independent lock/button/key values and releases only active ones when expired; setting is persistently saved and enabled on startup/boot |
| `km.screen(help)` | Query or set virtual screen size | `()` to query, `(width,height)` to set |
| `km.serial(help)` | Manage serial number | `()` query, `(0)` reset, `(text)` set sanitized value; used to change serial number of attached mouse/keyboard while connected to MAKCU; change is persistent and remains after firmware updates; MAKCU does not allow changing serial numbers for devices that do not contain one |
| `km.version(help)` | Report firmware version | `()` |

#### Keyboard Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `km.down(help)` | Press key down | `(key)` - HID code or quoted key name |
| `km.init(help)` | Clear keyboard state | `()` |
| `km.isdown(help)` | Query key down state | `(key)` - key: numeric HID code or quoted string ('a', "shift") |
| `km.keys(help)` | Stream keyboard keys | `(mode,period_ms)` - mode 1=raw 2=constructed frame; period 1-1000ms; () to query; use (0) or (0,0) to reset |
| `km.mask(help)` | Mask key | `(key,mode)` - key: numeric HID code or quoted string; mode: 0=off, 1=on |
| `km.press(help)` | Tap key | `(key,hold_ms,rand_ms)` - HID code or key name; hold defaults to random 35-75ms (logged); rand optional |
| `km.remap(help)` | Remap keycode | `(source,target)` - both can be numeric or quoted strings; target=0 clears remap (passthrough) |
| `km.string(help)` | Type ASCII string | `(text)` |
| `km.up(help)` | Release key | `(key)` - HID code or quoted key name |

#### Mouse Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `km.axis(help)` | Stream X/Y/Wheel axis deltas | `(mode,period_ms)` - 1=raw, 2=constructed frame; period 1-1000ms; use (0) or (0,0) to reset; output format: raw(x,y,w) or mut(x,y,w) |
| `km.buttons(help)` | Stream button states | `(mode,period_ms)` - 1=raw, 2=constructed frame; period 1-1000ms; use (0) or (0,0) to reset |
| `km.catch_ml(help)` / `km.catch_mm(help)` / etc. | Catch locked button state | `(mode)` - 0=auto 1=manual; requires corresponding button lock; `()` to query state; targets: ml/mm/mr/ms1/ms2 (buttons only, not axes) |
| `km.click(help)` | Schedule mouse clicks | `(button,count,delay_ms)` - count/delay optional; delay random 35-75ms if omitted (internal timing) |
| `km.getpos(help)` | Report current pointer position | `()` |
| `km.left(help)` | Set left button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.lock_mx(help)` / `km.lock_my(help)` / `km.lock_mw(help)` / etc. | Lock button or axis | `(state)` - state: 1=lock, 0=unlock; `()` returns 1=locked, 0=unlocked; targets: mx/my/mw (axes), mx+/mx-/my+/my-/mw+/mw- (directional axes), ml/mm/mr/ms1/ms2 (buttons) |
| `km.middle(help)` | Set middle button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.mo(help)` | Queue raw mouse frame (set only) | `(buttons,x,y,wheel,pan,tilt)` - (0) clears all; x,y,wheel,pan,tilt are one-shots; button mask mirrors button states |
| `km.mouse(help)` | Stream full mouse data | `(mode,period_ms)` - mode 1=raw 2=constructed frame; period 1-1000ms; () to query; use (0) or (0,0) to reset |
| `km.move(help)` | Queue relative move | `(dx,dy,segments,cx1,cy1,cx2,cy2)` - segments/control points optional |
| `km.moveto(help)` | Move pointer absolute | `(x,y,segments,cx1,cy1,cx2,cy2)` - internally calculates needed x,y movement to reach requested screen position; parameters align with km.move |
| `km.pan(help)` | Horizontal scroll/pan | `(steps)` - () to query pending |
| `km.right(help)` | Set right button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.side1(help)` | Set side1 button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.side2(help)` | Set side2 button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.silent(help)` | Move then silent left click | `(x,y)` |
| `km.tilt(help)` | Tilt/z-axis scroll | `(steps)` - () to query pending |
| `km.turbo(help)` | Rapid-fire mode for mouse buttons | `(button,delay_ms)` - button: 1-5 (mouse buttons) or 0 to disable all - delay_ms: 1-5000ms (0=disable) - () returns only active settings as (m1=200, m2=400) - (button) uses random 35-75ms - (0) disables all turbo - **multiple buttons can be enabled simultaneously** - when enabled, holding button triggers rapid press/release cycle |
| `km.wheel(help)` | Scroll wheel | `(delta)` - scroll step (Windows limits to ±1 step, so delta is clamped to -1 or +1) |

---

## Functions That Work Without USB Device Attached

The following commands work without a USB device attached to USB 3:

- `km.baud(help)`
- `km.echo(help)`
- `km.fault(help)`
- `km.help(help)`
- `km.info(help)`
- `km.log(help)`
- `km.reboot(help)`
- `km.screen(help)`
- `km.serial(help)`
- `km.version(help)`

---

## Command Details by Category

### General Commands

- **km.baud(rate)** - Set UART0 baud rate (0=default 115200). Empty to query current rate.
- **km.device()** - Report whether keyboard or mouse has been used more (or none).
- **km.echo(enable)** - Toggle UART echo. Empty to query state.
- **km.fault()** - Returns stored parse fault information including ESP32 MAC address, failed endpoint address, interface number, failure reason, and raw HID descriptor bytes. Useful for debugging devices that fail to parse.
- **km.help()** - Show command list grouped by category (General, Keyboard, Mouse).
- **km.hs()** or **km.hs(1/0)** - Query/set USB high-speed compatibility for devices that may not report poll rate correctly (setting persistent).
- **km.info()** - Report MAC address, MCU temperature (when available), RAM stats, firmware info, CPU, and uptime.
- **km.log(level)** - Set log level 0-5. Empty to query current level.
- **km.reboot()** - Reboot the device after acknowledging the request.
- **km.release()** or **km.release(timer_ms)** - Auto-release monitoring system. Continuously monitors independent lock, button, and key states. When the timer expires, it releases only the corresponding values that remain active (not all at once). This setting is persistently saved to storage and automatically enabled on startup/boot. `()` get status (0=disabled, else time ms); `(timer_ms)` set timer 500-300000ms (5 min), (0) disables.
- **km.screen(width,height)** - Query or update the virtual screen dimensions. `()` to query, `(width,height)` to set.
- **km.serial(text)** - Query, reset, or set the serial number of an attached mouse or keyboard while connected to MAKCU. `()` query, `(0)` reset, `(text)` set sanitized value. This change is persistent and remains even after future firmware changes. Note: MAKCU does not allow changing serial numbers for a device that does not contain one.
- **km.version()** - Report firmware version.

### Keyboard Commands

- **km.down(key)** - Press a key down.
- **km.init()** - Clear keyboard state and release pressed keys.
- **km.isdown(key)** - Query whether a key is currently held.
- **km.keys(mode,period_ms)** - Stream keyboard keys with human-readable names. Mode 1=raw (physical input), 2=constructed frame (after remapping/masking); period clamped 1-1000 ms. Use `(0)` or `(0,0)` to reset. Output format: `keys(raw,shift,'h')` or `keys(constructed,ctrl,shift,'a')` - modifiers and keys shown as names (e.g., 'shift', 'ctrl', 'h', 'a') instead of HID numbers.
- **km.mask(key,mode)** - Mask or unmask a key (mode 0=off, 1=on).
- **km.press(key,hold_ms,rand_ms)** - Tap a key with optional hold duration and randomization window. Hold defaults to a logged random 35-75 ms.
- **km.remap(source,target)** - Remap a key. Accepts HID codes or names; `target=0` clears the remap (passthrough).
- **km.string(text)** - Type an ASCII string using queued key presses.
- **km.up(key)** - Release a key.

**Key Parameter Format:**
Keyboard commands support two formats for the `key` parameter:
1. **Numeric HID code**: `km.press(4)` - Uses HID usage code directly
2. **String key name**: `km.press('a')` or `km.press("a")` - Uses quoted key name (single or double quotes)

**Supported key names** (case-insensitive):
- **Letters**: 'a' to 'z'
- **Numbers**: '1' to '9', '0'
- **Special keys**: 'enter', 'escape'/'esc', 'backspace'/'back', 'tab', 'space'/'spacebar'
- **Symbols**: 'minus', 'equals', 'leftbracket', 'rightbracket', 'backslash', 'semicolon', 'quote', 'grave', 'comma', 'period', 'slash', 'capslock'
- **Function keys**: 'f1' to 'f12'
- **Navigation**: 'insert', 'delete', 'home', 'end', 'pageup', 'pagedown', 'up', 'down', 'left', 'right'
- **Modifiers**: 'ctrl'/'leftctrl', 'shift'/'leftshift', 'alt'/'leftalt', 'gui'/'win'/'windows', plus right variants
- **Numpad**: 'kp0' to 'kp9', 'kpenter', 'kpplus', 'kpminus', 'kpmultiply', 'kpdivide', etc.

**Examples:**
```
km.press('a')          # Press 'a' with random 35-75ms hold (logged)
km.press("enter")      # Press Enter with random 35-75ms hold (logged)
km.press('d', 50)      # Press 'd' with exactly 50ms hold (no random)
km.down('shift')       # Hold Shift
km.up("shift")         # Release Shift
km.press('f1')         # Press F1 with random 35-75ms hold (logged)
km.remap('a', 'b')     # Remap 'a' to type 'b'
km.remap('a', 0)       # Clear remap for 'a' (passthrough)
km.isdown("ctrl")      # Check if Ctrl is pressed
km.keys(1, 100)        # Stream RAW keyboard keys every 100ms (shows physical input)
km.keys(2, 50)         # Stream constructed frame keyboard keys every 50ms (shows after remapping/masking)
km.keys(0)             # Disable keyboard key streaming
```

### Mouse Commands

#### Mouse Button Commands
- **km.left(state)** - Set left button state: `0`=release (sends frame), `1`=down, `2`=silent_release (sets to 0 but doesn't send frame). `km.left()` reports 0=none, 1=raw, 2=injected, 3=both.
- **km.right(state)** - Set right button (0=release, 1=down, 2=silent_release). `km.right()` reports 0-3 as above.
- **km.middle(state)** - Set middle button (0=release, 1=down, 2=silent_release). `km.middle()` reports 0-3 as above.
- **km.side1(state)** - Set side1 button (0=release, 1=down, 2=silent_release). `km.side1()` reports 0-3 as above.
- **km.side2(state)** - Set side2 button (0=release, 1=down, 2=silent_release). `km.side2()` reports 0-3 as above.
- **km.click(button,count,delay_ms)** - Queue multiple clicks. Count/delay optional; delay defaults to a random 35-75 ms range (internal timing).
- **km.turbo(button,delay_ms)** - Enable rapid-fire mode for mouse buttons. When the button is held down, it automatically triggers rapid press/release cycles at the specified interval. **Multiple buttons can have turbo enabled simultaneously**, each with its own delay setting.
  - `button`: 
    - Mouse buttons: `1`-`5` (1=left, 2=right, 3=middle, 4=side1, 5=side2)
    - `0` to disable all turbo
  - `delay_ms`: 1-5000ms (0=disable). The delay is the time between each press/release toggle (e.g., 500ms = press for 500ms, release for 500ms, repeat)
  - `km.turbo()` - Returns only active turbo settings as `(m1=200, m2=400)` (only shows what's set, not zeros)
  - `km.turbo(button)` - Sets turbo with random 35-75ms delay
  - `km.turbo(button, 0)` - Disables turbo for that specific button
  - `km.turbo(0)` - **Disables all turbo**
  - Examples: 
    - `km.turbo(1, 500)` enables 500ms rapid-fire for left mouse button
    - `km.turbo(2, 250)` enables 250ms for right mouse button
    - `km.turbo(1)` enables rapid-fire with random 35-75ms delay for left mouse button
    - All can work simultaneously

#### Mouse Movement Commands
- **km.move(dx,dy,segments,cx1,cy1,cx2,cy2)** - Queue relative movement. Provide `segments` and optional control points to generate segmented or Bézier paths.
- **km.moveto(x,y,segments,cx1,cy1,cx2,cy2)** - Move pointer to absolute position. Internally calculates the needed x,y movement to reach the requested position on the screen. Parameters align with `km.move`.
- **km.wheel(delta)** - Scroll the wheel. Note: Windows does not allow multiple scroll steps in a single command. The delta is clamped to ±1 step (positive for scroll up, negative for scroll down). Values greater than 1 are treated as 1, values less than -1 are treated as -1.
- **km.pan(steps)** - Horizontal scroll/pan. `km.pan()` queries pending horizontal scroll.
- **km.tilt(steps)** - Z-axis tilt. `km.tilt()` queries pending tilt.
- **km.getpos()** - Report current pointer position.
- **km.silent(x,y)** - Move then perform a silent left click.

#### Mouse Advanced Commands
- **km.mo(buttons,x,y,wheel,pan,tilt)** - Queue a raw mouse frame. `(0)` clears all stored values. x, y, wheel, pan, tilt are one-shots (single-use). Button mask mirrors button states.
- **km.lock_<target>(state)** - Lock button or axis. The target is part of the command name, not a parameter.
  - **Format**: `km.lock_<target>(state)` where target is appended to `lock_`
  - **State**: `1`=lock, `0`=unlock
  - **Query**: Call with `()` (e.g., `km.lock_mx()`) returns: `1`=locked, `0`=unlocked
  - **Button lock targets**: 
    - `ml` - Left mouse button
    - `mm` - Middle mouse button  
    - `mr` - Right mouse button
    - `ms1` - Side button 1
    - `ms2` - Side button 2
  - **Axis lock targets**: 
    - `mx` / `my` / `mw` - Full lock (blocks all movement in that axis)
    - `mx+` / `my+` / `mw+` - Positive direction lock (blocks positive movement only)
    - `mx-` / `my-` / `mw-` - Negative direction lock (blocks negative movement only)
  - **Examples**: 
    - `km.lock_mx(1)` - Lock all X-axis movement
    - `km.lock_mx+(1)` - Lock only positive X movement (right)
    - `km.lock_mx-(1)` - Lock only negative X movement (left)
    - `km.lock_my(1)` - Lock all Y-axis movement
    - `km.lock_mw(1)` - Lock all wheel movement
    - `km.lock_mw+(1)` - Lock only positive wheel movement (scroll up)
    - `km.lock_mw-(1)` - Lock only negative wheel movement (scroll down)
    - `km.lock_ml(1)` - Lock left mouse button
    - `km.lock_mx()` - Query X-axis lock state (returns 1=locked, 0=unlocked)
- **km.catch_<target>(mode)** - Enable catch on a locked button. The target is part of the command name, not a parameter. **Note: Catch only works for buttons, not axes.**
  - **Format**: `km.catch_<target>(mode)` where target is appended to `catch_`
  - **Mode**: `0`=auto (report on changes), `1`=manual (query only)
  - **Query**: Call with `()` (e.g., `km.catch_ml()`) returns: `1`=button down (if catch enabled), `0`=button up or catch not enabled
  - **Requires**: Corresponding `km.lock_<target>` must be set first (button must be locked)
  - **Targets**: `ml`, `mm`, `mr`, `ms1`, `ms2` (buttons only, not axes)
  - **Examples**:
    - `km.catch_ml(1)` - Enable manual catch for left mouse button
    - `km.catch_ml(0)` - Enable auto catch for left mouse button (reports on changes)
    - `km.catch_ml()` - Query catch state for left mouse button (returns 1=down, 0=up or not enabled)

#### Mouse Streaming Commands
- **km.buttons(mode,period_ms)** - Stream button states. Mode 1=raw, 2=constructed frame; period clamped 1-1000 ms. Use `(0)` or `(0,0)` to reset.
- **km.axis(mode,period_ms)** - Stream axis deltas (X, Y, Wheel). Mode 1=raw, 2=constructed frame; period clamped 1-1000 ms. Use `(0)` or `(0,0)` to reset. Output format: `raw(x,y,w)` or `mut(x,y,w)` where w is the wheel delta.
- **km.mouse(mode,period_ms)** - Stream full mouse data (buttons + axis + wheel/pan/tilt). Mode 1=raw, 2=constructed frame; period clamped 1-1000 ms. Use `(0)` or `(0,0)` to reset.

---

## Notes

- **Command Format**: Commands no longer require the `km.` prefix when sending. The new format starts with `.` and ends with `)`. Other values (such as `km`, `\r\n`, etc.) are ignored. Example: `.move(1,1,)`. Responses still use the `km.` prefix for compatibility: `km.<response>\r\n>>> .`
- **km.mo** is the command for sending raw mouse frames (set only, does not support get). Parameters: buttons, x, y, wheel, pan, tilt.
- All commands support the `(help)` parameter to get detailed usage information.
- Optional parameters are noted in the descriptions above.
- Only the commands listed in the "Functions That Work Without USB Device Attached" section operate without an attached USB 3 device.

---

## Command Implementation

All commands are implemented in: `main/components/Commands/commands.c`

Total commands: 40
