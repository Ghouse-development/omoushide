'use client';

interface LogInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export default function LogInput({ value, onChange, onAnalyze, isLoading }: LogInputProps) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          ログ貼り付け欄
        </h2>
        <p className="text-sm text-gray-500 mt-1">LINE・メール・電話のやり取りを貼り付けてください</p>
      </div>
      <div className="p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={50000}
          placeholder="例：
2024/5/1 10:30 電話
佐藤様から入電。商品がまだ届かないとのこと。
配送状況を確認すると回答。

2024/5/2 14:00 配送業者に確認
大雪の影響で配送が3日遅延しているとのこと。"
          className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent transition-all text-sm"
        />
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>
            {value.length < 10 && value.length > 0 && (
              <span className="text-amber-600">あと{10 - value.length}文字以上入力してください</span>
            )}
          </span>
          <span className={value.length > 45000 ? 'text-amber-600' : ''}>
            {value.length.toLocaleString()} / 50,000文字
          </span>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isLoading || !value.trim()}
          className="mt-4 px-6 py-3 bg-[#1a73e8] text-white rounded-lg font-medium hover:bg-[#1557b0] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              分析中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              経緯を自動書き出し
            </>
          )}
        </button>
      </div>
    </section>
  );
}
