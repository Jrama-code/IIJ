import { NextRequest } from "next/server";
import { groqClient, SYSTEM_PROMPT, CRYPTO_SYSTEM_PROMPT, ETF_SYSTEM_PROMPT } from "@/lib/gemini";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CRYPTO_MAP: Record<string, string> = {
  "BTC": "bitcoin", "ETH": "ethereum", "SOL": "solana", "ADA": "cardano", "DOT": "polkadot",
  "AVAX": "avalanche-2", "MATIC": "matic-network", "LINK": "chainlink", "XRP": "ripple",
  "DOGE": "dogecoin", "BNB": "binancecoin", "LTC": "litecoin", "BCH": "bitcoin-cash",
  "ATOM": "cosmos", "NEAR": "near", "ARB": "arbitrum", "OP": "optimism", "INJ": "injective-protocol",
  "SUI": "sui", "APT": "aptos", "TIA": "celestia", "SEI": "sei-network", "SHIB": "shiba-inu",
  "PEPE": "pepe", "WIF": "dogwifhat"
};

const ETF_LIST = [
  'SPY','QQQ','IWM','VTI','VOO','VEA','VWO','GLD','SLV','TLT','IEF','HYG','LQD','XLK','XLF',
  'XLE','XLV','XBI','ARKK','ARKG','ARKW','VNQ','SCHD','JEPI','JEPQ','CSPX','IWDA','EIMI','VWRA','VUAA'
];

const getCryptoCategory = (ticker: string): string => {
  const storeOfValue = ["BTC", "LTC", "BCH"];
  const smartContract = ["ETH", "SOL", "AVAX", "ADA", "DOT", "NEAR", "APT", "SUI", "SEI", "BNB"];
  const defiL2 = ["ARB", "OP", "MATIC", "INJ"];
  const infrastructure = ["LINK", "ATOM", "TIA"];
  const memecoins = ["DOGE", "SHIB", "PEPE", "WIF"];

  if (storeOfValue.includes(ticker)) return "Store of Value";
  if (smartContract.includes(ticker)) return "Smart Contract Platform";
  if (defiL2.includes(ticker)) return "DeFi/Layer 2";
  if (infrastructure.includes(ticker)) return "Infrastructure";
  if (memecoins.includes(ticker)) return "Memecoin";
  return "Otros";
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, pdfText, userNotes } = body;

    if (!ticker) {
      return new Response(JSON.stringify({ error: "El ticker es obligatorio." }), { status: 400 });
    }

    const tickerUpper = ticker.toUpperCase().trim();
    const isCrypto = CRYPTO_MAP[tickerUpper] !== undefined;
    const isEtf = ETF_LIST.includes(tickerUpper);
    const currentDate = new Date().toLocaleDateString('es-AR');

    let precioReal = null;
    let realDataMessage = "";
    let cryptoCategory = "";

    if (isCrypto) {
      const coinId = CRYPTO_MAP[tickerUpper];
      cryptoCategory = getCryptoCategory(tickerUpper);
      try {
        const cgRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=true`);
        const cgData = await cgRes.json();
        if (!cgData || cgData.error) return new Response(JSON.stringify({ error: `No se encontraron datos para el token ${tickerUpper}.` }), { status: 404 });
        precioReal = cgData.market_data.current_price.usd;
        
        const lastHalvingDate = new Date('2024-04-19');
        const monthsSinceHalving = Math.floor((Date.now() - lastHalvingDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        realDataMessage = `DATOS CRIPTO REALES (CoinGecko):\n- Precio: $${precioReal}\n- Market Cap: $${(cgData.market_data.market_cap.usd / 1e9).toFixed(2)}B\n- Meses desde Halving: ${monthsSinceHalving}\n`;
      } catch (e) { return new Response(JSON.stringify({ error: "Error CoinGecko" }), { status: 500 }); }
    } else {
      // Stocks or ETFs (Alpha Vantage)
      try {
        const avRes = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${tickerUpper}&apikey=${process.env.ALPHA_VANTAGE_KEY}`);
        const avData = await avRes.json();
        const quote = avData["Global Quote"];
        if (!quote || !quote["05. price"]) return new Response(JSON.stringify({ error: `No encontramos datos para '${tickerUpper}'.` }), { status: 404 });
        precioReal = parseFloat(quote["05. price"]);

        await delay(1200);
        const ovRes = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${tickerUpper}&apikey=${process.env.ALPHA_VANTAGE_KEY}`);
        const overviewData = await ovRes.json();

        realDataMessage = `DATOS REALES (${isEtf ? 'ETF' : 'Acción'}):\n`;
        realDataMessage += `- Nombre: ${overviewData.Name}\n`;
        realDataMessage += `- Precio actual: $${precioReal}\n`;
        if (isEtf) {
          realDataMessage += `- AUM: ${overviewData.MarketCapitalization ? '$' + (parseFloat(overviewData.MarketCapitalization) / 1e9).toFixed(2) + 'B' : 'N/A'}\n`;
          realDataMessage += `- Descripción: ${overviewData.Description}\n`;
        } else {
          realDataMessage += `- Market Cap: $${(parseFloat(overviewData.MarketCapitalization) / 1e9).toFixed(2)}B\n`;
        }
      } catch (e) { return new Response(JSON.stringify({ error: "Error Alpha Vantage" }), { status: 500 }); }
    }

    if (precioReal === null || isNaN(precioReal)) return new Response(JSON.stringify({ error: "Precio inválido." }), { status: 400 });

    let userMessage = `INSTRUCCIÓN: Analizá el activo ${tickerUpper}. Categoría: ${isCrypto ? 'Cripto' : (isEtf ? 'ETF' : 'Acción')}. Fecha: ${currentDate}.\n\n${realDataMessage}\n`;
    if (pdfText) userMessage += `\nContexto PDF:\n${pdfText}\n`;
    if (userNotes) userMessage += `\nNotas: ${userNotes}\n`;

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: isCrypto ? CRYPTO_SYSTEM_PROMPT : (isEtf ? ETF_SYSTEM_PROMPT : SYSTEM_PROMPT) },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      stream: false
    });
    const jsonText = completion.choices[0].message.content;
    return new Response(jsonText, { headers: { "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: "Error interno" }), { status: 500 }); }
}
