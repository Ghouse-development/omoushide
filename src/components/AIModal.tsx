'use client';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  type: 'cause' | 'countermeasure';
}

export default function AIModal({ isOpen, onClose, title, content, type }: AIModalProps) {
  if (!isOpen) return null;

  const colors = {
    cause: {
      header: 'bg-[#d93025]',
      border: 'border-[#d93025]',
      text: 'text-[#d93025]',
    },
    countermeasure: {
      header: 'bg-[#34a853]',
      border: 'border-[#34a853]',
      text: 'text-[#34a853]',
    },
  };

  const color = colors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className={`${color.header} text-white px-6 py-4 flex items-center justify-between`}>
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className={`border-l-4 ${color.border} pl-4`}>
            <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
              {content}
            </pre>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 ${color.header} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
