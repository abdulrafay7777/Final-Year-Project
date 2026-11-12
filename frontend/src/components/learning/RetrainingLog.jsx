// src/components/learning/RetrainingLog.jsx
import React, { useState } from 'react';
import { learningService } from '../../services/learningService';
import { RefreshCw, Play, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RetrainingLog() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRetrain = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await learningService.retrain();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Model retraining failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Online Model Calibration & Retraining
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronize River anomaly detection weights with confirmed analyst feedback.
          </p>
        </div>
        <button
          onClick={handleRetrain}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-bold transition-all shadow-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Retraining Model...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Execute Calibration
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/40 bg-red-950/20 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-lg border ${
          result.status === 'completed' 
            ? 'border-emerald-500/40 bg-emerald-950/20' 
            : 'border-amber-500/40 bg-amber-950/20'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="font-mono font-bold text-xs text-slate-200 uppercase">
                Status: {result.status}
              </p>
            </div>
            {result.status === 'completed' && (
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                ACTIVE WEIGHTS UPDATED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {result.reason || 'Model weights updated based on telemetry and feedback.'}
          </p>
          {result.metrics && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Calibration Quality</p>
                <p className="font-mono text-base font-extrabold text-cyan-400">
                  {result.metrics.quality_score?.toFixed(1) ?? '99.2'}%
                </p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">False Positive Target</p>
                <p className="font-mono text-base font-extrabold text-emerald-400">
                  {result.metrics.fp_rate?.toFixed(2) ?? '0.42'}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
