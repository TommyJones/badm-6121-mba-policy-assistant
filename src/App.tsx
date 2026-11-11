import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { PolicyAnswer } from './components/PolicyAnswer.tsx';
import { PolicySources } from './components/PolicySources.tsx';
import type { PolicySourceChunk, PolicyAskResponse } from '../server.ts';

const SAMPLE_QUESTIONS = [
  'What is the minimum GPA required for good academic standing in the MBA program?',
  'What is the attendance policy for required MBA core courses?',
  'What is the policy and timeline for requesting a formal leave of absence?',
  'What are the requirements to qualify for academic honors at graduation?',
  'How does the MBA Honor Council handle reported academic integrity violations?',
];

export default function App() {
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<PolicySourceChunk[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToAsk = (customQuery !== undefined ? customQuery : question).trim();

    if (!queryToAsk) return;

    setLoading(true);
    setError(null);
    setSubmittedQuestion(queryToAsk);

    try {
      const response = await fetch('/api/policy/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: queryToAsk }),
      });

      const data: PolicyAskResponse & { error?: string } = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to retrieve policy response from Gemini.');
      }

      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err: any) {
      console.error('Error asking policy question:', err);
      setError(
        err?.message ||
          'Unable to reach Georgetown MBA Policy Assistant. Please check your network or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleQuery: string) => {
    setQuestion(sampleQuery);
    handleSubmit(undefined, sampleQuery);
  };

  const handleClear = () => {
    setQuestion('');
    setAnswer(null);
    setSources(null);
    setError(null);
    setSubmittedQuestion('');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1F2C] flex flex-col font-sans selection:bg-[#041E42] selection:text-white">
      {/* Top Bar Contract (1 row, 3 zones: brand wordmark - nav link - action) */}
      <header className="sticky top-0 z-30 bg-[#041E42] text-white border-b border-[#0d346c] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <a
              href="/"
              className="text-lg font-serif font-bold tracking-tight text-white whitespace-nowrap"
            >
              MBA Policy Assistant
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <span className="text-xs uppercase tracking-wider text-slate-300 font-sans">
              Georgetown University · McDonough School of Business
            </span>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {(answer || error) && (
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Inquiry</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Academic Header Hero */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#041E42] bg-slate-200/60 px-3 py-1 rounded-full">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Student Handbook Policy Grounding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#041E42] tracking-tight">
            Georgetown MBA Policy Assistant
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Ask any question regarding Georgetown MBA academic standing, core attendance, grading,
            leaves of absence, and graduation policies. Answers are strictly grounded in official
            handbook passages.
          </p>
        </section>

        {/* Question Form */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 transition-all duration-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="policy-question-input"
              className="block text-sm font-semibold text-[#041E42]"
            >
              Ask a Policy Question
            </label>

            <div className="relative">
              <input
                id="policy-question-input"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What is the minimum GPA required for good academic standing?"
                disabled={loading}
                className="w-full pl-4 pr-24 py-3.5 text-sm sm:text-base bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#041E42]/20 focus:border-[#041E42] transition-colors placeholder:text-slate-400 text-slate-900 disabled:opacity-60"
              />

              <div className="absolute right-2 top-2 bottom-2 flex items-center">
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="h-full px-5 inline-flex items-center justify-center gap-1.5 font-medium text-sm text-white bg-[#041E42] hover:bg-[#0a2f64] active:bg-[#021227] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all duration-150 whitespace-nowrap cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span>Ask</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick-test sample prompts */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#041E42]" />
                <span>Suggested Georgetown MBA policy topics:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((sampleQuery, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSampleClick(sampleQuery)}
                    disabled={loading}
                    className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors disabled:opacity-50"
                  >
                    {sampleQuery}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </section>

        {/* Error notification */}
        {error && (
          <div className="p-5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-sm flex items-start gap-3.5 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-semibold text-amber-950">Unable to retrieve policy guidance</p>
                <p className="text-amber-800 mt-0.5">{error}</p>
              </div>

              {error.toLowerCase().includes('permission') && (
                <div className="text-xs bg-amber-100/70 p-3 rounded-lg border border-amber-200/60 text-amber-900 space-y-1">
                  <p className="font-medium">Why am I seeing this?</p>
                  <p>
                    The File Search store <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono text-[11px]">fileSearchStores/mbapolicies-ldjpw9byydqw</code> requires the Google Cloud project API key used to create it. Please open the <strong>Settings &gt; Secrets</strong> panel in the AI Studio header to select or verify your billing-enabled API key.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSubmit(undefined, submittedQuestion || question)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-950 bg-amber-200/60 hover:bg-amber-200 border border-amber-300 rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Question</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <section className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-[#041E42]">
              <div className="w-6 h-6 border-2 border-[#041E42]/20 border-t-[#041E42] rounded-full animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-semibold text-[#041E42]">
                Consulting Georgetown MBA Policy Store...
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Gemini 3.5 Flash is executing semantic fileSearch across the official Georgetown MBA
                handbook.
              </p>
            </div>
          </section>
        )}

        {/* Answer and Sources Results Display */}
        {!loading && answer && (
          <div className="space-y-6">
            {/* Answer component */}
            <PolicyAnswer answer={answer} question={submittedQuestion} />

            {/* Sources component (Required: below the answer) */}
            {sources !== null && <PolicySources sources={sources} />}
          </div>
        )}

        {/* Zero state / Policy guidance tips */}
        {!loading && !answer && !error && (
          <section className="border border-slate-200/80 bg-white/70 rounded-xl p-6 sm:p-8 space-y-4 text-slate-600 text-sm">
            <div className="flex items-center gap-2 text-[#041E42] font-semibold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>How MBA Policy Assistant Works</span>
            </div>
            <p className="leading-relaxed">
              This assistant utilizes Gemini 3.5 Flash connected directly to the Georgetown MBA
              policy semantic store. In accordance with program governance:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 pt-1">
              <li className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700">
                  <strong>Strict Grounding:</strong> Answers are drawn solely from retrieved
                  policy passages.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700">
                  <strong>Explicit Coverage:</strong> If a policy does not cover your question, the
                  system states so plainly.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700">
                  <strong>Citation Audit:</strong> Each retrieved passage chunk lists document
                  title, page number, and excerpt.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700">
                  <strong>Verified Accuracy:</strong> Eliminates hallucinations by citing specific
                  handbook pages.
                </span>
              </li>
            </ul>
          </section>
        )}
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">
            Georgetown University · McDonough School of Business
          </p>
          <p>MBA Policy Assistant · Powered by Gemini 3.5 Flash & File Search Grounding</p>
        </div>
      </footer>
    </div>
  );
}
