'use client';

import { useEffect, useState } from 'react';

export default function BrowserCheck() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // 古いブラウザの検出
    const isOldBrowser = () => {
      // IE検出
      const isIE = !!(document as { documentMode?: number }).documentMode;
      if (isIE) return true;

      // Edge Legacy検出
      const isEdgeLegacy = !isIE && !!(window as { StyleMedia?: unknown }).StyleMedia;
      if (isEdgeLegacy) return true;

      // 古いChrome/Firefox/Safari検出（ES2020未対応）
      try {
        // Optional chaining と nullish coalescing のテスト
        const test = { a: { b: 1 } };
        const result = test?.a?.b ?? 0;
        if (result !== 1) return true;
      } catch {
        return true;
      }

      return false;
    };

    if (isOldBrowser()) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 text-amber-800 text-sm text-center">
      <strong>ご注意:</strong> お使いのブラウザは古いバージョンのため、一部機能が正常に動作しない可能性があります。
      最新のChrome、Firefox、Safari、またはEdgeをご使用ください。
      <button
        onClick={() => setShowWarning(false)}
        className="ml-4 text-amber-600 hover:text-amber-800 underline"
      >
        閉じる
      </button>
    </div>
  );
}
