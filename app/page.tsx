"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { FirestoreTicker } from "@/types/analysis";
import TickerCard from "@/components/TickerCard";

export default function Home() {
  const [tickers, setTickers] = useState<FirestoreTicker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlist() {
      try {
        const stored = localStorage.getItem("analyses");
        if (!stored) {
          setTickers([]);
          setLoading(false);
          return;
        }
        
        const analyses = JSON.parse(stored);
        const tickersMap: Record<string, any> = {};
        
        analyses.forEach((a: any) => {
          const sym = a.ticker;
          if (!tickersMap[sym]) {
             tickersMap[sym] = {
                symbol: sym,
                company_name: a.company_name,
                sector: a.sector || "Unknown",
                analyses_count: 0,
                last_analysis_id: a.id,
                last_score: a.score,
                last_verdict: a.verdict,
                last_price: a.price_at_analysis,
                last_analysis_timestamp: { seconds: Math.floor(a.timestamp / 1000) },
                tipo_activo: a.tipo_activo || "accion"
             };
          }
          tickersMap[sym].analyses_count += 1;
          if (a.timestamp > tickersMap[sym].last_analysis_timestamp.seconds * 1000) {
             tickersMap[sym].last_analysis_timestamp = { seconds: Math.floor(a.timestamp / 1000) };
             tickersMap[sym].last_score = a.score;
             tickersMap[sym].last_verdict = a.verdict;
             tickersMap[sym].last_price = a.price_at_analysis;
             tickersMap[sym].last_analysis_id = a.id;
             tickersMap[sym].tipo_activo = a.tipo_activo || "accion";
          }
        });

        const data = Object.values(tickersMap);
        data.sort((a: any, b: any) => {
          return b.last_analysis_timestamp.seconds - a.last_analysis_timestamp.seconds;
        });
        
        setTickers(data as any);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlist();
  }, []);

  const handleDeleteTicker = (symbol: string) => {
    const stored = localStorage.getItem("analyses");
    if (!stored) return;
    
    const analyses = JSON.parse(stored);
    const updatedAnalyses = analyses.filter((a: any) => a.ticker.toUpperCase() !== symbol.toUpperCase());
    localStorage.setItem("analyses", JSON.stringify(updatedAnalyses));
    
    setTickers(prev => prev.filter(t => t.symbol.toUpperCase() !== symbol.toUpperCase()));
  };

  const filteredTickers = tickers.filter(t => 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-800/50 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tickers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
        <div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white mb-4">
            Investment <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Journal</span>
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto">
            Tu registro personal de decisiones de inversión.
          </p>
        </div>
        
        <Link 
          href="/new" 
          className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 flex items-center gap-3 whitespace-nowrap"
        >
          <Plus className="w-6 h-6" /> Nuevo análisis
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            Investment <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Journal</span>
          </h1>
          <p className="text-gray-400 text-lg">Tu registro personal de decisiones de inversión.</p>
        </div>
        
        <Link 
          href="/new" 
          className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2 whitespace-nowrap w-fit"
        >
          <Plus className="w-5 h-5" /> Nuevo análisis
        </Link>
      </header>

      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por ticker o empresa..."
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 text-white text-lg rounded-2xl focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 p-4 transition-all"
        />
      </div>

      {filteredTickers.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800/50 border-dashed">
          <p className="text-xl text-gray-400 mb-4">No se encontraron activos para tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickers.map((ticker) => (
            <TickerCard key={ticker.symbol} ticker={ticker} onDelete={handleDeleteTicker} />
          ))}
        </div>
      )}
    </div>
  );
}
