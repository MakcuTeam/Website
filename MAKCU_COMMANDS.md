# Makcu Command Reference

Welcome to the Makcu help. All commands shown are listed below. For more info, send the command formatted as shown: `km.command(help)`

## Command Categories

### All Commands (Grouped by Category, Alphabetically)

#### General Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `km.baud(help)` | Set UART0 baud rate | `(rate)` - 0=default (115200); empty to query |
| `km.bypass(help)` | Disable USB write, stream raw to COM2 | `(0/1/2)` - 0=off 1=mouse 2=keyboard |
| `km.device(help)` | Report keyboard vs mouse usage | `()` - returns (keyboard), (mouse), or (none) |
| `km.echo(help)` | Toggle UART echo | `(enable)` - empty to query |
| `km.fault(help)` | Get stored parse fault info | `()` - returns MAC, endpoint, reason, raw descriptor bytes |
| `km.help(help)` | Show this help | `()` |
| `km.hs(help)` | USB high-speed compatibility | `()` query, `(1/0)` enable/disable *persistent |
| `km.info(help)` | Report system info | `()` - MAC, temp, ram, fw, cpu, uptime |
| `km.led(help)` | Control LED/RGB state | `()` query device | `(1)` query device | `(2)` query host | `(0)` device off | `(1)` device on | `(target,mode)` control - target: 1=device 2=host, mode: 0=off 1=on | `(target,times,delay_ms)` flash |
| `km.log(help)` | Set log level | `(level)` - 0-5, empty to query |
| `km.reboot(help)` | Reboot device | `()` - reboots after response |
| `km.release(help)` | Auto-release monitoring system | `()` get status (0=disabled, else time ms); `(timer_ms)` set timer 500-300000ms (5 min), (0) disables; monitors independent lock/button/key values and releases only active ones when expired; setting is persistently saved and enabled on startup/boot |
| `km.screen(help)` | Query or set virtual screen size | `()` to query, `(width,height)` to set |
| `km.serial(help)` | Manage serial number | `()` query, `(0)` reset, `(text)` set sanitized value; used to change serial number of attached mouse/keyboard while connected to MAKCU; change is persistent and remains after firmware updates; MAKCU does not allow changing serial numbers for devices that do not contain one |
| `km.version(help)` | Report firmware version | `()` |

#### Keyboard Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `km.disable(help)` | Disable/enable keyboard keys | `()` list disabled keys | `(key1,key2,...)` disable multiple keys | `(key,mode)` enable/disable - key: HID code or 'name'; mode: 1=disable 0=enable |
| `km.down(help)` | Press key down | `(key)` - HID code or quoted key name |
| `km.init(help)` | Clear keyboard state | `()` |
| `km.isdown(help)` | Query key down state | `(key)` - key: numeric HID code or quoted string ('a', "shift") |
| `km.keyboard(help)` | Stream keyboard keys | `(mode,period)` - mode 1=raw 2=constructed frame; period 1-1000 frames; () to query; (0) to disable |
| `km.mask(help)` | Mask key | `(key,mode)` - key: numeric HID code or quoted string; mode: 0=off, 1=on |
| `km.press(help)` | Tap key | `(key,hold_ms,rand_ms)` - HID code (0-255) or quoted key name; hold defaults to random 35-75ms (logged); rand optional; auto-rounded to bInterval |
| `km.remap(help)` | Remap keycode | `(source,target)` - both can be numeric or quoted strings; target=0 clears remap (passthrough) |
| `km.string(help)` | Type ASCII string | `(text)` - max 256 chars, random 35-75ms per char |
| `km.up(help)` | Release key | `(key)` - HID code or quoted key name |

#### Mouse Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `km.axis(help)` | Stream X/Y/Wheel axis deltas | `(mode,period_ms)` - 1=raw, 2=constructed frame; period 1-1000ms; use (0) or (0,0) to reset; output format: raw(x,y,w) or mut(x,y,w) |
| `km.buttons(help)` | Stream button states | `(mode,period_ms)` - 1=raw, 2=constructed frame; period 1-1000ms; use (0) or (0,0) to reset |
| `km.catch_ml(help)` / `km.catch_mm(help)` / etc. | Catch locked button state | `(mode)` - 0=auto 1=manual; requires corresponding button lock; `()` to query state; targets: ml/mm/mr/ms1/ms2 (buttons only, not axes) |
| `km.click(help)` | Schedule mouse clicks | `(button,count,delay_ms)` - button 1-5; count default 1; delay random 35-75ms if omitted (internal timing) |
| `km.getpos(help)` | Report current pointer position | `()` |
| `km.invert_x(help)` | Invert X axis (physical only) | `()` show, `(0)` disable, `(1)` enable |
| `km.invert_y(help)` | Invert Y axis (physical only) | `()` show, `(0)` disable, `(1)` enable |
| `km.left(help)` | Set left button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.lock_mx(help)` / `km.lock_my(help)` / `km.lock_mw(help)` / etc. | Lock button or axis | `(state)` - state: 1=lock, 0=unlock; `()` returns 1=locked, 0=unlocked; targets: mx/my/mw (axes), mx+/mx-/my+/my-/mw+/mw- (directional axes), ml/mm/mr/ms1/ms2 (buttons) |
| `km.middle(help)` | Set middle button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.mo(help)` | Queue raw mouse frame (set only) | `(buttons,x,y,wheel,pan,tilt)` - (0) clears all; x,y,wheel,pan,tilt are one-shots; button mask mirrors button states |
| `km.mouse(help)` | Stream full mouse data | `(mode,period_ms)` - mode 1=raw 2=constructed frame; period 1-1000ms; () to query; use (0) or (0,0) to reset |
| `km.move(help)` | Queue relative move | `(dx,dy,segments,cx1,cy1,cx2,cy2)` - segments/control points optional |
| `km.moveto(help)` | Move pointer absolute | `(x,y,segments,cx1,cy1,cx2,cy2)` - internally calculates needed x,y movement to reach requested screen position; parameters align with km.move |
| `km.pan(help)` | Horizontal scroll/pan | `(steps)` - () to query pending |
| `km.remap_button(help)` | Remap mouse buttons (physical only) | `()` show mappings, `(0)` reset, `(src,dst)` map 1-5, `(src,0)` clear |
| `km.right(help)` | Set right button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.side1(help)` | Set side1 button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.side2(help)` | Set side2 button / query lock state | `(state)` - 0=release 1=down 2=silent_release; () returns 0=none 1=raw 2=injected 3=both |
| `km.silent(help)` | Move then silent left click | `(x,y)` |
| `km.swap_xy(help)` | Swap X and Y axes (physical only) | `()` show, `(0)` disable, `(1)` enable |
| `km.tilt(help)` | Tilt/z-axis scroll | `(steps)` - () to query pending |
| `km.turbo(help)` | Rapid-fire mode for mouse buttons | `(button,delay_ms)` - button: 1-5 (mouse buttons) or 0 to disable all - delay_ms: 1-5000ms (0=disable) - () returns only active settings as (m1=200, m2=400) - (button) uses random 35-75ms - (0) disables all turbo - **multiple buttons can be enabled simultaneously** - when enabled, holding button triggers rapid press/release cycle |
| `km.wheel(help)` | Scroll wheel | `(delta)` - scroll step (Windows limits to ±1 step, so delta is clamped to -1 or +1) |

---

## Functions That Work Without USB Device Attached

The following commands work without a USB device attached to USB 3:

- `km.baud(help)`
- `km.bypass(help)`
- `km.echo(help)`
- `km.fault(help)`
- `km.help(help)`
- `km.info(help)`
- `km.log(help)`
- `km.reboot(help)`
- `km.screen(help)`
- `km.serial(help)`
- `km.led(help)`
- `km.version(help)`

---

## Command Details by Category

### General Commands

- **km.baud(rate)** - Set UART0 baud rate (0=default 115200). Empty to query current rate.
- **km.bypass(0/1/2)** - Disable USB write and stream raw frames to COM2. `0`=off (restore USB write, disable telemetry), `1`=mouse bypass (enables `km.mouse(1,1)` and disables USB write), `2`=keyboard bypass (enables `km.keyboard(1,1)` and disables USB write). `km.bypass()` queries current state. Warns `(no mouse)` or `(no keyboard)` if device not detected. Works without USB device attached.
- **km.device()** - Report whether keyboard or mouse has been used more (or none).
- **km.echo(enable)** - Toggle UART echo. Empty to query state.
- **km.fault()** - Returns stored parse fault information including ESP32 MAC address, failed endpoint address, interface number, failure reason, and raw HID descriptor bytes. Useful for debugging devices that fail to parse.
- **km.help()** - Show command list grouped by category (General, Keyboard, Mouse).
- **km.hs()** or **km.hs(1/0)** - Query/set USB high-speed compatibility for devices that may not report poll rate correctly (setting persistent).
- **km.info()** - Report MAC address, MCU temperature (when available), RAM stats, firmware info, CPU, and uptime.
- **km.led()** or **km.led(target,mode)** or **km.led(target,times,delay_ms)** - Control LED and RGB state for both device and host sides.
  - **Query**: 
    - `km.led()` - Query device LED state (backward compatible)
    - `km.led(1)` - Query device LED state
    - `km.led(2)` - Query host LED state (via UART)
    - Returns: `(device,off)`, `(device,on)`, `(device,slow_blink)`, `(device,fast_blink)`, `(host,off)`, `(host,on)`, etc.
  - **Control**:
    - `km.led(0)` - Turn device LED off (backward compatible)
    - `km.led(1)` - Turn device LED on (backward compatible, but conflicts with query - use `km.led(1,1)` for explicit control)
    - `km.led(1, 0)` - Turn device LED off
    - `km.led(1, 1)` - Turn device LED on
    - `km.led(2, 0)` - Turn host LED off (via UART)
    - `km.led(2, 1)` - Turn host LED on (via UART)
  - **Flash**:
    - `km.led(1, times, delay_ms)` - Flash device LED (e.g., `km.led(1, 3, 200)` = 3 flashes at 200ms)
    - `km.led(2, times, delay_ms)` - Flash host LED (e.g., `km.led(2, 5, 100)` = 5 flashes at 100ms)
  - **Target**: `1` = device LED, `2` = host LED (USB host side, controlled via UART)
  - **Mode**: `0` = off, `1` = on
  - **Flash parameters**: `times` = number of flashes (default 1), `delay_ms` = delay between flashes in milliseconds (default 100ms, max 5000ms)
  - **Examples**:
    - `km.led()` - Query device LED: `(device,on)`
    - `km.led(2)` - Query host LED: `(host,off)`
    - `km.led(1, 0)` - Turn device LED off
    - `km.led(2, 1)` - Turn host LED on
    - `km.led(1, 3, 200)` - Flash device LED 3 times at 200ms intervals
    - `km.led(2, 5, 100)` - Flash host LED 5 times at 100ms intervals
- **km.log(level)** - Set log level 0-5. Empty to query current level.
- **km.reboot()** - Reboot the device after acknowledging the request.
- **km.release()** or **km.release(timer_ms)** - Auto-release monitoring system. Continuously monitors independent lock, button, and key states. When the timer expires, it releases only the corresponding values that remain active (not all at once). This setting is persistently saved to storage and automatically enabled on startup/boot. `()` get status (0=disabled, else time ms); `(timer_ms)` set timer 500-300000ms (5 min), (0) disables.
- **km.screen(width,height)** - Query or update the virtual screen dimensions. `()` to query, `(width,height)` to set.
- **km.serial(text)** - Query, reset, or set the serial number of an attached mouse or keyboard while connected to MAKCU. `()` query, `(0)` reset, `(text)` set sanitized value. This change is persistent and remains even after future firmware changes. Note: MAKCU does not allow changing serial numbers for a device that does not contain one.
- **km.version()** - Report firmware version.

### Keyboard Commands

- **km.disable()** or **km.disable(key1,key2,...)** or **km.disable(key,mode)** - Disable/enable keyboard keys to block them from being sent to the host.
  - `()` - List all currently disabled keys in format `(a,c,f,)` (shows key names when available, HID codes otherwise)
  - `(key1,key2,...)` - Disable multiple keys at once. Keys can be HID codes or quoted key names (e.g., `'a'`, `'f1'`, `'ctrl'`)
  - `(key,mode)` - Enable or disable a single key. `mode`: `1`=disable, `0`=enable
  - **Examples**:
    - `km.disable()` - List disabled keys: `(a,c,f,)`
    - `km.disable('a','c','f')` - Disable keys a, c, and f
    - `km.disable('f1','alt','win')` - Disable multiple special keys
    - `km.disable('a', 0)` - Enable key 'a' (re-enable)
    - `km.disable('a', 1)` - Disable key 'a'
    - `km.disable(4,6,9)` - Disable keys by HID codes
- **km.down(key)** - Press a key down.
- **km.init()** - Clear keyboard state and release pressed keys.
- **km.isdown(key)** - Query whether a key is currently held.
- **km.keyboard(mode,period)** - Stream keyboard keys with human-readable names. Mode 1=raw (physical input), 2=constructed frame (after remapping/masking); period 1-1000 frames. Use `(0)` to disable. Output format: `keyboard(raw,shift,'h')` or `keyboard(constructed,ctrl,shift,'a')` - modifiers and keys shown as names (e.g., 'shift', 'ctrl', 'h', 'a') instead of HID numbers.
- **km.mask(key,mode)** - Mask or unmask a key (mode 0=off, 1=on). **Note:** `km.disable()` is a convenience wrapper that can disable multiple keys at once.
- **km.press(key,hold_ms,rand_ms)** - Tap key with optional hold duration and randomization window. 
  - `key`: HID code (0-255) or quoted key name (see [Complete Keyboard Key Reference](#complete-keyboard-key-reference))
  - `hold_ms`: Optional hold duration in milliseconds. If omitted, uses random 35-75ms (value is logged)
  - `rand_ms`: Optional randomization range added to `hold_ms` (0 = no randomization)
  - **Note**: Duration is automatically rounded to the keyboard's `bInterval` for USB synchronization
  - **Examples**: 
    - `km.press('a')` - Press 'a' with random 35-75ms hold (logged)
    - `km.press('d', 50)` - Press 'd' with exactly 50ms hold
    - `km.press('d', 50, 10)` - Press 'd' with 50ms base + random 0-10ms
- **km.remap(source,target)** - Remap a key. Accepts HID codes or names; `target=0` clears the remap (passthrough).
- **km.string(text)** - Type an ASCII string using queued key presses with automatic timing.
  - `text`: String to type (max 256 characters)
  - Each character uses random 35-75ms hold time (internal timing, not logged)
  - Inter-character delay: 10ms between characters
  - Automatically handles Shift for uppercase letters and symbols
  - Uses timed queue system (no timer slot limits)
  - **Examples**: 
    - `km.string("Hello")` - Types "Hello" with proper timing
    - `km.string("Test123!")` - Types with numbers and symbols
- **km.up(key)** - Release a key.

**Key Parameter Format:**
Keyboard commands support two formats for the `key` parameter:
1. **Numeric HID code**: `km.press(4)` - Uses HID usage code directly (0-255)
2. **String key name**: `km.press('a')` or `km.press("a")` - Uses quoted key name (single or double quotes)
   - **Single character letters** (`'a'` to `'z'`, `'A'` to `'Z'`): **Case-sensitive** - `'a'` types lowercase, `'A'` types uppercase (with Shift)
   - **Multi-character special keys** (`'f1'`, `'alt'`, `'win'`, etc.): **Case-insensitive** - `'f1'`, `'F1'`, `'f1'` all work the same

---

## Complete Keyboard Key Reference

### Letters (HID codes 4-29)
All letters can be used as:
- **Lowercase**: `'a'` to `'z'` (HID codes 4-29) - **Case-sensitive**, types lowercase letter
- **Uppercase**: `'A'` to `'Z'` (same HID codes, automatically uses Shift) - **Case-sensitive**, types uppercase letter with Shift
- **Numeric HID**: `4` (a), `5` (b), `6` (c), ... `29` (z)
- **Note**: Single character letters are **case-sensitive** - `'a'` types lowercase, `'A'` types uppercase

### Numbers and Symbols (HID codes 30-39, 45-57)
| Key Name | HID Code | Shift Variant | Examples |
|----------|----------|---------------|----------|
| `'1'` | 30 | `'!'` (with Shift) | `km.press('1')` or `km.press(30)` |
| `'2'` | 31 | `'@'` (with Shift) | |
| `'3'` | 32 | `'#'` (with Shift) | |
| `'4'` | 33 | `'$'` (with Shift) | |
| `'5'` | 34 | `'%'` (with Shift) | |
| `'6'` | 35 | `'^'` (with Shift) | |
| `'7'` | 36 | `'&'` (with Shift) | |
| `'8'` | 37 | `'*'` (with Shift) | |
| `'9'` | 38 | `'('` (with Shift) | |
| `'0'` | 39 | `')'` (with Shift) | |
| `'minus'`, `'dash'`, `'hyphen'` | 45 | `'_'` (with Shift) | `km.press('minus')` or `km.press(45)` |
| `'equals'`, `'equal'` | 46 | `'+'` (with Shift) | |
| `'leftbracket'`, `'lbracket'`, `'openbracket'` | 47 | `'{'` (with Shift) | |
| `'rightbracket'`, `'rbracket'`, `'closebracket'` | 48 | `'}'` (with Shift) | |
| `'backslash'`, `'bslash'` | 49 | `'\|'` (with Shift) | |
| `'semicolon'`, `'semi'` | 51 | `':'` (with Shift) | |
| `'quote'`, `'apostrophe'`, `'singlequote'` | 52 | `'"'` (with Shift) | |
| `'grave'`, `'backtick'`, `'tilde'` | 53 | `'~'` (with Shift) | |
| `'comma'` | 54 | `'<'` (with Shift) | |
| `'period'`, `'dot'` | 55 | `'>'` (with Shift) | |
| `'slash'`, `'forwardslash'`, `'fslash'` | 56 | `'?'` (with Shift) | |
| `'capslock'`, `'caps'` | 57 | | |

### Control Keys (HID codes 40-44)
| Key Name | HID Code | Aliases | Examples |
|----------|----------|---------|----------|
| `'enter'`, `'return'` | 40 | | `km.press('enter')` or `km.press(40)` |
| `'escape'`, `'esc'` | 41 | | |
| `'backspace'`, `'back'` | 42 | | |
| `'tab'` | 43 | | |
| `'space'`, `'spacebar'` | 44 | | |

### Function Keys (HID codes 58-69)
**Note:** Function keys and all multi-character special keys are **case-insensitive** - `'f1'`, `'F1'`, `'f1'` all work the same.

| Key Name | HID Code | Examples |
|----------|----------|----------|
| `'f1'` | 58 | `km.press('f1')` or `km.press(58)` |
| `'f2'` | 59 | |
| `'f3'` | 60 | |
| `'f4'` | 61 | |
| `'f5'` | 62 | |
| `'f6'` | 63 | |
| `'f7'` | 64 | |
| `'f8'` | 65 | |
| `'f9'` | 66 | |
| `'f10'` | 67 | |
| `'f11'` | 68 | |
| `'f12'` | 69 | |

### System Keys (HID codes 70-83)
| Key Name | HID Code | Aliases | Examples |
|----------|----------|---------|----------|
| `'printscreen'`, `'prtsc'`, `'print'` | 70 | | `km.press('printscreen')` or `km.press(70)` |
| `'scrolllock'`, `'scroll'` | 71 | | |
| `'pause'`, `'break'` | 72 | | |
| `'insert'`, `'ins'` | 73 | | |
| `'home'` | 74 | | |
| `'pageup'`, `'pgup'` | 75 | | |
| `'delete'`, `'del'` | 76 | | |
| `'end'` | 77 | | |
| `'pagedown'`, `'pgdown'`, `'pgdn'` | 78 | | |
| `'right'`, `'rightarrow'` | 79 | | |
| `'left'`, `'leftarrow'` | 80 | | |
| `'down'`, `'downarrow'` | 81 | | |
| `'up'`, `'uparrow'` | 82 | | |
| `'numlock'`, `'num'` | 83 | | |

### Numpad Keys (HID codes 84-99)
| Key Name | HID Code | Aliases | Examples |
|----------|----------|---------|----------|
| `'kpdivide'`, `'npdivide'` | 84 | | `km.press('kpdivide')` or `km.press(84)` |
| `'kpmultiply'`, `'npmultiply'` | 85 | | |
| `'kpminus'`, `'npminus'` | 86 | | |
| `'kpplus'`, `'npplus'` | 87 | | |
| `'kpenter'`, `'npenter'` | 88 | | |
| `'kp1'`, `'np1'` | 89 | | |
| `'kp2'`, `'np2'` | 90 | | |
| `'kp3'`, `'np3'` | 91 | | |
| `'kp4'`, `'np4'` | 92 | | |
| `'kp5'`, `'np5'` | 93 | | |
| `'kp6'`, `'np6'` | 94 | | |
| `'kp7'`, `'np7'` | 95 | | |
| `'kp8'`, `'np8'` | 96 | | |
| `'kp9'`, `'np9'` | 97 | | |
| `'kp0'`, `'np0'` | 98 | | |
| `'kpperiod'`, `'kpdot'`, `'npperiod'`, `'npdot'` | 99 | | |

### Modifier Keys (HID codes 224-231)
**Note:** Modifier keys and all multi-character special keys are **case-insensitive** - `'alt'`, `'ALT'`, `'Alt'` all work the same.

| Key Name | HID Code | Aliases | Examples |
|----------|----------|---------|----------|
| `'leftctrl'`, `'lctrl'`, `'leftcontrol'`, `'lcontrol'`, `'ctrl'`, `'control'` | 224 | | `km.down('ctrl')` or `km.down(224)` |
| `'leftshift'`, `'lshift'`, `'shift'` | 225 | | |
| `'leftalt'`, `'lalt'`, `'alt'` | 226 | | |
| `'leftgui'`, `'lgui'`, `'leftwin'`, `'lwin'`, `'leftwindows'`, `'gui'`, `'win'`, `'windows'`, `'super'`, `'meta'`, `'cmd'`, `'command'` | 227 | | |
| `'rightctrl'`, `'rctrl'`, `'rightcontrol'`, `'rcontrol'` | 228 | | |
| `'rightshift'`, `'rshift'` | 229 | | |
| `'rightalt'`, `'ralt'` | 230 | | |
| `'rightgui'`, `'rgui'`, `'rightwin'`, `'rwin'`, `'rightwindows'` | 231 | | |

**Note:** When using generic names like `'ctrl'`, `'shift'`, `'alt'`, `'gui'`, they default to the **left** variant.

### Using HID Codes Directly
You can use any HID code from 0-255 directly:
- `km.press(4)` - Press 'a' (HID code 4)
- `km.press(40)` - Press Enter (HID code 40)
- `km.press(224)` - Press Left Ctrl (HID code 224)

**Examples:**
```
# Case-sensitive letters (single character)
km.press('a')                    # Press lowercase 'a' with random 35-75ms hold (logged)
km.press('A')                    # Press uppercase 'A' (with Shift) with random 35-75ms hold (logged)
km.press('d', 50)                # Press lowercase 'd' with exactly 50ms hold (no random)
km.press('D', 50, 10)            # Press uppercase 'D' (with Shift) with 50ms base + random 0-10ms

# Case-insensitive special keys (multi-character)
km.press("enter")                # Press Enter (case-insensitive)
km.press('f1')                   # Press F1 (case-insensitive - 'f1', 'F1', 'f1' all work)
km.press('F1')                   # Press F1 (case-insensitive)
km.down('shift')                 # Hold Shift (case-insensitive - 'shift', 'SHIFT', 'Shift' all work)
km.up("shift")                   # Release Shift (case-insensitive)
km.press('alt')                  # Press Alt (case-insensitive - 'alt', 'ALT', 'Alt' all work)
km.press('WIN')                  # Press Windows key (case-insensitive)

# HID codes
km.press(58)                     # Press F1 using HID code

# Disabling keys
km.disable()                     # List disabled keys: (a,c,f,)
km.disable('a','c','f')         # Disable multiple keys
km.disable('f1','alt','win')    # Disable special keys
km.disable('a', 0)               # Enable key 'a'
km.disable('a', 1)               # Disable key 'a'

# Remapping
km.remap('a', 'b')               # Remap 'a' to type 'b' (case-sensitive for letters)
km.remap('A', 'B')               # Remap 'A' to type 'B' (case-sensitive for letters)
km.remap('a', 0)                 # Clear remap for 'a' (passthrough)
km.isdown("ctrl")                # Check if Ctrl is pressed
km.string("Hello World!")         # Type string (max 256 chars, uses random 35-75ms per char)
km.keyboard(1, 100)               # Stream RAW keyboard keys every 100 frames (shows physical input)
km.keyboard(2, 50)                # Stream constructed frame keyboard keys every 50 frames (shows after remapping/masking)
km.keyboard(0)                    # Disable keyboard key streaming
```

### Mouse Commands

#### Mouse Button Commands
- **km.left(state)** - Set left button state: `0`=release (sends frame), `1`=down, `2`=silent_release (sets to 0 but doesn't send frame). `km.left()` reports 0=none, 1=raw, 2=injected, 3=both.
- **km.right(state)** - Set right button (0=release, 1=down, 2=silent_release). `km.right()` reports 0-3 as above.
- **km.middle(state)** - Set middle button (0=release, 1=down, 2=silent_release). `km.middle()` reports 0-3 as above.
- **km.side1(state)** - Set side1 button (0=release, 1=down, 2=silent_release). `km.side1()` reports 0-3 as above.
- **km.side2(state)** - Set side2 button (0=release, 1=down, 2=silent_release). `km.side2()` reports 0-3 as above.
- **km.click(button,count,delay_ms)** - Queue multiple mouse button clicks with timing.
  - `button`: Button number (1=left, 2=right, 3=middle, 4=side1, 5=side2)
  - `count`: Number of clicks (default: 1)
  - `delay_ms`: Time between press and release in milliseconds (default: random 35-75ms, internal timing)
  - Clicks are scheduled sequentially with proper timing
  - **Examples**: 
    - `km.click(1)` - Single left click with random 35-75ms hold
    - `km.click(1, 3)` - Triple left click with random timing
    - `km.click(1, 3, 50)` - Triple left click with 50ms hold time
- **km.turbo(button,delay_ms)** - Enable rapid-fire mode for mouse buttons. When the button is held down, it automatically triggers rapid press/release cycles at the specified interval. **Multiple buttons can have turbo enabled simultaneously**, each with its own delay setting.
  - `button`: 
    - Mouse buttons: `1`-`5` (1=left, 2=right, 3=middle, 4=side1, 5=side2)
    - `0` to disable all turbo
  - `delay_ms`: 1-5000ms (0=disable). If omitted, uses random 35-75ms. The delay is the time between each press/release toggle (e.g., 500ms = press for 500ms, release for 500ms, repeat)
  - Delay is automatically rounded to the mouse endpoint's `bInterval` for USB synchronization
  - `km.turbo()` - Returns only active turbo settings as `(m1=200, m2=400)` (only shows what's set, not zeros)
  - `km.turbo(button)` - Sets turbo with random 35-75ms delay (auto-rounded to bInterval)
  - `km.turbo(button, delay_ms)` - Sets turbo with specified delay (auto-rounded to bInterval)
  - `km.turbo(button, 0)` - Disables turbo for that specific button
  - `km.turbo(0)` - **Disables all turbo**
  - **Examples**: 
    - `km.turbo(1, 500)` - Enables 500ms rapid-fire for left mouse button
    - `km.turbo(2, 250)` - Enables 250ms for right mouse button
    - `km.turbo(1)` - Enables rapid-fire with random 35-75ms delay for left mouse button
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

#### Mouse Remap Commands (Physical Only)
- **km.remap_button(src,dst)** - Remap mouse buttons. Injection is NOT affected.
  - `()` - Show only active mappings, e.g., `(left:right,right:left)`
  - `(0)` - Reset all button remaps
  - `(src,dst)` - Map button src→dst (1=left, 2=right, 3=middle, 4=side1, 5=side2)
  - `(src,0)` - Clear remap for button src
  - Auto-clears conflicting mappings; both directions can be mapped (swap)
- **km.invert_x(state)** / **km.invert_y(state)** / **km.swap_xy(state)** - Individual axis controls.
  - `()` - Query current state
  - `(0)` - Disable
  - `(1)` - Enable

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

Total commands: 47
