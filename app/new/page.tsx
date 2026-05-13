"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import NewAnalysisForm from "@/components/NewAnalysisForm";
import { AnalysisResult } from "@/types/analysis";
import AnalysisViewer from "@/components/AnalysisViewer";
import CryptoAnalysisViewer from "@/components/CryptoAnalysisViewer";
import ETFAnalysisViewer from "@/components/ETFAnalysisViewer";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamData, setStreamData] = useState("");
  const [currentStep, setCurrentStep] = useState<string>("");
  const [completedAnalysis, setCompletedAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (ticker: string, pdfText: string, userNotes: string) => {
    setIsAnalyzing(true);
    setStreamData("");
    setCompletedAnalysis(null);
    setCurrentStep("Obteniendo datos del mercado...");

    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, pdfText, userNotes }),
      });

      if (!analyzeRes.ok) {
        const errorData = await analyzeRes.json();
        throw new Error(errorData.error || "Falló el análisis con IA.");
      }

      if (!analyzeRes.body) throw new Error("No se recibió respuesta del servidor.");

      setCurrentStep("Analizando con IA (esto puede tomar 1-2 minutos)...");

      const reader = analyzeRes.body.getReader();
      const decoder = new TextDecoder();
      let fullJsonString = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullJsonString += chunk;
        setStreamData(fullJsonString);
      }

      setCurrentStep("Guardando resultados localmente...");
      
      const jsonMatch = fullJsonString.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("La IA no devolvió un formato JSON válido.");
      }
      
      const analysisJson: AnalysisResult = JSON.parse(jsonMatch[0]);
      const tipo = analysisJson.tipo_activo || "accion";
      
      const stored = localStorage.getItem("analyses");
      const analyses = stored ? JSON.parse(stored) : [];
      
      const newAnalysis = {
        id: "local_" + Date.now().toString(),
        ticker: analysisJson.ticker,
        company_name: analysisJson.nombre_fondo || analysisJson.ticker,
        sector: tipo === 'cripto' ? 'Cripto' : (tipo === 'etf' ? 'ETF' : 'Acción'),
        timestamp: Date.now(),
        price_at_analysis: analysisJson.precio_al_momento,
        analysis_json: analysisJson,
        user_notes: userNotes,
        had_pdf: !!pdfText,
        score: tipo === 'cripto' ? analysisJson.modulo_8_termometro?.puntuacion : (tipo === 'etf' ? analysisJson.modulo_7_termometro_etf?.puntuacion : analysisJson.modulo_6_termometro?.puntuacion),
        verdict: tipo === 'cripto' ? analysisJson.modulo_7_tesis?.veredicto : (tipo === 'etf' ? analysisJson.modulo_6_tesis_etf?.veredicto : analysisJson.modulo_5_tesis?.veredicto),
        tipo_activo: tipo
      };
      
      analyses.push(newAnalysis);
      localStorage.setItem("analyses", JSON.stringify(analyses));
      
      setCurrentStep("¡Análisis completado!");
      setIsAnalyzing(false);
      setCompletedAnalysis(analysisJson);

    } catch (error: any) {
      console.error(error);
      setIsAnalyzing(false);
      setCurrentStep("");
      throw error;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-3xl font-black text-white mb-2">Nuevo Análisis</h1>
        <p className="text-gray-400 text-lg">Inicia una evaluación profunda con el rigor de Graham y Munger.</p>
      </div>

      {!completedAnalysis && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <NewAnalysisForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse" />
            <h3 className="text-xl font-bold text-white">{currentStep}</h3>
          </div>
          <div className="bg-black/50 rounded-xl p-4 font-mono text-sm text-gray-400 h-64 overflow-y-auto whitespace-pre-wrap border border-gray-800/50">
            {streamData || "Conectando con Gemini..."}
          </div>
        </div>
      )}

      {completedAnalysis && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
          <div className="flex justify-end">
            <Link 
              href={`/ticker/${completedAnalysis.ticker}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
            >
              Ver perfil histórico de {completedAnalysis.ticker} →
            </Link>
          </div>
          {completedAnalysis.tipo_activo === 'cripto' ? (
            <CryptoAnalysisViewer analysis={completedAnalysis} isExpandedInitial={true} />
          ) : (completedAnalysis.tipo_activo === 'etf' ? (
            <ETFAnalysisViewer analysis={completedAnalysis} isExpandedInitial={true} />
          ) : (
            <AnalysisViewer analysis={completedAnalysis} isExpandedInitial={true} />
          ))}
        </div>
      )}
    </div>
  );
}
