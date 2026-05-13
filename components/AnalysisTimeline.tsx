import { FirestoreAnalysis } from "@/types/analysis";
import AnalysisViewer from "./AnalysisViewer";
import CryptoAnalysisViewer from "./CryptoAnalysisViewer";
import ETFAnalysisViewer from "./ETFAnalysisViewer";
import { Trash2 } from "lucide-react";

interface AnalysisTimelineProps {
  analyses: FirestoreAnalysis[];
  onDelete?: (id: string) => void;
}

export default function AnalysisTimeline({ analyses, onDelete }: AnalysisTimelineProps) {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
        <p className="text-gray-400">Aún no hay análisis registrados para este ticker.</p>
      </div>
    );
  }

  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    if (window.confirm("¿Eliminar este análisis? Esta acción no se puede deshacer.")) {
      onDelete?.(id);
    }
  };

  const sortedAnalyses = [...analyses].sort((a, b) => {
    const dateA = a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp);
    const dateB = b.timestamp?.seconds ? new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="relative border-l border-gray-800 ml-4 md:ml-6 pl-6 md:pl-8 space-y-12 pb-12">
      {sortedAnalyses.map((analysis, index) => {
        const dateObj = analysis.timestamp?.seconds ? new Date(analysis.timestamp.seconds * 1000) : new Date(analysis.timestamp);
        const dateStr = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const timeStr = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        const exactDate = `${dateStr} · ${timeStr}`;
        const isCrypto = analysis.tipo_activo === 'cripto' || analysis.analysis_json.tipo_activo === 'cripto';
        const isEtf = analysis.tipo_activo === 'etf' || analysis.analysis_json.tipo_activo === 'etf';

        return (
          <div key={analysis.id || index} className="relative group">
            <button 
              onClick={() => handleDelete(analysis.id)}
              className="absolute -right-2 -top-2 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
              title="Eliminar análisis"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className={cn(
              "absolute -left-[33px] md:-left-[41px] top-6 w-4 h-4 bg-gray-900 border-2 rounded-full z-10",
              isCrypto ? "border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" : 
              isEtf ? "border-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "border-indigo-500"
            )} />
            
            <div className="mb-3">
              <span className={cn(
                "text-sm font-medium px-3 py-1 rounded-full",
                isCrypto ? "text-purple-400 bg-purple-500/10" : 
                isEtf ? "text-sky-400 bg-sky-500/10" : "text-indigo-400 bg-indigo-500/10"
              )}>{exactDate}</span>
            </div>

            {isCrypto ? (
              <CryptoAnalysisViewer analysis={analysis.analysis_json} isExpandedInitial={index === 0} />
            ) : (isEtf ? (
              <ETFAnalysisViewer analysis={analysis.analysis_json} isExpandedInitial={index === 0} />
            ) : (
              <AnalysisViewer analysis={analysis.analysis_json} isExpandedInitial={index === 0} />
            ))}
            
            {analysis.user_notes && (
              <div className="mt-4 bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl">
                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Notas del inversor</span>
                <p className="text-sm text-gray-300 italic">"{analysis.user_notes}"</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
