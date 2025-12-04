"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import {
  parseDeviceTestResponse,
  DeviceTestResult,
  TestStatus,
} from "./contexts/makcu-connection-provider";
import type { Locale } from "@/lib/locale";
import { CheckCircle2, XCircle, MinusCircle, Loader2, MousePointer2, Keyboard } from "lucide-react";

type DeviceTestDisplayProps = {
  lang: Locale;
};

const labels = {
  button1: { en: "Left Button", cn: "左键" },
  button2: { en: "Right Button", cn: "右键" },
  button3: { en: "Middle Button", cn: "中键" },
  button4: { en: "Back Button", cn: "后退键" },
  button5: { en: "Forward Button", cn: "前进键" },
  xAxis: { en: "X Axis", cn: "X轴" },
  yAxis: { en: "Y Axis", cn: "Y轴" },
  wheel: { en: "Wheel", cn: "滚轮" },
  pan: { en: "Pan", cn: "水平滚动" },
  tilt: { en: "Tilt", cn: "倾斜" },
  keyPress: { en: "Key Press", cn: "按键按下" },
  keyRelease: { en: "Key Release", cn: "按键释放" },
  modifiers: { en: "Modifiers", cn: "修饰键" },
};

function TestResultIcon({ status }: { status: TestStatus }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "fail":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "not_supported":
      return <MinusCircle className="w-4 h-4 text-muted-foreground" />;
    default:
      return <MinusCircle className="w-4 h-4 text-muted-foreground/50" />;
  }
}

function TestResultRow({
  label,
  status,
  isCn,
}: {
  label: keyof typeof labels;
  status: TestStatus;
  isCn: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <TestResultIcon status={status} />
      <span className="text-sm text-foreground/80">
        {isCn ? labels[label].cn : labels[label].en}
      </span>
      {status === "not_supported" && (
        <span className="text-xs text-muted-foreground ml-auto">
          {isCn ? "不支持" : "N/A"}
        </span>
      )}
    </div>
  );
}

export function DeviceTestDisplay({ lang }: DeviceTestDisplayProps) {
  const { status, sendCommandAndReadResponse } = useMakcuConnection();
  const [testResult, setTestResult] = useState<DeviceTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const isCn = lang === "cn";

  const runTest = async (mode: number) => {
    if (status !== "connected" || !sendCommandAndReadResponse) return;

    setTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      // Send command and read response using the connection provider's helper
      const command = `.devicetest(${mode})\n`;
      const response = await sendCommandAndReadResponse(command, 10000); // 10 second timeout

      if (!response || response.length < 4) {
        setTestError(isCn ? "未收到响应或响应不完整" : "No response or incomplete response");
        return;
      }

      const result = parseDeviceTestResponse(response);
      if (result) {
        setTestResult(result);
      } else {
        setTestError(isCn ? "解析响应失败" : "Failed to parse response");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setTestError(message);
    } finally {
      setTesting(false);
    }
  };

  // Count results
  const getMouseSummary = () => {
    if (!testResult?.mouse) return null;
    const tests = Object.values(testResult.mouse);
    const passed = tests.filter((t) => t === "pass").length;
    const total = tests.filter((t) => t !== "not_supported").length;
    return { passed, total };
  };

  const getKeyboardSummary = () => {
    if (!testResult?.keyboard) return null;
    const tests = Object.values(testResult.keyboard);
    const passed = tests.filter((t) => t === "pass").length;
    const total = tests.length;
    return { passed, total };
  };

  const mouseSummary = getMouseSummary();
  const keyboardSummary = getKeyboardSummary();
  const allPassed =
    (!mouseSummary || mouseSummary.passed === mouseSummary.total) &&
    (!keyboardSummary || keyboardSummary.passed === keyboardSummary.total);

  return (
    <Card className="border-border/60 bg-card/90 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🧪 {isCn ? "设备测试" : "Device Test"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {isCn
            ? "测试连接的鼠标和键盘是否与 MAKCU 正常工作。测试期间会暂时阻止物理输入。"
            : "Test your connected mouse and keyboard to verify they work correctly with MAKCU. Physical input is temporarily blocked during testing."}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runTest(1)}
            disabled={testing || status !== "connected"}
          >
            {testing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MousePointer2 className="w-4 h-4 mr-2" />
            )}
            {isCn ? "测试鼠标" : "Test Mouse"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runTest(2)}
            disabled={testing || status !== "connected"}
          >
            {testing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Keyboard className="w-4 h-4 mr-2" />
            )}
            {isCn ? "测试键盘" : "Test Keyboard"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => runTest(3)}
            disabled={testing || status !== "connected"}
          >
            {testing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {isCn ? "全部测试" : "Test Both"}
          </Button>
        </div>

        {/* Status */}
        {status !== "connected" && (
          <p className="text-sm text-muted-foreground">
            {isCn ? "请先连接设备" : "Please connect a device first"}
          </p>
        )}

        {/* Error */}
        {testError && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive">{testError}</p>
          </div>
        )}

        {/* Results */}
        {testResult && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            {/* No devices */}
            {!testResult.mousePresent && !testResult.keyboardPresent && (
              <p className="text-sm text-muted-foreground">
                {isCn ? "未检测到设备" : "No devices detected"}
              </p>
            )}

            {/* Mouse Results */}
            {testResult.mouse && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <MousePointer2 className="w-4 h-4" />
                  {isCn ? "鼠标" : "Mouse"}
                  {mouseSummary && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {mouseSummary.passed}/{mouseSummary.total}
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <TestResultRow label="button1" status={testResult.mouse.button1} isCn={isCn} />
                  <TestResultRow label="button2" status={testResult.mouse.button2} isCn={isCn} />
                  <TestResultRow label="button3" status={testResult.mouse.button3} isCn={isCn} />
                  <TestResultRow label="button4" status={testResult.mouse.button4} isCn={isCn} />
                  <TestResultRow label="button5" status={testResult.mouse.button5} isCn={isCn} />
                  <TestResultRow label="xAxis" status={testResult.mouse.xAxis} isCn={isCn} />
                  <TestResultRow label="yAxis" status={testResult.mouse.yAxis} isCn={isCn} />
                  <TestResultRow label="wheel" status={testResult.mouse.wheel} isCn={isCn} />
                  <TestResultRow label="pan" status={testResult.mouse.pan} isCn={isCn} />
                  <TestResultRow label="tilt" status={testResult.mouse.tilt} isCn={isCn} />
                </div>
              </div>
            )}

            {/* Keyboard Results */}
            {testResult.keyboard && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Keyboard className="w-4 h-4" />
                  {isCn ? "键盘" : "Keyboard"}
                  {keyboardSummary && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {keyboardSummary.passed}/{keyboardSummary.total}
                    </span>
                  )}
                </h4>
                <div className="space-y-1">
                  <TestResultRow label="keyPress" status={testResult.keyboard.keyPress} isCn={isCn} />
                  <TestResultRow label="keyRelease" status={testResult.keyboard.keyRelease} isCn={isCn} />
                  <TestResultRow label="modifiers" status={testResult.keyboard.modifiers} isCn={isCn} />
                </div>
              </div>
            )}

            {/* Overall Summary */}
            {(testResult.mouse || testResult.keyboard) && (
              <div className={`p-3 rounded-md ${allPassed ? "bg-green-500/10 border border-green-500/30" : "bg-destructive/10 border border-destructive/30"}`}>
                <p className={`text-sm font-medium ${allPassed ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                  {allPassed
                    ? isCn
                      ? "✅ 所有测试通过"
                      : "✅ All tests passed"
                    : isCn
                    ? "❌ 部分测试失败"
                    : "❌ Some tests failed"}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

