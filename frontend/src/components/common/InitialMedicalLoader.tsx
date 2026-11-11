import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

interface InitialMedicalLoaderProps {
  statusMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  onContinueToLogin?: () => void;
}

export const InitialMedicalLoader: React.FC<InitialMedicalLoaderProps> = ({
  statusMessage,
  error = null,
  onRetry,
  onContinueToLogin,
}) => {
  const [stage, setStage] = useState(0);

  const stages = [
    'Initializing MediPriority gateway...',
    'Establishing secure session...',
    'Verifying clinical credentials...',
    'Preparing emergency command center...',
  ];

  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, [error, stages.length]);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4 transition-colors duration-200"
    >
      <div className="w-full max-w-md bg-bg-surface border border-border rounded-2xl shadow-md p-8 flex flex-col items-center text-center">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-text-primary">MediPriority</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-light text-accent-text px-1.5 py-0.5 rounded border border-border">
                PRO
              </span>
            </div>
            <p className="text-xs text-text-muted font-medium">Emergency Decision Support</p>
          </div>
        </div>

        {/* Dynamic ECG Visualizer */}
        <div className="w-full max-w-xs h-16 relative flex items-center justify-center my-2 bg-bg-surface-2 rounded-xl border border-border overflow-hidden px-4">
          <svg
            className="w-full h-12"
            viewBox="0 0 300 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Background grid line */}
            <path
              d="M0 25 H300"
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Stylized clinical ECG waveform */}
            <path
              d="M0 25 L45 25 L55 22 L65 28 L75 25 L85 25 L95 10 L105 40 L115 15 L125 32 L135 25 L180 25 L190 22 L200 28 L210 25 L220 25 L230 10 L240 40 L250 15 L260 32 L270 25 L300 25"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ecg"
            />
          </svg>
        </div>

        {/* Status / Error State */}
        {error ? (
          <div className="mt-4 w-full">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-left text-xs text-critical">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Initialization Interrupted</p>
                <p className="text-text-secondary mt-0.5">{error}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-accent text-white hover:bg-accent-hover text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Gateway
                </button>
              )}
              {onContinueToLogin && (
                <button
                  onClick={onContinueToLogin}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-bg-surface hover:bg-bg-surface-2 text-text-primary text-xs font-semibold transition-colors"
                >
                  Return to Login
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center">
            <p className="text-sm font-semibold text-text-primary">
              {statusMessage || stages[stage]}
            </p>
            <p className="text-xs text-text-muted mt-1">
              MediPriority Central Hospital · Emergency Operations Center
            </p>

            {/* Subtle progress track */}
            <div className="w-48 h-1 bg-border rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
                style={{ width: `${((stage + 1) / stages.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-border w-full flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Stateless JWT & HIPAA compliant encryption active</span>
        </div>
      </div>
    </div>
  );
};

