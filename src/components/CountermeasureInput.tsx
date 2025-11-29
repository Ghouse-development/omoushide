'use client';

interface CountermeasureInputProps {
  value: string;
  onChange: (value: string) => void;
  onAIHint: () => void;
  onGenerateVisual: () => void;
  isLoading: boolean;
  isGeneratingVisual: boolean;
}

export default function CountermeasureInput({
  value,
  onChange,
  onAIHint,
  onGenerateVisual,
  isLoading,
  isGeneratingVisual,
}: CountermeasureInputProps) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#34a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          対策
          <span className="text-xs font-normal text-gray-500">（手入力 / AIサポートあり）</span>
        </h2>
        <button
          onClick={onAIHint}
          disabled={isLoading}
          className="px-4 py-2 bg-[#e6f4ea] text-[#34a853] rounded-lg text-sm font-medium hover:bg-[#ceead6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 no-print"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              分析中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              対策AIヒント
            </>
          )}
        </button>
      </div>
      <div className="p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="改善対策を記入してください。AIヒントボタンで参考にできます。"
          className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#34a853] focus:border-transparent transition-all text-sm"
        />
        <button
          onClick={onGenerateVisual}
          disabled={isGeneratingVisual}
          className="mt-4 px-6 py-3 bg-[#34a853] text-white rounded-lg font-medium hover:bg-[#2d8e47] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 no-print"
        >
          {isGeneratingVisual ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              生成中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              ビジュアル対策シート生成
            </>
          )}
        </button>
      </div>
    </section>
  );
}
