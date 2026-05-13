import { FirestoreAnalysis } from "@/types/analysis";
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Target } from "lucide-react";

interface AccuracyPanelProps {
  analyses: FirestoreAnalysis[];
  currentPrice: number;
}

export default function AccuracyPanel({ analyses, currentPrice }: AccuracyPanelProps) {
  if (!analyses || analyses.length === 0) return null;

  const total = analyses.length;
  
  let bullTheses = 0;
  let correctBull = 0;
  
  let bearTheses = 0;
  let correctBear = 0;

  let bestPerformance = -Infinity;
  let worstPerformance = Infinity;

  analyses.forEach(a => {
    const isBull = a.verdict === "COMPRAR";
    const isBear = a.verdict === "NO INVERTIR";
    const priceChangePct = ((currentPrice - a.price_at_analysis) / a.price_at_analysis) * 100;

    if (isBull) {
      bullTheses++;
      if (priceChangePct > 0) correctBull++;
    }
    
    if (isBear) {
      bearTheses++;
      if (priceChangePct < 0) correctBear++;
    }

    if (priceChangePct > bestPerformance) bestPerformance = priceChangePct;
    if (priceChangePct < worstPerformance) worstPerformance = priceChangePct;
  });

  const bullAccuracy = bullTheses > 0 ? (correctBull / bullTheses) * 100 : 0;
  const bearAccuracy = bearTheses > 0 ? (correctBear / bearTheses) * 100 : 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white">Track Record de Precisión</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Total Análisis</div>
          <div className="text-3xl font-black text-white">{total}</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
            Acierto Alcista <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-black text-white">{bullTheses > 0 ? bullAccuracy.toFixed(0) : '-'}%</div>
            <div className="text-xs text-gray-500 mb-1.5">({correctBull}/{bullTheses})</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
            Acierto Bajista <TrendingDown className="w-3 h-3 text-red-400" />
          </div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-black text-white">{bearTheses > 0 ? bearAccuracy.toFixed(0) : '-'}%</div>
            <div className="text-xs text-gray-500 mb-1.5">({correctBear}/{bearTheses})</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Mejor Tesis</div>
          <div className={`text-3xl font-black ${bestPerformance > 0 ? 'text-emerald-400' : bestPerformance < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {bestPerformance !== -Infinity ? (bestPerformance > 0 ? '+' : '') + bestPerformance.toFixed(1) + '%' : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
