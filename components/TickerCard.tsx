import Link from "next/link";
import { FirestoreTicker } from "@/types/analysis";
import Thermometer from "./Thermometer";
import { Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TickerCardProps {
  ticker: FirestoreTicker;
  onDelete?: (symbol: string) => void;
}

export default function TickerCard({ ticker, onDelete }: TickerCardProps) {
  const isCrypto = ticker.tipo_activo === 'cripto';
  const isEtf = ticker.tipo_activo === 'etf';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`¿Eliminar todos los análisis de ${ticker.symbol}?`)) {
      onDelete?.(ticker.symbol);
    }
  };

  return (
    <div className="relative group">
      <button 
        onClick={handleDelete}
        className="absolute right-3 top-3 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
        title="Eliminar ticker completo"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <Link href={`/ticker/${ticker.symbol}`}>
        <div className={cn(
          "bg-gray-900/50 backdrop-blur-xl border rounded-2xl p-5 hover:border-opacity-100 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer relative overflow-hidden",
          isCrypto 
            ? "border-purple-500/30 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
            : isEtf
            ? "border-sky-500/30 hover:border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.05)]"
            : "border-gray-800 hover:border-gray-600"
        )}>
          {(isCrypto || isEtf) && (
            <div className="absolute top-0 right-0 p-1">
               <div className={cn(
                 "text-[9px] text-white px-2 py-0.5 rounded-bl-lg font-black uppercase",
                 isCrypto ? "bg-purple-600" : "bg-sky-600"
               )}>
                 {isCrypto ? "Cripto" : "ETF"}
               </div>
            </div>
          )}

          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0",
                isCrypto && "border-2 border-purple-500/50",
                isEtf && "border-2 border-sky-500/50"
              )}>
                <img 
                  src={isCrypto 
                    ? `https://static.coingecko.com/s/coin_logos/bitcoin.png` 
                    : `https://logo.clearbit.com/${ticker.symbol.toLowerCase()}.com`
                  } 
                  alt={`${ticker.symbol} logo`}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-gray-900 font-bold">${ticker.symbol[0]}</span>`;
                  }}
                />
              </div>
              <div>
                <h3 className={cn(
                  "text-xl font-bold tracking-tight",
                  isCrypto ? "text-purple-100" : isEtf ? "text-sky-100" : "text-white"
                )}>{ticker.symbol}</h3>
                <p className="text-sm text-gray-400 line-clamp-1">{ticker.company_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 bg-gray-800/80 px-2.5 py-1 rounded-full text-xs font-medium text-gray-300">
              <Clock className="w-3 h-3" />
              <span>{ticker.analyses_count} an.</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Veredicto</span>
              <div className={cn(
                "px-3 py-1 rounded-md text-sm font-bold w-fit",
                (ticker.last_verdict === "COMPRAR" || ticker.last_verdict === "ACUMULAR") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                ticker.last_verdict === "MANTENER" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : 
                "bg-red-500/10 text-red-400 border border-red-500/20"
              )}>
                {ticker.last_verdict}
              </div>
            </div>
            
            <Thermometer score={ticker.last_score} showLabel={true} className="scale-75 origin-right translate-y-2" />
          </div>
        </div>
      </Link>
    </div>
  );
}
