import { useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import { ChevronDown, ChevronUp, AlertTriangle, TrendingUp, ShieldCheck, Activity, Target, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Thermometer from "./Thermometer";

interface AnalysisViewerProps {
  analysis: AnalysisResult;
  isExpandedInitial?: boolean;
}

export default function AnalysisViewer({ analysis, isExpandedInitial = false }: AnalysisViewerProps) {
  const [isExpanded, setIsExpanded] = useState(isExpandedInitial);

  if (!analysis) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white">{analysis.ticker} Analysis</span>
            <span className="text-sm text-gray-400">{analysis.fecha_analisis}</span>
          </div>
          <div className={cn(
              "px-3 py-1 rounded-md text-sm font-bold ml-4",
              analysis.modulo_5_tesis?.veredicto === "COMPRAR" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
              analysis.modulo_5_tesis?.veredicto === "MANTENER" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : 
              "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              {analysis.modulo_5_tesis?.veredicto || "PENDIENTE"}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-gray-800 space-y-8 text-gray-300">
              {/* Header Info */}
              <div className="flex justify-between items-start bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Precio Actual</div>
                    <div className="text-xl font-bold text-white">${analysis.precio_al_momento}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Valor Intrínseco</div>
                    <div className="text-xl font-bold text-emerald-400">${analysis.modulo_5_tesis?.valor_intrinseco_estimado || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Margen Seguridad</div>
                    <div className="text-xl font-bold text-white">{analysis.modulo_5_tesis?.margen_seguridad_pct || 0}%</div>
                  </div>
                  <div className="flex justify-end">
                    <Thermometer score={analysis.modulo_6_termometro?.puntuacion || 0} showLabel={false} className="scale-75 origin-top-right translate-y-[-10px]" />
                  </div>
                </div>
              </div>

              {/* Modulo 1: Negocio */}
              {analysis.modulo_1_modelo_negocio ? (
                <section>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-blue-400" /> 1. Modelo de Negocio
                  </h3>
                  <p className="leading-relaxed mb-3">{analysis.modulo_1_modelo_negocio.descripcion}</p>
                  <div className="flex gap-4">
                    <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">Escalable: <span className="text-white font-medium">{analysis.modulo_1_modelo_negocio.es_escalable ? "Sí" : "No"}</span></span>
                    <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">Margen Est.: <span className="text-white font-medium">{analysis.modulo_1_modelo_negocio.margen_neto_estimado}</span></span>
                  </div>
                </section>
              ) : (
                <div className="text-xs text-gray-600 italic">Módulo de negocio no disponible en este análisis legacy.</div>
              )}

              {/* Modulo 2: Moats */}
              {analysis.modulo_2_moats ? (
                <section>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" /> 2. Fosos Económicos (Moats)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Object.entries({
                      "Efecto Red": analysis.modulo_2_moats.efecto_red,
                      "Costos Cambio": analysis.modulo_2_moats.costos_cambio,
                      "Intangibles": analysis.modulo_2_moats.intangibles,
                      "Ventaja Costos": analysis.modulo_2_moats.ventaja_costos
                    }).map(([key, val]) => (
                      <div key={key} className="bg-gray-800/40 p-3 rounded-lg text-center border border-gray-700/50">
                        <div className="text-xs text-gray-400 mb-1">{key}</div>
                        <div className="text-xl font-bold text-white">{val}/10</div>
                      </div>
                    ))}
                  </div>
                  <p className="leading-relaxed text-sm italic border-l-2 border-indigo-500 pl-3">{analysis.modulo_2_moats.conclusion_moat}</p>
                </section>
              ) : (
                <div className="text-xs text-gray-600 italic">Módulo de moats no disponible en este análisis legacy.</div>
              )}

              {/* Modulo 2.5: Management & Insiders */}
              {analysis.modulo_2_management ? (
                <section>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-400" /> 🏦 Management & Insiders
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Recompras</div>
                      <div className="text-sm text-gray-300 leading-snug">{analysis.modulo_2_management.recompras || "N/A"}</div>
                    </div>
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Dividendos</div>
                      <div className="text-sm text-gray-300 leading-snug">{analysis.modulo_2_management.dividendos_vs_reinversion || "N/A"}</div>
                    </div>
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Adquisiciones</div>
                      <div className="text-sm text-gray-300 leading-snug">{analysis.modulo_2_management.adquisiciones || "N/A"}</div>
                    </div>
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Insiders</div>
                      <div className="text-sm text-gray-300 leading-snug">{analysis.modulo_2_management.insiders || "N/A"}</div>
                    </div>
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Consenso Bancos</div>
                      <div className="text-sm text-gray-300 leading-snug">{analysis.modulo_2_management.consenso_bancos || "N/A"}</div>
                    </div>
                    <div className="bg-purple-900/10 p-3 rounded-lg border border-purple-500/20">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">Conclusión</div>
                      <div className="text-sm text-purple-100 leading-snug italic">{analysis.modulo_2_management.conclusion_management || "N/A"}</div>
                    </div>
                  </div>
                </section>
              ) : null}

              {/* Modulo 3: Metricas */}
              {analysis.modulo_3_metricas ? (
                <section>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-amber-400" /> 3. Métricas Financieras
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "PER", data: analysis.modulo_3_metricas.per },
                      { label: "EV/EBITDA", data: analysis.modulo_3_metricas.ev_ebitda },
                      { label: "EV/EBIT", data: analysis.modulo_3_metricas.ev_ebit },
                      { label: "EV/FCF", data: analysis.modulo_3_metricas.ev_fcf },
                      { label: "ROIC", data: analysis.modulo_3_metricas.roic },
                      { label: "Net Debt/EBITDA", data: analysis.modulo_3_metricas.net_debt_ebitda }
                    ].map((m, i) => (
                      <div key={i} className="bg-gray-800/20 p-3 rounded-lg border border-gray-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white">{m.label}</span>
                          <span className="font-mono text-amber-400">{m.data?.valor || 0}</span>
                        </div>
                        <p className="text-sm text-gray-400">{m.data?.conclusion || "No disponible"}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="text-xs text-gray-600 italic">Métricas financieras no disponibles en este análisis legacy.</div>
              )}

              {/* Modulo 4: Catalizadores y Premortem */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.modulo_4_catalizadores ? (
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-emerald-400" /> Catalizadores
                    </h3>
                    <div className="space-y-3">
                      {analysis.modulo_4_catalizadores.map((cat, i) => (
                        <div key={i} className="bg-emerald-900/10 border border-emerald-900/30 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-emerald-300">{cat.titulo}</span>
                            <span className="text-xs bg-emerald-900/50 text-emerald-200 px-2 py-0.5 rounded-full">{cat.plazo_meses}m</span>
                          </div>
                          <p className="text-sm text-gray-400">{cat.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 italic pt-8">Catalizadores no disponibles.</div>
                )}
                
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" /> Pre-Mortem
                  </h3>
                  <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl text-red-200 text-sm leading-relaxed h-full min-h-[100px]">
                    {analysis.modulo_4_premortem || "Análisis pre-mortem no disponible."}
                  </div>
                </div>
              </section>

              {/* Modulo 5: Tesis */}
              {analysis.modulo_5_tesis ? (
                <section className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">Tesis Final</h3>
                  <div className="mb-4">
                    <span className="text-sm text-gray-400 uppercase tracking-wider block mb-1">Justificación</span>
                    <p className="text-gray-200 leading-relaxed text-lg">{analysis.modulo_5_tesis.justificacion}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Precio Entrada Sugerido</span>
                      <span className="text-lg font-mono text-white">${analysis.modulo_5_tesis.precio_entrada_sugerido}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Regla de Salida</span>
                      <span className="text-sm text-gray-300 block">{analysis.modulo_5_tesis.regla_salida}</span>
                    </div>
                  </div>
                </section>
              ) : (
                <div className="text-xs text-gray-600 italic text-center py-4">Tesis final no disponible en este análisis legacy.</div>
              )}

              {/* Justificaciones Termometro */}
              {analysis.modulo_6_termometro && (
                <section className="text-center italic text-gray-400 py-4 border-t border-gray-800">
                  <p>"{analysis.modulo_6_termometro.justificacion_frase_1}"</p>
                  <p>"{analysis.modulo_6_termometro.justificacion_frase_2}"</p>
                </section>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
