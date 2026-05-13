import { useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import { ChevronDown, ChevronUp, PieChart, DollarSign, BarChart3, ShieldAlert, Globe, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Thermometer from "./Thermometer";

interface ETFAnalysisViewerProps {
  analysis: AnalysisResult;
  isExpandedInitial?: boolean;
}

export default function ETFAnalysisViewer({ analysis, isExpandedInitial = false }: ETFAnalysisViewerProps) {
  const [isExpanded, setIsExpanded] = useState(isExpandedInitial);

  if (!analysis) return null;

  const getTERColor = (ter: number) => {
    if (ter < 0.10) return "text-emerald-400";
    if (ter <= 0.50) return "text-yellow-400";
    return "text-red-400";
  };

  const replicaLabels: Record<string, string> = {
    "fisica_completa": "Física Completa",
    "fisica_muestreo": "Física Muestreo",
    "sintetica": "Sintética"
  };

  return (
    <div className="bg-gray-900 border border-sky-500/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between bg-sky-900/10 hover:bg-sky-900/20 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white flex items-center gap-2">
              {analysis.nombre_fondo || `${analysis.ticker} ETF`}
              <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">ETF</span>
            </span>
            <span className="text-sm text-gray-400">{analysis.ticker} · {analysis.fecha_analisis}</span>
          </div>
          <div className={cn(
              "px-3 py-1 rounded-md text-sm font-bold ml-4",
              analysis.modulo_6_tesis_etf?.veredicto === "ACUMULAR" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
              analysis.modulo_6_tesis_etf?.veredicto === "MANTENER" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : 
              analysis.modulo_6_tesis_etf?.veredicto === "REDUCIR" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
              "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              {analysis.modulo_6_tesis_etf?.veredicto || "PENDIENTE"}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-sky-400" /> : <ChevronDown className="w-5 h-5 text-sky-400" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-sky-900/30 space-y-8 text-gray-300">
              {/* Header Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-sky-900/5 p-4 rounded-xl border border-sky-500/20">
                <div>
                  <div className="text-xs text-sky-400 uppercase font-bold mb-1">Precio</div>
                  <div className="text-xl font-bold text-white">${analysis.precio_al_momento}</div>
                </div>
                <div>
                  <div className="text-xs text-sky-400 uppercase font-bold mb-1">TER (Gastos)</div>
                  <div className={cn("text-xl font-bold", getTERColor(analysis.modulo_2_costos?.ter_pct || 0))}>
                    {analysis.modulo_2_costos?.ter_pct}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-sky-400 uppercase font-bold mb-1">Sharpe Ratio</div>
                  <div className="text-xl font-bold text-white">{analysis.modulo_4_riesgo?.sharpe_ratio_3y}</div>
                </div>
                <div className="flex justify-end">
                  <Thermometer score={analysis.modulo_7_termometro_etf?.puntuacion || 0} showLabel={false} className="scale-75 origin-top-right translate-y-[-10px]" />
                </div>
              </div>

              {/* Modulo 1: Descripción */}
              <section>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-sky-400" /> 1. Descripción del Fondo
                </h3>
                <p className="text-gray-300 mb-4">{analysis.modulo_1_descripcion?.que_es}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Índice</span>
                      <span className="text-white font-medium">{analysis.modulo_1_descripcion?.indice_que_replica}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Metodología</span>
                      <span className="bg-sky-900/40 text-sky-300 px-2 py-0.5 rounded text-xs font-bold uppercase">
                        {replicaLabels[analysis.modulo_1_descripcion?.metodologia_replica || ""] || "Desconocida"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-800/40 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 font-bold block mb-2 uppercase">Top 5 Holdings</span>
                    <ul className="text-xs space-y-1">
                      {analysis.modulo_1_descripcion?.top_5_holdings?.map((h, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300">
                          <span className="w-1 h-1 bg-sky-500 rounded-full" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Modulo 3: Rendimiento */}
              <section>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-emerald-400" /> 2. Rendimiento Histórico
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: "1 Año", val: analysis.modulo_3_rendimiento?.retorno_1y_pct },
                    { label: "3 Años (An.)", val: analysis.modulo_3_rendimiento?.retorno_3y_anualizado_pct },
                    { label: "5 Años (An.)", val: analysis.modulo_3_rendimiento?.retorno_5y_anualizado_pct },
                    { label: "10 Años (An.)", val: analysis.modulo_3_rendimiento?.retorno_10y_anualizado_pct }
                  ].map((r, i) => (
                    <div key={i} className="bg-gray-800/20 p-3 rounded-xl border border-gray-800 text-center">
                      <div className="text-xs text-gray-500 mb-1">{r.label}</div>
                      <div className={cn("text-lg font-mono font-bold", (r.val || 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {r.val}%
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 italic text-center">"{analysis.modulo_3_rendimiento?.vs_benchmark}"</p>
              </section>

              {/* Modulo 4: Riesgo */}
              <section>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-orange-400" /> 3. Perfil de Riesgo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 border-b-orange-500/50">
                      <div className="text-xs text-gray-500 mb-1">Volatilidad Anual</div>
                      <div className="text-xl font-bold text-white">{analysis.modulo_4_riesgo?.volatilidad_anualizada_pct}%</div>
                   </div>
                   <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 border-b-red-500/50">
                      <div className="text-xs text-gray-500 mb-1">Max Drawdown</div>
                      <div className="text-xl font-bold text-red-400">{analysis.modulo_4_riesgo?.max_drawdown_historico_pct}%</div>
                   </div>
                   <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 border-b-sky-500/50">
                      <div className="text-xs text-gray-500 mb-1">Beta vs S&P500</div>
                      <div className="text-xl font-bold text-white">{analysis.modulo_4_riesgo?.beta_vs_sp500}</div>
                   </div>
                </div>
              </section>

              {/* Modulo 5: Contexto Macro */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-emerald-900/5 p-4 rounded-2xl border border-emerald-500/10">
                    <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 text-sm uppercase">Entorno Favorable</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{analysis.modulo_5_contexto_macro?.entorno_favorable}</p>
                 </div>
                 <div className="bg-red-900/5 p-4 rounded-2xl border border-red-500/10">
                    <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2 text-sm uppercase">Entorno Desfavorable</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{analysis.modulo_5_contexto_macro?.entorno_desfavorable}</p>
                 </div>
              </section>

              {/* Modulo 6: Tesis Final ETF */}
              <section className="relative p-6 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 to-cyan-600/20" />
                <div className="absolute inset-0 border border-white/10 rounded-2xl" />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">Tesis Final ETF</h3>
                  <div className="mb-4">
                    <span className="text-xs text-sky-300 uppercase font-black block mb-1">Perfil Inversor</span>
                    <p className="text-white font-medium">{analysis.modulo_6_tesis_etf?.para_que_tipo_de_inversor}</p>
                  </div>
                  <p className="text-gray-100 leading-relaxed text-lg mb-6">{analysis.modulo_6_tesis_etf?.justificacion}</p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                    <div>
                      <span className="text-xs text-sky-300 uppercase font-black block mb-1">Entrada Sugerida</span>
                      <span className="text-xl font-mono text-white">${analysis.modulo_6_tesis_etf?.precio_entrada_sugerido}</span>
                    </div>
                    <div>
                      <span className="text-xs text-cyan-300 uppercase font-black block mb-1">Horizonte</span>
                      <span className="text-sm text-gray-300 block">{analysis.modulo_6_tesis_etf?.horizonte_recomendado}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer phrase */}
              <section className="text-center italic text-sky-400/60 py-4 border-t border-sky-900/30">
                <p>"{analysis.modulo_7_termometro_etf?.justificacion_frase_1}"</p>
              </section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
