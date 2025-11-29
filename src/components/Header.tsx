'use client';

export default function Header() {
  return (
    <header className="bg-[#1a73e8] text-white shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h1 className="text-xl font-bold">クレーム対応報告書作成ツール</h1>
              <p className="text-sm text-blue-100">AI-Powered Complaint Report Generator</p>
            </div>
          </div>
          <div className="text-sm text-blue-100">
            Powered by Gemini AI
          </div>
        </div>
      </div>
    </header>
  );
}
