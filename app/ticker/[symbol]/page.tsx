"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FirestoreAnalysis, FirestoreTicker } from "@/types/analysis";
import AnalysisTimeline from "@/components/AnalysisTimeline";
import AccuracyPanel from "@/components/AccuracyPanel";

export default function TickerPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  
  const [tickerInfo, setTickerInfo] = useState<FirestoreTicker | null>(null);
  const [analyses, setAnalyses] = useState<FirestoreAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!symbol) return;
      
      try {
        const stored = localStorage.getItem("analyses");
        if (stored) {
          const allAnalyses = JSON.parse(stored);
          const symbolUpper = symbol.toUpperCase();
          const tickerAnalyses = allAnalyses.filter((a: any) => a.ticker.toUpperCase() === symbolUpper);
          
          if (tickerAnalyses.length > 0) {
            // Sort descending by timestamp (newest first)
            tickerAnalyses.sort((a: any, b: any) => b.timestamp - a.timestamp);
            setAnalyses(tickerAnalyses);
            
            const latest = tickerAnalyses[0];
            setTickerInfo({
              symbol: latest.ticker,
              company_name: latest.company_name,
              sector: latest.sector || "Unknown",
              analyses_count: tickerAnalyses.length,
              last_analysis_id: latest.id || "",
              last_score: latest.score,
              last_verdict: latest.verdict,
              last_price: latest.price_at_analysis,
              last_analysis_timestamp: { seconds: Math.floor(latest.timestamp / 1000) }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching ticker data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol]);

  const handleDeleteAnalysis = (id: string) => {
    const stored = localStorage.getItem("analyses");
    if (!stored) return;
    
    const allAnalyses = JSON.parse(stored);
    const updatedAnalyses = allAnalyses.filter((a: any) => a.id !== id);
    localStorage.setItem("analyses", JSON.stringify(updatedAnalyses));
    
    const symbolUpper = symbol.toUpperCase();
    const tickerAnalyses = updatedAnalyses.filter((a: any) => a.ticker.toUpperCase() === symbolUpper);
    setAnalyses(tickerAnalyses);
    
    if (tickerAnalyses.length === 0) {
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-gray-400">Cargando perfil del activo...</p>
      </div>
    );
  }

  const displayName = tickerInfo?.company_name || (analyses.length > 0 ? analyses[0].company_name : symbol);
  const displayPrice = tickerInfo?.last_price || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al Journal
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gray-900/30 p-8 rounded-3xl border border-gray-800">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
            <img 
              src={`https://logo.clearbit.com/${symbol.toLowerCase()}.com`} 
              alt={`${symbol} logo`}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-gray-900 font-bold text-2xl">${symbol[0]}</span>`;
              }}
            />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">{displayName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xl font-bold text-gray-300">{symbol}</span>
              {tickerInfo?.sector && (
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                  {tickerInfo.sector}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-left md:text-right">
          <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Precio Actual</div>
          <div className="text-4xl font-mono font-bold text-white">${displayPrice.toFixed(2)}</div>
        </div>
      </header>

      {analyses.length > 0 && (
        <AccuracyPanel analyses={analyses} currentPrice={displayPrice} />
      )}

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-white mb-8">Historial de Análisis</h2>
        <AnalysisTimeline analyses={analyses} onDelete={handleDeleteAnalysis} />
      </div>
    </div>
  );
}
