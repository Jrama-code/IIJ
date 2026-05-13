"use client";

import { useState } from "react";
import { Upload, FileText, X, Loader2, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewAnalysisFormProps {
  onAnalyze: (ticker: string, pdfText: string, userNotes: string) => Promise<void>;
  isLoading: boolean;
}

const VALID_CRYPTOS = ['BTC','ETH','SOL','ADA','DOT','AVAX','MATIC','LINK','XRP','DOGE','BNB','LTC','BCH','ATOM','NEAR','ARB','OP','INJ','SUI','APT','TIA','SEI','SHIB','PEPE','WIF'];

export default function NewAnalysisForm({ onAnalyze, isLoading }: NewAnalysisFormProps) {
  const [ticker, setTicker] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [userNotes, setUserNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo no puede pesar más de 10MB.");
      return;
    }

    setError("");
    setPdfFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al procesar el PDF");

      const data = await res.json();
      setPdfText(data.text);
    } catch (err) {
      setError("Error extrayendo texto del PDF. Intenta con otro archivo.");
      setPdfFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setPdfFile(null);
    setPdfText("");
    setError("");
    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const getSuggestion = (t: string) => {
    const suggestions: Record<string, string> = {
      'DODGE': 'DOGE',
      'BITCOI': 'BTC',
      'ETHERIUM': 'ETH',
      'SOLANA': 'SOL',
      'CARDANO': 'ADA',
      'POLKADOT': 'DOT',
      'BITCOIN': 'BTC'
    };
    return suggestions[t] || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = ticker.toUpperCase().trim();
    
    if (!cleanTicker) {
      setError("El ticker es obligatorio.");
      return;
    }

    const isCommonCryptoError = ["DODGE", "ETHERIUM", "BITCOIN", "BITCOI", "SOLANA"].includes(cleanTicker);
    const suggestion = getSuggestion(cleanTicker);

    if (isCommonCryptoError || (cleanTicker.length > 5 && !VALID_CRYPTOS.includes(cleanTicker) && ["BTC", "ETH", "SOL", "DOGE"].some(c => cleanTicker.includes(c)))) {
      setError(`Ticker no reconocido. ${suggestion ? `¿Quisiste decir ${suggestion}?` : ""} Para cripto usá: BTC, ETH, SOL, DOGE...`);
      return;
    }

    setError("");
    try {
      await onAnalyze(cleanTicker, pdfText, userNotes);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="ticker" className="block text-sm font-medium text-gray-300 mb-2">
          Ticker (Símbolo)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            id="ticker"
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value.toUpperCase());
              if (error) setError("");
            }}
            placeholder="ej. AAPL, BTC, SPY, QQQ"
            className="bg-gray-800 border border-gray-700 text-white text-lg rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-4 transition-all uppercase placeholder-gray-500"
            required
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-400 flex items-start gap-2 bg-red-900/10 p-3 rounded-lg border border-red-900/20">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Documento Adicional (Opcional)
        </label>
        {!pdfFile ? (
          <label htmlFor="pdf-upload" className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
            isUploading ? "bg-gray-800 border-indigo-500" : "border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600"
          )}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" /> : <Upload className="w-8 h-8 text-gray-400 mb-3" />}
              <p className="text-sm text-gray-400">{isUploading ? "Procesando PDF..." : "Click para subir o arrastra y suelta"}</p>
            </div>
            <input id="pdf-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} disabled={isLoading || isUploading} />
          </label>
        ) : (
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="w-6 h-6 text-indigo-400 shrink-0" />
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">{pdfFile.name}</p>
                <p className="text-xs text-gray-400">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button type="button" onClick={removeFile} disabled={isLoading} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">Notas del Inversor (Opcional)</label>
        <textarea id="notes" rows={3} value={userNotes} onChange={(e) => setUserNotes(e.target.value)} placeholder="Tu hipótesis inicial..." className="bg-gray-800 border border-gray-700 text-white text-sm rounded-xl block w-full p-4 transition-all" disabled={isLoading} />
      </div>

      <button
        type="submit"
        disabled={isLoading || isUploading || ticker.length === 0}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-lg font-bold transition-all shadow-lg",
          (isLoading || isUploading || ticker.length === 0)
            ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
            : "bg-white text-black hover:bg-gray-200"
        )}
      >
        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analizando...</> : "Analizar con IA"}
      </button>
    </form>
  );
}
