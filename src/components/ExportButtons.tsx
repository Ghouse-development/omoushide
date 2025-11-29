'use client';

import { useState } from 'react';
import { ReportData } from '@/types';

interface ExportButtonsProps {
  reportData: ReportData;
}

const MAX_EXPORT_SIZE_MB = 10;

// Tailwind CSS v4の全カラークラスをRGBにマッピング
const TAILWIND_COLOR_OVERRIDES = `
  /* Gray */
  .bg-gray-50 { background-color: #f9fafb !important; }
  .bg-gray-100 { background-color: #f3f4f6 !important; }
  .bg-gray-200 { background-color: #e5e7eb !important; }
  .bg-gray-300 { background-color: #d1d5db !important; }
  .bg-gray-400 { background-color: #9ca3af !important; }
  .bg-gray-500 { background-color: #6b7280 !important; }
  .bg-gray-600 { background-color: #4b5563 !important; }
  .bg-gray-700 { background-color: #374151 !important; }
  .bg-gray-800 { background-color: #1f2937 !important; }
  .bg-gray-900 { background-color: #111827 !important; }
  .text-gray-50 { color: #f9fafb !important; }
  .text-gray-100 { color: #f3f4f6 !important; }
  .text-gray-200 { color: #e5e7eb !important; }
  .text-gray-300 { color: #d1d5db !important; }
  .text-gray-400 { color: #9ca3af !important; }
  .text-gray-500 { color: #6b7280 !important; }
  .text-gray-600 { color: #4b5563 !important; }
  .text-gray-700 { color: #374151 !important; }
  .text-gray-800 { color: #1f2937 !important; }
  .text-gray-900 { color: #111827 !important; }
  .border-gray-50 { border-color: #f9fafb !important; }
  .border-gray-100 { border-color: #f3f4f6 !important; }
  .border-gray-200 { border-color: #e5e7eb !important; }
  .border-gray-300 { border-color: #d1d5db !important; }
  .border-gray-400 { border-color: #9ca3af !important; }
  .border-gray-500 { border-color: #6b7280 !important; }

  /* Red */
  .bg-red-50 { background-color: #fef2f2 !important; }
  .bg-red-100 { background-color: #fee2e2 !important; }
  .bg-red-200 { background-color: #fecaca !important; }
  .bg-red-500 { background-color: #ef4444 !important; }
  .bg-red-600 { background-color: #dc2626 !important; }
  .bg-red-700 { background-color: #b91c1c !important; }
  .text-red-50 { color: #fef2f2 !important; }
  .text-red-100 { color: #fee2e2 !important; }
  .text-red-500 { color: #ef4444 !important; }
  .text-red-600 { color: #dc2626 !important; }
  .text-red-700 { color: #b91c1c !important; }
  .border-red-200 { border-color: #fecaca !important; }
  .border-red-300 { border-color: #fca5a5 !important; }

  /* Blue */
  .bg-blue-50 { background-color: #eff6ff !important; }
  .bg-blue-100 { background-color: #dbeafe !important; }
  .bg-blue-200 { background-color: #bfdbfe !important; }
  .bg-blue-500 { background-color: #3b82f6 !important; }
  .bg-blue-600 { background-color: #2563eb !important; }
  .bg-blue-700 { background-color: #1d4ed8 !important; }
  .text-blue-50 { color: #eff6ff !important; }
  .text-blue-500 { color: #3b82f6 !important; }
  .text-blue-600 { color: #2563eb !important; }
  .text-blue-700 { color: #1d4ed8 !important; }
  .border-blue-200 { border-color: #bfdbfe !important; }
  .border-blue-300 { border-color: #93c5fd !important; }

  /* Green */
  .bg-green-50 { background-color: #f0fdf4 !important; }
  .bg-green-100 { background-color: #dcfce7 !important; }
  .bg-green-500 { background-color: #22c55e !important; }
  .bg-green-600 { background-color: #16a34a !important; }
  .text-green-500 { color: #22c55e !important; }
  .text-green-600 { color: #16a34a !important; }
  .text-green-700 { color: #15803d !important; }
  .border-green-200 { border-color: #bbf7d0 !important; }

  /* Yellow */
  .bg-yellow-50 { background-color: #fefce8 !important; }
  .bg-yellow-100 { background-color: #fef9c3 !important; }
  .bg-yellow-500 { background-color: #eab308 !important; }
  .text-yellow-500 { color: #eab308 !important; }
  .text-yellow-600 { color: #ca8a04 !important; }
  .border-yellow-200 { border-color: #fef08a !important; }

  /* Amber */
  .bg-amber-50 { background-color: #fffbeb !important; }
  .bg-amber-100 { background-color: #fef3c7 !important; }
  .bg-amber-500 { background-color: #f59e0b !important; }
  .text-amber-500 { color: #f59e0b !important; }
  .text-amber-600 { color: #d97706 !important; }
  .text-amber-700 { color: #b45309 !important; }
  .text-amber-800 { color: #92400e !important; }
  .border-amber-200 { border-color: #fde68a !important; }
  .border-amber-300 { border-color: #fcd34d !important; }

  /* Orange */
  .bg-orange-50 { background-color: #fff7ed !important; }
  .bg-orange-100 { background-color: #ffedd5 !important; }
  .bg-orange-500 { background-color: #f97316 !important; }
  .text-orange-500 { color: #f97316 !important; }
  .text-orange-600 { color: #ea580c !important; }

  /* Purple */
  .bg-purple-50 { background-color: #faf5ff !important; }
  .bg-purple-100 { background-color: #f3e8ff !important; }
  .bg-purple-500 { background-color: #a855f7 !important; }
  .text-purple-500 { color: #a855f7 !important; }
  .text-purple-600 { color: #9333ea !important; }

  /* Pink */
  .bg-pink-50 { background-color: #fdf2f8 !important; }
  .bg-pink-100 { background-color: #fce7f3 !important; }
  .bg-pink-500 { background-color: #ec4899 !important; }
  .text-pink-500 { color: #ec4899 !important; }

  /* White / Black */
  .bg-white { background-color: #ffffff !important; }
  .bg-black { background-color: #000000 !important; }
  .text-white { color: #ffffff !important; }
  .text-black { color: #000000 !important; }

  /* Transparent handling */
  .bg-transparent { background-color: transparent !important; }

  /* Focus rings - hide for PDF */
  .focus\\:ring-2, .focus\\:ring-4, [class*="focus:ring"] {
    box-shadow: none !important;
    outline: none !important;
  }

  /* Hide no-print elements */
  .no-print { display: none !important; }
`;

async function captureElementToPng(element: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = (await import('html2canvas')).default;

  // 一時スタイルシートを追加
  const tempStyle = document.createElement('style');
  tempStyle.id = 'temp-pdf-export-style-' + Date.now();
  tempStyle.textContent = TAILWIND_COLOR_OVERRIDES;
  document.head.appendChild(tempStyle);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      foreignObjectRendering: false,
      removeContainer: true,
    });
    return canvas;
  } finally {
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
      const maxContentHeight = pageHeight - margin * 2;

      // Main contentをキャプチャ
      const mainCanvas = await captureElementToPng(mainContent);
      const mainImgWidth = contentWidth;
      const mainImgHeight = (mainCanvas.height * contentWidth) / mainCanvas.width;

      // 複数ページに分割して追加
      if (mainImgHeight <= maxContentHeight) {
        // 1ページに収まる場合
        pdf.addImage(
          mainCanvas.toDataURL('image/png'),
          'PNG',
          margin,
          margin,
          mainImgWidth,
          mainImgHeight
        );
      } else {
        // 複数ページに分割
        const totalPages = Math.ceil(mainImgHeight / maxContentHeight);
        const pixelsPerPage = (mainCanvas.height / mainImgHeight) * maxContentHeight;

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
          }

          // このページ用のスライスを作成
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = mainCanvas.width;
          const remainingPixels = mainCanvas.height - (page * pixelsPerPage);
          sliceCanvas.height = Math.min(pixelsPerPage, remainingPixels);

          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              mainCanvas,
              0, page * pixelsPerPage,
              mainCanvas.width, sliceCanvas.height,
              0, 0,
              sliceCanvas.width, sliceCanvas.height
            );
          }

          const sliceHeight = (sliceCanvas.height * contentWidth) / sliceCanvas.width;
          pdf.addImage(
            sliceCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            margin,
            mainImgWidth,
            sliceHeight
          );
        }
      }

      // Visual sheetがある場合は新しいページに追加
      if (visualSheet) {
        pdf.addPage();
        const visualCanvas = await captureElementToPng(visualSheet);
        const visualImgWidth = contentWidth;
        const visualImgHeight = (visualCanvas.height * contentWidth) / visualCanvas.width;

        // ページにフィットさせる
        if (visualImgHeight <= maxContentHeight) {
          pdf.addImage(
            visualCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            margin,
            visualImgWidth,
            visualImgHeight
          );
        } else {
          // 縮小してフィット
          const scaleFactor = maxContentHeight / visualImgHeight;
          const scaledWidth = visualImgWidth * scaleFactor;
          const scaledHeight = visualImgHeight * scaleFactor;
          pdf.addImage(
            visualCanvas.toDataURL('image/png'),
            'PNG',
            margin + (contentWidth - scaledWidth) / 2,
            margin,
            scaledWidth,
            scaledHeight
          );
        }
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
      const wb = XLSX.utils.book_new();

      // Main sheet data
      const mainData = [
        ['クレーム対応報告書'],
        [],
        ['報告日', reportData.reportDate || ''],
        ['報告者', reportData.reporter || ''],
        [],
        ['■ 経緯'],
        ['日時', '相手', '経緯（要約）', '詳細'],
        ...(reportData.history || []).map(h => [
          h.date || '',
          h.person || '',
          h.summary || '',
          h.detail || ''
        ]),
        [],
        ['■ 原因'],
        [reportData.cause || ''],
        [],
        ['■ 対策'],
        [reportData.countermeasure || ''],
      ];

      const ws = XLSX.utils.aoa_to_sheet(mainData);
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
          ['タイトル', vs.title || ''],
          [],
          ['■ 経緯サマリー'],
          [vs.summary || ''],
          [],
          ['■ 原因分析'],
          ['根本原因', vs.rootCause || ''],
          ['詳細分析', vs.causeAnalysis || ''],
          [],
          ['■ 改善対策'],
          ['タイトル', '内容', '優先度'],
          ...(vs.countermeasures || []).map(cm => [
            cm.title || '',
            cm.content || '',
            cm.priority || ''
          ]),
          [],
          ['■ 期待効果'],
          [vs.expectedEffect || ''],
        ];

        const ws2 = XLSX.utils.aoa_to_sheet(visualData);
        ws2['!cols'] = [
          { wch: 20 },
          { wch: 50 },
          { wch: 10 },
        ];
        XLSX.utils.book_append_sheet(wb, ws2, 'AI対策提案');
      }

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
