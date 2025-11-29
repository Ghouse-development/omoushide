'use client';

interface CauseInputProps {
  value: string;
  onChange: (value: string) => void;
  onAIHint: () => void;
  isLoading: boolean;
}

export default function CauseInput({ value, onChange, onAIHint, isLoading }: CauseInputProps) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#d93025]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          原因
          <span className="text-xs font-normal text-gray-500">（手入力 / AIサポートあり）</span>
        </h2>
        <button
          onClick={onAIHint}
          disabled={isLoading}
          className="px-4 py-2 bg-[#fce8e6] text-[#d93025] rounded-lg text-sm font-medium hover:bg-[#f8d7da] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 no-print"
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
              原因AIヒント
            </>
          )}
        </button>
      </div>
      <div className="p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="問題の原因を記入してください。AIヒントボタンで参考にできます。"
          className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#d93025] focus:border-transparent transition-all text-sm"
        />
      </div>
    </section>
  );
}
