'use client';

import { useState } from 'react';
import { ReportData } from '@/types';

interface ExportButtonsProps {
  reportData: ReportData;
}

const MAX_EXPORT_SIZE_MB = 10; // 最大10MB

export default function ExportButtons({ reportData }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handlePDFExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);

    try {
    // Dynamic import for client-side only
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const mainContent = document.getElementById('main-report');
    const visualSheet = document.getElementById('visual-sheet');

    if (!mainContent) {
      alert('出力するコンテンツがありません');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    // Capture main content
    const mainCanvas = await html2canvas(mainContent, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const mainImgWidth = contentWidth;
    const mainImgHeight = (mainCanvas.height * contentWidth) / mainCanvas.width;

    // Add main content (may span multiple pages)
    let yPosition = margin;
    let remainingHeight = mainImgHeight;
    let sourceY = 0;

    while (remainingHeight > 0) {
      const sliceHeight = Math.min(pageHeight - margin * 2, remainingHeight);
      const sliceRatio = sliceHeight / mainImgHeight;

      // Create a temporary canvas for this slice
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = mainCanvas.width;
      sliceCanvas.height = mainCanvas.height * sliceRatio;
      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          mainCanvas,
          0,
          sourceY,
          mainCanvas.width,
          sliceCanvas.height,
          0,
          0,
          sliceCanvas.width,
          sliceCanvas.height
        );
      }

      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', margin, yPosition, mainImgWidth, sliceHeight);

      remainingHeight -= sliceHeight;
      sourceY += sliceCanvas.height;

      if (remainingHeight > 0) {
        pdf.addPage();
        yPosition = margin;
      }
    }

    // Capture visual sheet if exists
    if (visualSheet) {
      pdf.addPage();
      const visualCanvas = await html2canvas(visualSheet, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const visualImgWidth = contentWidth;
      const visualImgHeight = (visualCanvas.height * contentWidth) / visualCanvas.width;

      // Scale to fit one page
      const scaleFactor = Math.min(1, (pageHeight - margin * 2) / visualImgHeight);
      const finalWidth = visualImgWidth * scaleFactor;
      const finalHeight = visualImgHeight * scaleFactor;

      pdf.addImage(
        visualCanvas.toDataURL('image/png'),
        'PNG',
        margin + (contentWidth - finalWidth) / 2,
        margin,
        finalWidth,
        finalHeight
      );
    }

    // Check file size
    const pdfOutput = pdf.output('arraybuffer');
    const fileSizeMB = pdfOutput.byteLength / (1024 * 1024);

    if (fileSizeMB > MAX_EXPORT_SIZE_MB) {
      setExportError(`ファイルサイズが大きすぎます（${fileSizeMB.toFixed(1)}MB）。内容を減らしてください。`);
      return;
    }

    // Download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    pdf.save(`クレーム対応報告書_${timestamp}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      setExportError('PDF出力中にエラーが発生しました。再試行してください。');
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
