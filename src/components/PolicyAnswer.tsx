import React, { useState } from 'react';
import { Copy, Check, BookOpen } from 'lucide-react';

interface PolicyAnswerProps {
  answer: string;
  question: string;
}

export const PolicyAnswer: React.FC<PolicyAnswerProps> = ({ answer, question }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Render markdown-like blocks cleanly without external dependencies
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let isNumbered = false;

    const flushList = () => {
      if (listItems.length > 0) {
        if (isNumbered) {
          elements.push(
            <ol key={`ol-${elements.length}`} className="my-3 list-decimal pl-6 space-y-1.5 text-slate-800 leading-relaxed">
              {listItems.map((item, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="my-3 list-disc pl-6 space-y-1.5 text-slate-800 leading-relaxed">
              {listItems.map((item, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </ul>
          );
        }
        listItems = [];
      }
    };

    const formatInline = (str: string) => {
      return str
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
    };

    lines.forEach((rawLine, index) => {
      const line = rawLine.trim();

      // Heading 3
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={index} className="text-base font-semibold text-[#041E42] mt-4 mb-2">
            {line.replace('### ', '')}
          </h4>
        );
        return;
      }

      // Heading 2
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-serif font-bold text-[#041E42] mt-5 mb-2 border-b border-slate-100 pb-1">
            {line.replace('## ', '')}
          </h3>
        );
        return;
      }

      // Bullet list items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (isNumbered && listItems.length > 0) flushList();
        isNumbered = false;
        listItems.push(line.slice(2));
        return;
      }

      // Numbered list items
      const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        if (!isNumbered && listItems.length > 0) flushList();
        isNumbered = true;
        listItems.push(numberedMatch[2]);
        return;
      }

      // Regular line
      flushList();
      if (line.length > 0) {
        elements.push(
          <p
            key={index}
            className="my-2.5 text-[15px] text-slate-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatInline(line) }}
          />
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200">
      {/* Answer Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/75 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#041E42] text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#041E42] uppercase tracking-wide">
              Official Policy Answer
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-md">
              Inquiry: {question}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy policy answer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Answer</span>
            </>
          )}
        </button>
      </div>

      {/* Answer Body */}
      <div className="px-6 py-5">
        <div className="prose prose-slate max-w-none">
          {renderFormattedText(answer)}
        </div>
      </div>
    </section>
  );
};
