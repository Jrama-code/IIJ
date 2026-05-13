# Investment Journal AI

Una aplicación web funcional y lista para producción, que actúa como un journal personal de análisis de inversiones potenciado por Inteligencia Artificial (Claude 3.5 Sonnet).

## Características

- **Watchlist (Home)**: Grilla de todos tus activos analizados con sus veredictos, puntajes semánticos, y delta de precisión.
- **Ticker Page**: Historial cronológico de todos los análisis para un ticker, con un panel de "Track Record" que calcula tu precisión alcista y bajista basado en precios en tiempo real.
- **Nuevo Análisis**:
  - Obtención automática de métricas (Precio, P/E, EV/EBITDA, Market Cap) usando `yahoo-finance2`.
  - Carga opcional de PDFs (10-K, 10-Q) para mayor contexto (soporta hasta 10MB).
  - Integración en tiempo real (SSE streaming) con Anthropic Claude para ejecutar un prompt detallado basado en Graham y Munger.
- **Base de Datos**: Todo se guarda de forma persistente en Firebase Firestore.

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Next.js API Routes (Node.js).
- **Database**: Firebase Firestore.
- **IA**: Anthropic SDK (Claude 3.5 Sonnet).
- **Datos Financieros**: `yahoo-finance2` (NPM).

## Instalación y Ejecución

1. Clona el repositorio e instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
Renombra o copia el archivo `.env.local.example` (si existe) a `.env.local` y completa los valores:
```env
ANTHROPIC_API_KEY=tu_api_key_de_anthropic

NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre `http://localhost:3000` en tu navegador.

## Configuración de Firebase

1. Ve a la consola de Firebase y crea un nuevo proyecto.
2. Añade una aplicación web para obtener tus credenciales (`firebaseConfig`).
3. En el menú lateral, ve a "Firestore Database" y crea la base de datos (puedes empezar en modo prueba para facilitar el desarrollo local).
4. La aplicación creará automáticamente las colecciones `analyses` y `tickers`.

## Despliegue en Vercel o Firebase Hosting

Esta app está diseñada para funcionar sin problemas en Vercel. 
- Sube tu código a GitHub y conéctalo en Vercel.
- Asegúrate de cargar todas tus variables de entorno en la configuración de Vercel.
- Las API Routes funcionarán como Serverless Functions.
