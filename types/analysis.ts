export interface AnalysisResult {
  ticker: string;
  tipo_activo?: "accion" | "cripto" | "etf";
  fecha_analisis: string;
  precio_al_momento: number;
  categoria_cripto?: string;
  nombre_fondo?: string; // Nuevo para ETFs
  
  // Stock specific modules
  modulo_1_modelo_negocio?: {
    descripcion: string;
    es_escalable: boolean;
    margen_neto_estimado: string;
  };
  modulo_2_moats?: {
    efecto_red: number;
    costos_cambio: number;
    intangibles: number;
    ventaja_costos: number;
    conclusion_moat: string;
  };
  modulo_2_management?: {
    recompras: string;
    dividendos_vs_reinversion: string;
    adquisiciones: string;
    insiders: string;
    consenso_bancos: string;
    conclusion_management: string;
  };
  modulo_3_metricas?: {
    per: { valor: number; vs_historico: string; conclusion: string };
    ev_ebitda: { valor: number; vs_sector: string; conclusion: string };
    ev_ebit: { valor: number; conclusion: string };
    ev_fcf: { valor: number; conclusion: string };
    roic: { valor: number; vs_wacc: string; conclusion: string };
    net_debt_ebitda: { valor: number; es_sostenible: boolean; conclusion: string };
  };
  modulo_4_catalizadores?: Array<{
    titulo: string;
    descripcion: string;
    plazo_meses: number;
  }>;
  modulo_4_premortem?: string;
  modulo_5_tesis?: {
    veredicto: "COMPRAR" | "MANTENER" | "NO INVERTIR" | string;
    valor_intrinseco_estimado: number;
    margen_seguridad_pct: number;
    precio_entrada_sugerido: number;
    regla_salida: string;
    justificacion: string;
  };
  modulo_6_termometro?: {
    puntuacion: number;
    justificacion_frase_1: string;
    justificacion_frase_2: string;
  };

  // Crypto specific modules
  modulo_1_tesis_narrativa?: {
    que_es: string;
    narrativa_actual: string;
    caso_de_uso_real: string;
  };
  modulo_2_tokenomics?: {
    supply_circulante: string;
    supply_maximo: string;
    inflacion_anual: string;
    concentracion_top10: string;
    modelo_emision: string;
    conclusion: string;
  };
  modulo_3_metricas_onchain?: {
    nvt_ratio: { valor: number | "no_aplica"; interpretacion: string };
    mvrv_ratio: { valor: number | "no_aplica"; interpretacion: string };
    market_cap_tvl: { valor: number | "no_aplica"; interpretacion: string };
    drawdown_ath_pct: number;
    correlacion_btc: number;
  };
  modulo_3_5_ciclo_cripto?: {
    fase_actual: "acumulacion" | "expansion_temprana" | "expansion_tardia" | "euforia" | "distribucion" | "capitulacion" | string;
    meses_desde_ultimo_halving: number;
    meses_hasta_proximo_halving: number;
    patron_historico: string;
    implicancia_para_tesis: string;
  };
  modulo_4_adopcion_red?: {
    direcciones_activas_diarias: string;
    volumen_transacciones: string;
    seguridad_red: string;
    desarrolladores_activos: string;
    conclusion: string;
  };
  modulo_5_sentimiento_institucional?: {
    flujos_etfs: string;
    stablecoin_supply: string;
    funding_rates: string;
    conclusion: string;
  };
  modulo_6_catalizadores_riesgos?: {
    catalizadores: Array<{
      titulo: string;
      descripcion: string;
      plazo_meses: number;
    }>;
    premortem: string;
  };
  modulo_7_tesis?: {
    veredicto: "COMPRAR" | "MANTENER" | "NO INVERTIR" | "ESPECULAR_CON_CAUTELA" | "EVITAR" | string;
    valor_intrinseco_estimado: number;
    margen_seguridad_pct: number;
    precio_entrada_sugerido: number;
    regla_salida: string;
    justificacion: string;
  };
  modulo_8_termometro?: {
    puntuacion: number;
    justificacion_frase_1: string;
    justificacion_frase_2: string;
  };

  // ETF specific modules (Nuevo)
  modulo_1_descripcion?: {
    que_es: string;
    indice_que_replica: string;
    metodologia_replica: "fisica_completa" | "fisica_muestreo" | "sintetica";
    universo_inversion: string;
    numero_posiciones: number;
    top_5_holdings: string[];
  };
  modulo_2_costos?: {
    ter_pct: number;
    tracking_error_pct: number;
    spread_bid_ask: string;
    conclusion_costos: string;
  };
  modulo_3_rendimiento?: {
    retorno_1y_pct: number;
    retorno_3y_anualizado_pct: number;
    retorno_5y_anualizado_pct: number;
    retorno_10y_anualizado_pct: number;
    vs_benchmark: string;
  };
  modulo_4_riesgo?: {
    sharpe_ratio_3y: number;
    volatilidad_anualizada_pct: number;
    max_drawdown_historico_pct: number;
    beta_vs_sp500: number;
    concentracion_top10_pct: number;
  };
  modulo_5_contexto_macro?: {
    entorno_favorable: string;
    entorno_desfavorable: string;
    correlacion_tasas: string;
    momento_macro_actual: string;
  };
  modulo_6_tesis_etf?: { // Cambiado nombre para evitar conflicto
    veredicto: "ACUMULAR" | "MANTENER" | "REDUCIR" | "EVITAR" | string;
    para_que_tipo_de_inversor: string;
    horizonte_recomendado: string;
    precio_entrada_sugerido: number;
    regla_salida: string;
    justificacion: string;
  };
  modulo_7_termometro_etf?: { // Cambiado nombre para evitar conflicto
    puntuacion: number;
    justificacion_frase_1: string;
    justificacion_frase_2: string;
  };
}

export interface FirestoreAnalysis {
  id?: string;
  ticker: string;
  company_name: string;
  timestamp: any; 
  price_at_analysis: number;
  analysis_json: AnalysisResult;
  user_notes: string;
  had_pdf: boolean;
  score: number;
  verdict: string;
  tipo_activo?: "accion" | "cripto" | "etf";
}

export interface FirestoreTicker {
  symbol: string;
  company_name: string;
  sector: string;
  analyses_count: number;
  last_analysis_id: string;
  last_score: number;
  last_verdict: string;
  last_price: number;
  last_analysis_timestamp: any;
  tipo_activo?: "accion" | "cripto" | "etf";
}
