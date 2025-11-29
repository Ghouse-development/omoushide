'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import LogInput from '@/components/LogInput';
import HistoryTable from '@/components/HistoryTable';
import CauseInput from '@/components/CauseInput';
import CountermeasureInput from '@/components/CountermeasureInput';
import VisualSheet from '@/components/VisualSheet';
import AIModal from '@/components/AIModal';
import ExportButtons from '@/components/ExportButtons';
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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState<'cause' | 'countermeasure'>('cause');

  // API calls
  const callAPI = async (action: string, data: Record<string, unknown>) => {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    });
    return response.json();
  };

  // Analyze log
  const handleAnalyze = async () => {
    if (!logText.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await callAPI('summarize', { logText });
      if (result.success && Array.isArray(result.data)) {
        const items: HistoryItem[] = result.data.map((item: { date: string; person: string; summary: string; detail: string }, index: number) => ({
          id: `${Date.now()}-${index}`,
          date: item.date || '',
          person: item.person || '',
          summary: item.summary || '',
          detail: item.detail || '',
        }));
        setHistory(items);
      } else {
        alert('分析に失敗しました: ' + (result.error || '不明なエラー'));
      }
    } catch (error) {
      alert('エラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Suggest cause
  const handleSuggestCause = async () => {
    setIsSuggestingCause(true);
    try {
      const result = await callAPI('suggestCause', { history, logText });
      if (result.success) {
        setModalTitle('AI原因分析');
        setModalContent(result.data);
        setModalType('cause');
        setModalOpen(true);
      } else {
        alert('分析に失敗しました: ' + (result.error || '不明なエラー'));
      }
    } catch (error) {
      alert('エラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsSuggestingCause(false);
    }
  };

  // Suggest countermeasure
  const handleSuggestCountermeasure = async () => {
    setIsSuggestingCountermeasure(true);
    try {
      const result = await callAPI('suggestCountermeasure', { history, logText, cause });
      if (result.success) {
        setModalTitle('AI対策提案');
        setModalContent(result.data);
        setModalType('countermeasure');
        setModalOpen(true);
      } else {
        alert('分析に失敗しました: ' + (result.error || '不明なエラー'));
      }
    } catch (error) {
      alert('エラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsSuggestingCountermeasure(false);
    }
  };

  // Generate visual sheet
  const handleGenerateVisual = async () => {
    setIsGeneratingVisual(true);
    try {
      const result = await callAPI('generateVisualSheet', { history, logText, cause, countermeasure });
      if (result.success && typeof result.data === 'object') {
        setVisualSheet(result.data as VisualSheetData);
      } else {
        alert('生成に失敗しました: ' + (result.error || '不明なエラー'));
      }
    } catch (error) {
      alert('エラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsGeneratingVisual(false);
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
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        title={modalTitle}
        content={modalContent}
        type={modalType}
      />
    </div>
  );
}
