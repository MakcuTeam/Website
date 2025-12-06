# Module Split Status

## ✅ Completed

1. ✅ Created `makcu/types.ts` - All TypeScript types
2. ✅ Created `makcu/constants.ts` - All constants
3. ✅ Created `makcu/protocol.ts` - Binary protocol functions
4. ✅ Created `makcu/parsers.ts` - Command parsers  
5. ✅ Created `makcu/utils.ts` - Utility functions
6. ✅ Created `makcu/index.ts` - Central export
7. ✅ Updated main provider imports
8. ✅ Removed protocol duplicates

## 🔄 In Progress - Fixing Linter Errors

The linter found 21 conflicts where local declarations exist alongside imports. These need to be removed:

### To Remove from makcu-connection-provider.tsx:

Search for and DELETE these local declarations (they're now imported):

1. **Types** (around lines 620-700):
   - `export type ConnectionMode`
   - `export type ConnectionStatus` 
   - `export interface MakcuStatus`
   - `interface MakcuConnectionState`
   - `interface SerialDataCallback`
   - `type BinaryFrameSubscriber`
   - `type TextLogSubscriber`
   - `export type TestStatus`
   - `export interface MouseTestResults`
   - `export interface KeyboardTestResults`
   - `export interface DeviceTestResult`

2. **Parser Functions** (around lines 160-360):
   - All `function parseCmdXXX` functions
   - `function parseStatusResponse`
   - `function parseDeviceTestResponse`
   - `function routeApiCommand`
   - `export function registerApiCommandParser`
   - `function registerCommandParsers` and its call
   - `const commandParserRegistry`
   - `type CommandParser`

3. **Cookie Constants** (around line 377):
   - `const DEVICE_INFO_COOKIE`
   - `const DEVICE_INFO_EXPIRY_HOURS`
   - `function setCookie`

4. **Utility Functions** (lines 690-817 - inside component):
   - The exported versions of:
     - `calculateTimeout`
     - `calculateMaxRetries`
     - `calculateRetryDelay`
     - `openPortWithBaudRate`
     - `safeClosePort`
     - `getComPort`

## 📝 Quick Fix Instructions

1. Open `makcu-connection-provider.tsx`
2. Search for `export type ConnectionMode` - DELETE it and ConnectionStatus below it
3. Search for `export interface MakcuStatus` - DELETE the whole interface
4. Search for `interface MakcuConnectionState` - DELETE it
5. Search for `interface SerialDataCallback` - DELETE it
6. Search for `type BinaryFrameSubscriber` - DELETE both type declarations
7. Search for `export type TestStatus` - DELETE all test-related types
8. Search for `function parseCmdMAC1` - DELETE all parser functions until `function buildAndStoreDeviceInfo`
9. Search for `const DEVICE_INFO_COOKIE = "makcu` - DELETE both cookie constants
10. Search for `const commandParserRegistry` - DELETE it
11. Search for `type CommandParser` - DELETE it
12. Search for `function registerCommandParsers` - DELETE it and the call to it
13. Inside the component, search for `export function calculateTimeout` - these are the ONES TO KEEP (they're inside the component)
14. Actually, those inside the component should be regular functions, not exported

## ⚠️ Important

The file has:
- Functions OUTSIDE the component (lines 690-817) - these were EXPORTED and should be REMOVED
- Functions INSIDE the component (after line 817) - these are local and use hooks, keep them

Make sure to only remove the exported utility functions that don't use React hooks!

## 🧪 Testing Checklist

After fixing linter errors:

- [ ] No TypeScript errors
- [ ] Website compiles successfully  
- [ ] Can connect to device
- [ ] STATUS polling works
- [ ] Device info fetching works
- [ ] bInterval values display correctly
- [ ] All parsers work

## 📊 Current File Sizes

- makcu-connection-provider.tsx: 2164 lines (will be ~1600 after cleanup)
- makcu/types.ts: 97 lines
- makcu/constants.ts: 65 lines
- makcu/protocol.ts: 95 lines
- makcu/parsers.ts: 360 lines
- makcu/utils.ts: 108 lines
- makcu/index.ts: 15 lines

**Total modular code**: 740 lines
**Remaining in provider**: ~1600 lines (React component logic)
**Total**: ~2340 lines (slightly more due to comments/organization, but much better structured!)

