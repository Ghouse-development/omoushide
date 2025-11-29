'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import LogInput from '@/components/LogInput';
import HistoryTable from '@/components/HistoryTable';
import CauseInput from '@/components/CauseInput';
import CountermeasureInput from '@/components/CountermeasureInput';
import VisualSheet from '@/components/VisualSheet';
import AIModal from '@/components/AIModal';
import ExportButtons from '@/components/ExportButtons';
import Toast, { ToastType } from '@/components/Toast';
import { HistoryItem, VisualSheetData, ReportData } from '@/types';

export default function Home() {
  // Form state
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reporter, setReporter] = useState('');
  const [logText, setLogText] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cause, setCause] = useState('');
  const [countermeasure, setCountermeasure] = useState('');
  const [visualSheet, setVisualSheet] = useState<VisualSheetData | null>(null);

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggestingCause, setIsSuggestingCause] = useState(false);
  const [isSuggestingCountermeasure, setIsSuggestingCountermeasure] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

  // Global loading state to prevent multiple operations
  const isLoading = isAnalyzing || isSuggestingCause || isSuggestingCountermeasure || isGeneratingVisual;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState<'cause' | 'countermeasure'>('cause');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // API calls with error handling
  const callAPI = async (action: string, data: Record<string, unknown>) => {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    return result;
  };

  // Analyze log
  const handleAnalyze = async () => {
    if (!logText.trim()) {
      showToast('ログを入力してください', 'warning');
      return;
    }
    if (logText.trim().length < 10) {
      showToast('ログが短すぎます（10文字以上入力してください）', 'warning');
      return;
    }
    if (isLoading) return;

    setIsAnalyzing(true);
    try {
      const result = await callAPI('summarize', { logText });
      if (Array.isArray(result.data)) {
        const items: HistoryItem[] = result.data.map((item: { date: string; person: string; summary: string; detail: string }, index: number) => ({
          id: `${Date.now()}-${index}`,
          date: item.date || '',
          person: item.person || '',
          summary: item.summary || '',
          detail: item.detail || '',
        }));
        setHistory(items);
        showToast(`${items.length}件の経緯を抽出しました`, 'success');
      } else {
        throw new Error('予期しない応答形式です');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '分析に失敗しました', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Suggest cause
  const handleSuggestCause = async () => {
    if (isLoading) return;
    if (history.length === 0 && !logText.trim()) {
      showToast('先にログを入力して経緯を生成してください', 'warning');
      return;
    }

    setIsSuggestingCause(true);
    try {
      const result = await callAPI('suggestCause', { history, logText });
      setModalTitle('AI原因分析');
      setModalContent(result.data);
      setModalType('cause');
      setModalOpen(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '分析に失敗しました', 'error');
    } finally {
      setIsSuggestingCause(false);
    }
  };

  // Suggest countermeasure
  const handleSuggestCountermeasure = async () => {
    if (isLoading) return;
    if (history.length === 0 && !logText.trim()) {
      showToast('先にログを入力して経緯を生成してください', 'warning');
      return;
    }

    setIsSuggestingCountermeasure(true);
    try {
      const result = await callAPI('suggestCountermeasure', { history, logText, cause });
      setModalTitle('AI対策提案');
      setModalContent(result.data);
      setModalType('countermeasure');
      setModalOpen(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '分析に失敗しました', 'error');
    } finally {
      setIsSuggestingCountermeasure(false);
    }
  };

  // Generate visual sheet
  const handleGenerateVisual = async () => {
    if (isLoading) return;
    if (history.length === 0 && !logText.trim()) {
      showToast('先にログを入力して経緯を生成してください', 'warning');
      return;
    }

    setIsGeneratingVisual(true);
    try {
      const result = await callAPI('generateVisualSheet', { history, logText, cause, countermeasure });
      if (typeof result.data === 'object') {
        setVisualSheet(result.data as VisualSheetData);
        showToast('ビジュアル対策シートを生成しました', 'success');
        // Scroll to visual sheet
        setTimeout(() => {
          document.getElementById('visual-sheet')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error('予期しない応答形式です');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '生成に失敗しました', 'error');
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  // Apply AI hint to input
  const handleApplyAIHint = (content: string) => {
    if (modalType === 'cause') {
      setCause(prev => prev ? `${prev}\n\n${content}` : content);
      showToast('原因欄に反映しました', 'success');
    } else {
      setCountermeasure(prev => prev ? `${prev}\n\n${content}` : content);
      showToast('対策欄に反映しました', 'success');
    }
  };

  // History table handlers
  const handleHistoryUpdate = (id: string, field: keyof HistoryItem, value: string) => {
    setHistory(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleHistoryDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleHistoryAdd = () => {
    setHistory(prev => [...prev, {
      id: `${Date.now()}`,
      date: '',
      person: '',
      summary: '',
      detail: '',
    }]);
  };

  // Report data for export
  const reportData: ReportData = {
    reportDate,
    reporter,
    logText,
    history,
    cause,
    countermeasure,
    visualSheet: visualSheet || undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Main Report */}
        <div id="main-report" className="space-y-6">
          {/* Report Header */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">報告日</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">報告者</label>
                <input
                  type="text"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  placeholder="報告者名を入力"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Log Input */}
          <LogInput
            value={logText}
            onChange={setLogText}
            onAnalyze={handleAnalyze}
            isLoading={isAnalyzing}
          />

          {/* History Table */}
          <HistoryTable
            history={history}
            onUpdate={handleHistoryUpdate}
            onDelete={handleHistoryDelete}
            onAdd={handleHistoryAdd}
          />

          {/* Cause Input */}
          <CauseInput
            value={cause}
            onChange={setCause}
            onAIHint={handleSuggestCause}
            isLoading={isSuggestingCause}
          />

          {/* Countermeasure Input */}
          <CountermeasureInput
            value={countermeasure}
            onChange={setCountermeasure}
            onAIHint={handleSuggestCountermeasure}
            onGenerateVisual={handleGenerateVisual}
            isLoading={isSuggestingCountermeasure}
            isGeneratingVisual={isGeneratingVisual}
          />
        </div>

        {/* Visual Sheet */}
        {visualSheet && (
          <div className="mt-8">
            <VisualSheet
              data={visualSheet}
              reportDate={reportDate}
              reporter={reporter}
            />
          </div>
        )}

        {/* Export Buttons */}
        <div className="mt-8">
          <ExportButtons reportData={reportData} />
        </div>
      </main>

      {/* AI Modal */}
      <AIModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={handleApplyAIHint}
        title={modalTitle}
        content={modalContent}
        type={modalType}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 flex items-center gap-4">
            <svg className="animate-spin w-8 h-8 text-[#1a73e8]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-700 font-medium">AIが処理中...</span>
          </div>
        </div>
      )}
    </div>
  );
}
