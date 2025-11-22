# MAKCU Settings Page Specification

## Overview / 概述

This document provides complete specifications for building a MAKCU settings webpage that allows users to configure and interact with their MAKCU device via WebSerial connection. The page should mirror the layout and structure of the troubleshooting page.

本文档提供了构建 MAKCU 设置网页的完整规范，允许用户通过 WebSerial 连接配置和交互其 MAKCU 设备。页面应镜像故障排除页面的布局和结构。

---

## Prerequisites / 前提条件

### English

**Important Notes:**

To use the MAKCU settings page, you need to have:
1. **MAKCU flashed with 3.9 firmware** - The settings page requires firmware version 3.9 or later
2. **USB 1 connected to your PC** - USB 1 must be connected to the computer running the webpage
3. **USB 2 connected to this PC** - USB 2 must be connected to the same computer. Otherwise, MAKCU is not functional.

**Note:** If you encounter connection issues, please see the troubleshooting page for detailed setup instructions.

### 中文

**重要提示：**

要使用 MAKCU 设置页面，您需要：
1. **MAKCU 已刷入 3.9 固件** - 设置页面需要固件版本 3.9 或更高版本
2. **USB 1 连接到您的 PC** - USB 1 必须连接到运行网页的计算机
3. **USB 2 连接到本 PC** - USB 2 必须连接到同一台计算机。否则，MAKCU 无法正常工作。

**注意：** 如果遇到连接问题，请参阅故障排除页面以获取详细的设置说明。

---

## Technical Requirements / 技术要求

### WebSerial API

The page must use the WebSerial API (same as the MAKCU flasher) to establish a serial connection with the MAKCU device.

页面必须使用 WebSerial API（与 MAKCU 刷机工具相同）与 MAKCU 设备建立串行连接。

### Browser Compatibility Check / 浏览器兼容性检查

The page must implement the same browser compatibility check as the MAKCU flasher. This should verify that:
- The browser supports the WebSerial API
- The browser is a compatible version (Chrome/Edge 89+, Opera 76+, etc.)

页面必须实现与 MAKCU 刷机工具相同的浏览器兼容性检查。这应该验证：
- 浏览器支持 WebSerial API
- 浏览器是兼容版本（Chrome/Edge 89+、Opera 76+ 等）

---

## Status Display / 状态显示

### Status Location / 状态位置

The MAKCU connection status must be displayed at the **very top** of the page, before any other content.

MAKCU 连接状态必须显示在页面的**最顶部**，在任何其他内容之前。

### Status States / 状态

The status display must show one of the following states:

状态显示必须显示以下状态之一：

#### 1. Not Connected / 未连接

- **English**: `MAKCU status : Not connected`
- **中文**: `MAKCU 状态：未连接`
- **When shown**: Initial state when page loads, or after disconnection
- **何时显示**：页面加载时的初始状态，或断开连接后

#### 2. Connecting / 连接中

- **English**: `MAKCU status : Connecting`
- **中文**: `MAKCU 状态：连接中`
- **When shown**: When the connection process has started (after user clicks connect and WebSerial port is opening)
- **何时显示**：连接过程已开始时（用户点击连接且 WebSerial 端口正在打开）

#### 3. Connected / 已连接

- **English**: `MAKCU status : Connected`
- **中文**: `MAKCU 状态：已连接`
- **When shown**: After successfully validating the device response (see Connection Protocol section)
- **何时显示**：成功验证设备响应后（参见连接协议部分）

#### 4. Fault / 故障

- **English**: `MAKCU status : Fault`
- **中文**: `MAKCU 状态：故障`
- **When shown**: When no response is received after sending the version command, or when an invalid response is received
- **何时显示**：发送版本命令后未收到响应，或收到无效响应时

---

## Connection Protocol / 连接协议

### Connection Flow / 连接流程

1. **Open Serial Port / 打开串口**
   - Baud rate: **115200**
   - Data bits: 8
   - Stop bits: 1
   - Parity: None
   - Flow control: None

2. **Send Version Command / 发送版本命令**
   - Command to send: `km.version()\r`
   - Note: The `\r` (carriage return) is required
   - 注意：需要 `\r`（回车符）

3. **Wait for Response / 等待响应**
   - Timeout: Recommended 3-5 seconds
   - 超时：建议 3-5 秒

4. **Validate Response / 验证响应**
   - Expected response: `"km.MAKCU()\r\n>>> "`
   - The response should contain exactly this string
   - If the response matches, set status to "Connected"
   - If no response or invalid response, set status to "Fault"
   - 预期响应：`"km.MAKCU()\r\n>>> "`
   - 响应应完全包含此字符串
   - 如果响应匹配，将状态设置为"已连接"
   - 如果没有响应或响应无效，将状态设置为"故障"

### Response Validation Code Example / 响应验证代码示例

```javascript
// Pseudo-code for response validation
const expectedResponse = "km.MAKCU()\r\n>>> ";
const receivedData = await readFromSerial(timeout);

if (receivedData.includes(expectedResponse)) {
    status = "Connected";
} else {
    status = "Fault";
}
```

---

## Disconnection Detection / 断开连接检测

The page must detect when the WebSerial connection is lost and update the status accordingly.

页面必须检测 WebSerial 连接何时丢失并相应地更新状态。

### Disconnection Scenarios / 断开连接场景

1. **User disconnects / 用户断开连接**
   - When user clicks disconnect button
   - Status should change to "Not connected"
   - 当用户点击断开连接按钮时
   - 状态应更改为"未连接"

2. **Device unplugged / 设备拔出**
   - When the serial port is closed unexpectedly
   - Status should change to "Not connected" or "Fault"
   - 当串口意外关闭时
   - 状态应更改为"未连接"或"故障"

3. **Connection error / 连接错误**
   - When read/write operations fail
   - Status should change to "Fault"
   - 当读/写操作失败时
   - 状态应更改为"故障"

### Implementation / 实现

```javascript
// Listen for disconnect events
port.addEventListener('disconnect', () => {
    status = "Not connected";
    updateStatusDisplay();
});

// Monitor connection health
setInterval(() => {
    if (port && port.readable) {
        // Connection is still alive
    } else {
        status = "Fault";
        updateStatusDisplay();
    }
}, 1000);
```

---

## UI Layout / 用户界面布局

### Layout Structure / 布局结构

The page should mirror the layout of the troubleshooting page. This includes:

页面应镜像故障排除页面的布局。这包括：

1. **Status Display Section / 状态显示部分**
   - At the very top of the page
   - Prominent, easy to see
   - Clear visual indication of current state
   - 在页面最顶部
   - 突出，易于查看
   - 清晰显示当前状态

2. **Prerequisites/Notes Section / 前提条件/注意事项部分**
   - Similar styling to troubleshooting page
   - Clear warning about firmware and USB requirements
   - Link to troubleshooting page for setup help
   - 与故障排除页面相似的样式
   - 关于固件和 USB 要求的明确警告
   - 链接到故障排除页面以获取设置帮助

3. **Connection Controls / 连接控制**
   - Connect/Disconnect button
   - Status indicator
   - 连接/断开连接按钮
   - 状态指示器

4. **Settings Content Area / 设置内容区域**
   - Space for future settings controls
   - Consistent with overall page design
   - 用于未来设置控件的空间
   - 与整体页面设计一致

### Visual Design / 视觉设计

- Use the same color scheme as the troubleshooting page
- Maintain consistent spacing and typography
- Ensure responsive design for different screen sizes
- 使用与故障排除页面相同的配色方案
- 保持一致的间距和排版
- 确保不同屏幕尺寸的响应式设计

---

## Implementation Details / 实现细节

### WebSerial Connection Code Pattern / WebSerial 连接代码模式

```javascript
// Check browser support
if (!navigator.serial) {
    showError("WebSerial API not supported. Please use Chrome/Edge 89+ or Opera 76+");
    return;
}

// Open port
try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    
    status = "Connecting";
    updateStatusDisplay();
    
    // Send version command
    const writer = port.writable.getWriter();
    await writer.write(new TextEncoder().encode("km.version()\r"));
    writer.releaseLock();
    
    // Read response
    const reader = port.readable.getReader();
    const { value, done } = await reader.read();
    reader.releaseLock();
    
    // Validate response
    const response = new TextDecoder().decode(value);
    if (response.includes("km.MAKCU()\r\n>>> ")) {
        status = "Connected";
    } else {
        status = "Fault";
    }
    
    updateStatusDisplay();
    
} catch (error) {
    status = "Fault";
    updateStatusDisplay();
    console.error("Connection error:", error);
}
```

### Status Update Function / 状态更新函数

```javascript
function updateStatusDisplay() {
    const statusElement = document.getElementById('makcu-status');
    const lang = getCurrentLanguage(); // 'en' or 'cn'
    
    const statusText = {
        'Not connected': { en: 'Not connected', cn: '未连接' },
        'Connecting': { en: 'Connecting', cn: '连接中' },
        'Connected': { en: 'Connected', cn: '已连接' },
        'Fault': { en: 'Fault', cn: '故障' }
    };
    
    statusElement.textContent = `MAKCU status : ${statusText[status][lang]}`;
    
    // Update visual styling based on status
    statusElement.className = `status-${status.toLowerCase().replace(' ', '-')}`;
}
```

### Language Support / 语言支持

The page must support both English and Chinese. Implement a language toggle or detect browser language.

页面必须支持英文和中文。实现语言切换或检测浏览器语言。

```javascript
// Language detection
function getCurrentLanguage() {
    const stored = localStorage.getItem('makcu-lang');
    if (stored) return stored;
    
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('zh') ? 'cn' : 'en';
}

// Language switching
function setLanguage(lang) {
    localStorage.setItem('makcu-lang', lang);
    updateAllText();
}
```

---

## Error Handling / 错误处理

### Connection Errors / 连接错误

- Display clear error messages in both languages
- Provide troubleshooting suggestions
- Log errors to console for debugging
- 以两种语言显示清晰的错误消息
- 提供故障排除建议
- 将错误记录到控制台以便调试

### Timeout Handling / 超时处理

- Implement reasonable timeouts for all serial operations
- Show appropriate status when timeout occurs
- Allow user to retry connection
- 为所有串行操作实现合理的超时
- 超时发生时显示适当的状态
- 允许用户重试连接

---

## Testing Checklist / 测试清单

### English

- [ ] Status displays correctly at page top
- [ ] "Not connected" shows on initial load
- [ ] "Connecting" shows when connection starts
- [ ] "Connected" shows after successful validation
- [ ] "Fault" shows when no/invalid response
- [ ] Disconnection detection works
- [ ] Browser compatibility check works
- [ ] WebSerial opens at 115200 baud
- [ ] Version command sends correctly with `\r`
- [ ] Response validation works for correct response
- [ ] Response validation fails for incorrect response
- [ ] Language switching works (EN/CN)
- [ ] Prerequisites note is visible
- [ ] Link to troubleshooting page works
- [ ] Layout matches troubleshooting page

### 中文

- [ ] 状态在页面顶部正确显示
- [ ] 初始加载时显示"未连接"
- [ ] 连接开始时显示"连接中"
- [ ] 成功验证后显示"已连接"
- [ ] 无/无效响应时显示"故障"
- [ ] 断开连接检测正常工作
- [ ] 浏览器兼容性检查正常工作
- [ ] WebSerial 以 115200 波特率打开
- [ ] 版本命令正确发送（带 `\r`）
- [ ] 正确响应的响应验证正常工作
- [ ] 错误响应的响应验证正确失败
- [ ] 语言切换正常工作（英文/中文）
- [ ] 前提条件说明可见
- [ ] 故障排除页面链接正常工作
- [ ] 布局与故障排除页面匹配

---

## Future Enhancements / 未来增强功能

This is a simple start of the UI. Future enhancements may include:

这是用户界面的简单开始。未来的增强功能可能包括：

- Settings configuration controls
- Real-time command execution
- Device information display
- Firmware update functionality
- 设置配置控件
- 实时命令执行
- 设备信息显示
- 固件更新功能

---

## References / 参考资料

- [MAKCU Commands Reference](./MAKCU_COMMANDS.md) - For available commands
- [Troubleshooting Page](./DEVICE_LED_STATUS.md) - For layout reference and setup help
- WebSerial API Documentation: https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API

---

## Version / 版本

- **Document Version**: 1.0
- **Firmware Requirement**: 3.9+
- **Last Updated**: 2024

