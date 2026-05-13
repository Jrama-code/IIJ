import { useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import { ChevronDown, ChevronUp, Zap, Coins, Globe, Users, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Thermometer from "./Thermometer";

interface CryptoAnalysisViewerProps {
  analysis: AnalysisResult;
  isExpandedInitial?: boolean;
}

export default function CryptoAnalysisViewer({ analysis, isExpandedInitial = false }: CryptoAnalysisViewerProps) {
  const [isExpanded, setIsExpanded] = useState(isExpandedInitial);

  if (!analysis) return null;

  const isMemecoin = analysis.categoria_cripto === "Memecoin";
  const marketCapTvlValue = analysis.modulo_3_metricas_onchain?.market_cap_tvl?.valor;
  const showMarketCapTvl = marketCapTvlValue !== "no_aplica" && typeof marketCapTvlValue === "number" && marketCapTvlValue < 1000;

  const cycleFases = [
    { id: "acumulacion", label: "Acumulación" },
    { id: "expansion_temprana", label: "Expansión Temprana" },
    { id: "expansion_tardia", label: "Expansión Tardía" },
    { id: "euforia", label: "Euforia" },
    { id: "distribucion", label: "Distribución" },
    { id: "capitulacion", label: "Capitulación" }
  ];

  const currentFaseId = analysis.modulo_3_5_ciclo_cripto?.fase_actual || "";

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between bg-purple-900/10 hover:bg-purple-900/20 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white flex items-center gap-2">
              {analysis.ticker} Analysis 
              <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                {analysis.categoria_cripto || "CRIPTO"}
              </span>
            </span>
            <span className="text-sm text-gray-400">{analysis.fecha_analisis}</span>
          </div>
          <div className={cn(
              "px-3 py-1 rounded-md text-sm font-bold ml-4",
              analysis.modulo_7_tesis?.veredicto === "COMPRAR" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
              analysis.modulo_7_tesis?.veredicto === "MANTENER" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : 
              analysis.modulo_7_tesis?.veredicto === "ESPECULAR_CON_CAUTELA" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
              "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              {analysis.modulo_7_tesis?.veredicto || "PENDIENTE"}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-purple-900/30 space-y-8 text-gray-300">
              {/* Header Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-purple-900/5 p-4 rounded-xl border border-purple-500/20">
                <div>
                  <div className="text-xs text-purple-400 uppercase font-bold mb-1">Precio</div>
                  <div className="text-xl font-bold text-white">${analysis.precio_al_momento}</div>
                </div>
                <div>
                  <div className="text-xs text-purple-400 uppercase font-bold mb-1">Target</div>
                  <div className="text-xl font-bold text-emerald-400">
                    {isMemecoin ? "Sin valor intrínseco" : `$${analysis.modulo_7_tesis?.valor_intrinseco_estimado || 0}`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-purple-400 uppercase font-bold mb-1">Upside Est.</div>
                  <div className="text-xl font-bold text-white">
                    {isMemecoin ? "Especulativo" : `${analysis.modulo_7_tesis?.margen_seguridad_pct || 0}%`}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Thermometer score={analysis.modulo_8_termometro?.puntuacion || 0} showLabel={false} className="scale-75 origin-top-right translate-y-[-10px]" />
                </div>
              </div>

              {/* Modulo Ciclo Cripto */}
              {analysis.modulo_3_5_ciclo_cripto && (
                <section className="bg-gray-800/20 p-5 rounded-2xl border border-gray-800">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-indigo-400" /> Análisis de Ciclo
                  </h3>
                  
                  <div className="relative mb-8 px-2">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2" />
                    <div className="relative flex justify-between">
                      {cycleFases.map((fase) => {
                        const isActive = fase.id === currentFaseId;
                        return (
                          <div key={fase.id} className="flex flex-col items-center gap-2 z-10">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 transition-all duration-500",
                              isActive ? "bg-purple-500 border-purple-400 scale-125 shadow-[0_0_10px_rgba(168,85,247,0.8)]" : "bg-gray-900 border-gray-700"
                            )} />
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-tighter text-center max-w-[60px] leading-none",
                              isActive ? "text-purple-400" : "text-gray-600"
                            )}>{fase.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between text-xs text-gray-500">
                          <span>Último Halving</span>
                          <span className="text-indigo-300 font-mono">{analysis.modulo_3_5_ciclo_cripto.meses_desde_ultimo_halving} meses</span>
                       </div>
                       <div className="flex justify-between text-xs text-gray-500">
                          <span>Próximo Halving</span>
                          <span className="text-indigo-300 font-mono">~{analysis.modulo_3_5_ciclo_cripto.meses_hasta_proximo_halving} meses</span>
                       </div>
                    </div>
                    <p className="text-sm italic text-gray-400 border-l border-gray-700 pl-3">
                      {analysis.modulo_3_5_ciclo_cripto.implicancia_para_tesis}
                    </p>
                  </div>
                </section>
              )}

              {/* Modulo 1: Narrativa */}
              <section className="border-l-2 border-purple-500 pl-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-purple-400" /> 1. Tesis Narrativa
                </h3>
                <p className="text-white font-medium mb-1">{analysis.modulo_1_tesis_narrativa?.que_es}</p>
                <div className="bg-purple-900/10 p-3 rounded-lg border border-purple-500/10 mt-2">
                  <p className="text-sm">{analysis.modulo_1_tesis_narrativa?.caso_de_uso_real}</p>
                </div>
              </section>

              {/* Modulo 3: On-Chain */}
              <section>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-yellow-400" /> 3. Métricas Adaptativas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {showMarketCapTvl && (
                     <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 border-b-blue-500/50">
                        <div className="text-xs text-gray-500 mb-1">Market Cap / TVL</div>
                        <div className="text-xl font-bold text-white">{marketCapTvlValue}x</div>
                     </div>
                   )}
                   <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 border-b-purple-500/50">
                      <div className="text-xs text-gray-500 mb-1">MVRV Ratio</div>
                      <div className="text-xl font-bold text-white">
                        {analysis.modulo_3_metricas_onchain?.mvrv_ratio?.valor === "no_aplica" ? "N/A" : analysis.modulo_3_metricas_onchain?.mvrv_ratio?.valor}
                      </div>
                   </div>
                   <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 border-b-red-500/50">
                      <div className="text-xs text-gray-500 mb-1">Drawdown desde ATH</div>
                      <div className="text-xl font-bold text-red-400">{analysis.modulo_3_metricas_onchain?.drawdown_ath_pct}%</div>
                   </div>
                </div>
              </section>

              {/* Modulo 7: Tesis Final (Crypto Style) */}
              <section className="relative p-6 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
                <div className="absolute inset-0 border border-white/10 rounded-2xl" />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">Tesis Final Crypto</h3>
                  
                  {isMemecoin && (
                    <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex items-center gap-2 text-yellow-200 text-xs font-bold uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      Activo especulativo — sin análisis fundamental aplicable. Decisión basada únicamente en momentum.
                    </div>
                  )}

                  <p className="text-gray-100 leading-relaxed text-lg mb-6">{analysis.modulo_7_tesis?.justificacion}</p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                    <div>
                      <span className="text-xs text-purple-300 uppercase font-black block mb-1">Precio Entrada</span>
                      <span className="text-xl font-mono text-white">
                        ${analysis.modulo_7_tesis?.precio_entrada_sugerido} 
                        {isMemecoin && <span className="text-[10px] block text-purple-400 italic">confirmar momentum</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-pink-300 uppercase font-black block mb-1">Regla de Salida</span>
                      <span className="text-sm text-gray-300 block">{analysis.modulo_7_tesis?.regla_salida}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer phrase */}
              <section className="text-center italic text-purple-400/60 py-4 border-t border-purple-900/30">
                <p>"{analysis.modulo_8_termometro?.justificacion_frase_1}"</p>
              </section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
