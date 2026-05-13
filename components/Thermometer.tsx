import { cn } from "@/lib/utils";

interface ThermometerProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

export default function Thermometer({ score, className, showLabel = true }: ThermometerProps) {
  // Normalización del valor: si el valor es mayor a 10, asumir que viene en escala 0-100 y convertir a 1-10
  const normalizedScore = score > 10 ? Math.round(score / 10) : score;

  // 1-3 -> rojo, 4-6 -> amarillo, 7-8 -> verde, 9-10 -> verde oscuro
  let colorClass = "";
  let bgColorClass = "";
  let label = "";

  if (normalizedScore >= 9) {
    colorClass = "bg-emerald-600";
    bgColorClass = "bg-emerald-600/20";
    label = "Excelente";
  } else if (normalizedScore >= 7) {
    colorClass = "bg-green-500";
    bgColorClass = "bg-green-500/20";
    label = "Bueno";
  } else if (normalizedScore >= 4) {
    colorClass = "bg-yellow-500";
    bgColorClass = "bg-yellow-500/20";
    label = "Regular";
  } else {
    colorClass = "bg-red-500";
    bgColorClass = "bg-red-500/20";
    label = "Peligro";
  }

  const heightPercent = `${Math.min(100, Math.max(0, normalizedScore * 10))}%`;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative w-4 h-24 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
        <div 
          className={cn("absolute bottom-0 w-full transition-all duration-1000 ease-out rounded-full", colorClass)} 
          style={{ height: heightPercent }}
        />
      </div>
      {showLabel && (
        <div className="text-center">
          <div className="text-xl font-bold text-white">{normalizedScore}</div>
          <div className={cn("text-xs font-medium px-2 py-0.5 rounded-full mt-1", bgColorClass, colorClass.replace('bg-', 'text-'))}>
            {label}
          </div>
        </div>
      )}
    </div>
  );
}
