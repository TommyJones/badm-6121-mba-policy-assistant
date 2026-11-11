import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, AlertCircle, Hash } from 'lucide-react';
import type { PolicySourceChunk } from '../../server.ts';

interface PolicySourcesProps {
  sources: PolicySourceChunk[];
}

export const PolicySources: React.FC<PolicySourcesProps> = ({ sources }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  // If there are no grounding chunks, show exact prompt requirement:
  // "No policy passages were retrieved for this question."
  if (!sources || sources.length === 0) {
    return (
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-serif font-bold text-[#041E42] mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          Sources
        </h3>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-sm">
          <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <p className="font-medium text-slate-700">
            No policy passages were retrieved for this question.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50/75 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-[#041E42] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#041E42] uppercase tracking-wide">
              Sources
            </h3>
            <p className="text-xs text-slate-500">
              {sources.length} {sources.length === 1 ? 'policy passage cited' : 'policy passages cited'} from grounding metadata
            </p>
          </div>
        </div>
      </div>

      {/* Sources list */}
      <div className="p-6 divide-y divide-slate-100 space-y-5">
        {sources.map((source, index) => {
          const isExpanded = expandedIndex === index;
          const hasMore = source.fullText && source.fullText.length > 300;

          return (
            <article
              key={index}
              className={`${index > 0 ? 'pt-5' : ''} space-y-2`}
            >
              {/* Source Title & Page Number */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#041E42] bg-slate-100 px-2 py-0.5 rounded">
                    Source #{index + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {source.title || 'Georgetown MBA Policy'}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md tabular-nums font-mono">
                  <Hash className="w-3 h-3 text-slate-400" />
                  <span>
                    {source.pageNumber !== null && source.pageNumber !== undefined
                      ? `Page ${source.pageNumber}`
                      : 'Page N/A'}
                  </span>
                </div>
              </div>

              {/* 300-character snippet */}
              <div className="bg-slate-50/60 rounded-lg p-3.5 border border-slate-200/70 text-sm text-slate-800 leading-relaxed font-sans">
                <p className="text-slate-800 whitespace-pre-wrap">
                  {isExpanded && hasMore ? source.fullText : source.textSnippet}
                  {!isExpanded && hasMore && (
                    <span className="text-slate-400 select-none">...</span>
                  )}
                </p>

                {hasMore && (
                  <button
                    onClick={() => toggleExpand(index)}
                    className="mt-2 text-xs font-medium text-[#041E42] hover:text-[#0d346c] inline-flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Show first 300 characters</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>View full passage ({source.fullText.length} characters)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
