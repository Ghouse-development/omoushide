'use client';

import { VisualSheetData } from '@/types';

interface VisualSheetProps {
  data: VisualSheetData;
  reportDate: string;
  reporter: string;
}

const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  '高': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  '中': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '低': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

export default function VisualSheet({ data, reportDate, reporter }: VisualSheetProps) {
  return (
    <div id="visual-sheet" className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden print-break">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a73e8] to-[#4285f4] text-white p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">改善対策ご提案書</h1>
        <p className="text-xl text-blue-100">「{data.title}」</p>
        <p className="text-sm text-blue-200 mt-4">
          作成日: {reportDate} / 報告者: {reporter}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-[#1a73e8] rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-800">経緯サマリー</h2>
          </div>
          <div className="bg-[#e8f0fe] p-4 rounded-lg border border-[#c2d9fc]">
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        </section>

        {/* Cause Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-[#d93025] rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-800">原因分析</h2>
          </div>
          <div className="bg-[#fce8e6] p-4 rounded-lg border border-[#f5c6c2]">
            <div className="flex items-start gap-3">
              <span className="inline-block px-3 py-1 bg-[#d93025] text-white text-sm font-medium rounded-full">
                根本原因
              </span>
              <p className="text-gray-800 font-medium flex-1">{data.rootCause}</p>
            </div>
            <p className="text-gray-600 mt-3 pl-2 border-l-2 border-[#d93025]">{data.causeAnalysis}</p>
          </div>
        </section>

        {/* Countermeasures Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-[#1a73e8] rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-800">改善対策</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.countermeasures.map((cm, index) => {
              const colors = priorityColors[cm.priority] || priorityColors['中'];
              return (
                <div
                  key={index}
                  className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-transform hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${colors.text} px-2 py-1 rounded ${colors.bg} border ${colors.border}`}>
                      優先度: {cm.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{cm.title}</h3>
                  <p className="text-sm text-gray-600">{cm.content}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Expected Effect Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-[#34a853] rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-800">期待効果</h2>
          </div>
          <div className="bg-[#e6f4ea] p-4 rounded-lg border border-[#a8dab5]">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-[#34a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700 leading-relaxed">{data.expectedEffect}</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
          ※本提案書はAIによる自動分析に基づいて作成されています
        </div>
      </div>
    </div>
  );
}
