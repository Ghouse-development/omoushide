'use client';

import { useState } from 'react';
import { ReportData } from '@/types';

interface ExportButtonsProps {
  reportData: ReportData;
}

const MAX_EXPORT_SIZE_MB = 10; // 最大10MB

// lab(), oklch(), oklab() などの新しいCSSカラー関数をRGBに変換するヘルパー
function sanitizeColorsForHtml2Canvas(element: HTMLElement): void {
  const computedStyle = window.getComputedStyle(element);
  const colorProps = [
    'color',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'box-shadow'
  ];

  colorProps.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop);
    if (value && (value.includes('lab(') || value.includes('oklch(') || value.includes('oklab(') || value.includes('color('))) {
      // 計算されたRGB値を取得して直接設定
      // ブラウザは内部的にRGBに変換しているので、canvasコンテキストで描画して取得
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = value;
        const rgbValue = ctx.fillStyle; // ブラウザがRGB/RGBAに変換
        element.style.setProperty(prop, rgbValue, 'important');
      }
    }
  });

  // 子要素を再帰的に処理
  Array.from(element.children).forEach(child => {
    if (child instanceof HTMLElement) {
      sanitizeColorsForHtml2Canvas(child);
    }
  });
}

// 要素をクローンしてカラーを正規化
async function captureElementToPng(element: HTMLElement): Promise<string> {
  const html2canvas = (await import('html2canvas')).default;

  // 一時的なスタイルシートを追加してlab()色を上書き
  const tempStyle = document.createElement('style');
  tempStyle.id = 'temp-pdf-export-style';
  tempStyle.textContent = `
    /* Tailwind CSS lab() カラーのフォールバック */
    .bg-gray-50 { background-color: #f9fafb !important; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-white { background-color: #ffffff !important; }
    .bg-red-50 { background-color: #fef2f2 !important; }
    .bg-amber-100 { background-color: #fef3c7 !important; }
    .text-gray-400 { color: #9ca3af !important; }
    .text-gray-500 { color: #6b7280 !important; }
    .text-gray-700 { color: #374151 !important; }
    .text-gray-800 { color: #1f2937 !important; }
    .text-red-500 { color: #ef4444 !important; }
    .text-red-700 { color: #b91c1c !important; }
    .text-amber-600 { color: #d97706 !important; }
    .text-amber-800 { color: #92400e !important; }
    .border-gray-100 { border-color: #f3f4f6 !important; }
    .border-gray-200 { border-color: #e5e7eb !important; }
    .border-gray-300 { border-color: #d1d5db !important; }
    .border-red-200 { border-color: #fecaca !important; }
    .border-amber-300 { border-color: #fcd34d !important; }
    [class*="bg-[#"] { background-color: inherit; }
    [class*="text-[#"] { color: inherit; }
  `;
  document.head.appendChild(tempStyle);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      foreignObjectRendering: false,
    });

    return canvas.toDataURL('image/png');
  } finally {
    // 一時スタイルシートを削除
    tempStyle.remove();
  }
}

export default function ExportButtons({ reportData }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handlePDFExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);

    try {
      const { jsPDF } = await import('jspdf');

      const mainContent = document.getElementById('main-report');
      const visualSheet = document.getElementById('visual-sheet');

      if (!mainContent) {
        setExportError('出力するコンテンツがありません');
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;

      // Main contentをキャプチャ
      const mainDataUrl = await captureElementToPng(mainContent);

      // 画像をPDFに追加
      const img = new Image();
      img.src = mainDataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const mainImgWidth = contentWidth;
      const mainImgHeight = (img.height * contentWidth) / img.width;

      // 複数ページに分割して追加
      let yPosition = margin;
      let remainingHeight = mainImgHeight;
      let sourceY = 0;
      const imgHeightPerPage = pageHeight - margin * 2;

      // 簡易的な方法: 画像全体を縮小してフィットさせる
      if (mainImgHeight <= imgHeightPerPage) {
        pdf.addImage(mainDataUrl, 'PNG', margin, yPosition, mainImgWidth, mainImgHeight);
      } else {
        // 画像が大きい場合は縮小
        const scaleFactor = imgHeightPerPage / mainImgHeight;
        const scaledWidth = mainImgWidth * scaleFactor;
        const scaledHeight = mainImgHeight * scaleFactor;
        const xOffset = margin + (contentWidth - scaledWidth) / 2;
        pdf.addImage(mainDataUrl, 'PNG', xOffset, margin, scaledWidth, scaledHeight);
      }

      // Visual sheetがある場合は新しいページに追加
      if (visualSheet) {
        pdf.addPage();

        const visualDataUrl = await captureElementToPng(visualSheet);

        const visualImg = new Image();
        visualImg.src = visualDataUrl;
        await new Promise<void>((resolve, reject) => {
          visualImg.onload = () => resolve();
          visualImg.onerror = reject;
        });

        const visualImgWidth = contentWidth;
        const visualImgHeight = (visualImg.height * contentWidth) / visualImg.width;

        // ページにフィットさせる
        const scaleFactor = Math.min(1, imgHeightPerPage / visualImgHeight);
        const finalWidth = visualImgWidth * scaleFactor;
        const finalHeight = visualImgHeight * scaleFactor;

        pdf.addImage(
          visualDataUrl,
          'PNG',
          margin + (contentWidth - finalWidth) / 2,
          margin,
          finalWidth,
          finalHeight
        );
      }

      // ファイルサイズチェック
      const pdfOutput = pdf.output('arraybuffer');
      const fileSizeMB = pdfOutput.byteLength / (1024 * 1024);

      if (fileSizeMB > MAX_EXPORT_SIZE_MB) {
        setExportError(`ファイルサイズが大きすぎます（${fileSizeMB.toFixed(1)}MB）。内容を減らしてください。`);
        return;
      }

      // ダウンロード
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      pdf.save(`クレーム対応報告書_${timestamp}.pdf`);

    } catch (error) {
      console.error('PDF export error:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      setExportError(`PDF出力中にエラーが発生しました: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExcelExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);

    try {
      const XLSX = await import('xlsx');

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Main sheet data
      const mainData = [
        ['クレーム対応報告書'],
        [],
        ['報告日', reportData.reportDate],
        ['報告者', reportData.reporter],
        [],
        ['■ 経緯'],
        ['日時', '相手', '経緯（要約）', '詳細'],
        ...reportData.history.map(h => [h.date, h.person, h.summary, h.detail]),
        [],
        ['■ 原因'],
        [reportData.cause],
        [],
        ['■ 対策'],
        [reportData.countermeasure],
      ];

      const ws = XLSX.utils.aoa_to_sheet(mainData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 },
        { wch: 12 },
        { wch: 30 },
        { wch: 50 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, '報告書');

      // Visual sheet if exists
      if (reportData.visualSheet) {
        const vs = reportData.visualSheet;
        const visualData = [
          ['改善対策ご提案書'],
          [],
          ['タイトル', vs.title],
          [],
          ['■ 経緯サマリー'],
          [vs.summary],
          [],
          ['■ 原因分析'],
          ['根本原因', vs.rootCause],
          ['詳細分析', vs.causeAnalysis],
          [],
          ['■ 改善対策'],
          ['タイトル', '内容', '優先度'],
          ...vs.countermeasures.map(cm => [cm.title, cm.content, cm.priority]),
          [],
          ['■ 期待効果'],
          [vs.expectedEffect],
        ];

        const ws2 = XLSX.utils.aoa_to_sheet(visualData);
        ws2['!cols'] = [
          { wch: 20 },
          { wch: 50 },
          { wch: 10 },
        ];
        XLSX.utils.book_append_sheet(wb, ws2, 'AI対策提案');
      }

      // Download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      XLSX.writeFile(wb, `クレーム対応報告書_${timestamp}.xlsx`);

    } catch (error) {
      console.error('Excel export error:', error);
      setExportError('Excel出力中にエラーが発生しました。再試行してください。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 no-print">
      {exportError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {exportError}
        </div>
      )}
      <div className="flex gap-4">
        <button
          onClick={handlePDFExport}
          disabled={isExporting}
          className="px-6 py-3 bg-[#d93025] text-white rounded-lg font-medium hover:bg-[#b92a1f] transition-colors flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          PDF出力
        </button>
        <button
          onClick={handleExcelExport}
          disabled={isExporting}
          className="px-6 py-3 bg-[#34a853] text-white rounded-lg font-medium hover:bg-[#2d8e47] transition-colors flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          Excel出力
        </button>
      </div>
    </div>
  );
}
