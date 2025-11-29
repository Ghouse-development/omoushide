'use client';

import { HistoryItem } from '@/types';

interface HistoryTableProps {
  history: HistoryItem[];
  onUpdate: (id: string, field: keyof HistoryItem, value: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function HistoryTable({ history, onUpdate, onDelete, onAdd }: HistoryTableProps) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          経緯（自動生成）
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#e8f0fe]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-28">日時</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-24">相手</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-48">経緯（要約）</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">詳細</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16 no-print">操作</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  ログを貼り付けて「経緯を自動書き出し」ボタンを押してください
                </td>
              </tr>
            ) : (
              history.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={item.date}
                      onChange={(e) => onUpdate(item.id, 'date', e.target.value)}
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-[#1a73e8] rounded transition-colors"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={item.person}
                      onChange={(e) => onUpdate(item.id, 'person', e.target.value)}
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-[#1a73e8] rounded transition-colors"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={item.summary}
                      onChange={(e) => onUpdate(item.id, 'summary', e.target.value)}
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-[#1a73e8] rounded transition-colors"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={item.detail}
                      onChange={(e) => onUpdate(item.id, 'detail', e.target.value)}
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-[#1a73e8] rounded transition-colors"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-100 text-center no-print">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="削除"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-200 no-print">
        <button
          onClick={onAdd}
          className="text-[#1a73e8] hover:text-[#1557b0] font-medium flex items-center gap-1 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          行を追加
        </button>
      </div>
    </section>
  );
}
