# Crypto UI

Interfaz web para la plataforma **Crypto Analysis**. Permite ejecutar backtests, visualizar resultados históricos, analizar indicadores técnicos, explorar operaciones realizadas y gestionar configuraciones reutilizables de estrategias.

La aplicación consume la API desarrollada en FastAPI y proporciona una experiencia visual para la ejecución y análisis de simulaciones de trading.

---

## Tabla de contenidos

* [Qué hace el proyecto](#qué-hace-el-proyecto)
* [Stack tecnológico](#stack-tecnológico)
* [Requisitos](#requisitos)
* [Configuración](#configuración)
* [Instalación](#instalación)
* [Quickstart](#quickstart)
* [Flujo de la aplicación](#flujo-de-la-aplicación)
* [Páginas](#páginas)
* [Componentes](#componentes)
* [Hooks](#hooks)
* [Comunicación con la API](#comunicación-con-la-api)
* [Tipos y modelos](#tipos-y-modelos)
* [Procesamiento de series y gráficos](#procesamiento-de-series-y-gráficos)
* [Estructura del proyecto](#estructura-del-proyecto)

---

# Qué hace el proyecto

La aplicación permite:

1. Ejecutar backtests sobre estrategias almacenadas en el backend.
2. Visualizar métricas de rendimiento.
3. Analizar operaciones realizadas.
4. Explorar alertas generadas durante la simulación.
5. Graficar velas OHLC e indicadores técnicos.
6. Consultar resultados históricos.
7. Guardar configuraciones reutilizables de estrategia.
8. Reutilizar estrategias previamente guardadas.

---

## Capas del frontend

| Capa       | Responsabilidad                    |
| ---------- | ---------------------------------- |
| Pages      | Pantallas principales              |
| Components | Componentes reutilizables          |
| Hooks      | Estado y acceso a datos            |
| API        | Comunicación HTTP                  |
| Types      | Contratos TypeScript               |
| Utils      | Formateo y transformación de datos |
| Config     | Configuración global               |

---

# Stack tecnológico

* React
* TypeScript
* Vite
* Axios
* Lightweight Charts
* CSS

---

# Requisitos

* Node.js 20+
* npm
* Backend Crypto Analysis ejecutándose

---

# Configuración

Crear archivo `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Variables

| Variable     | Descripción        |
| ------------ | ------------------ |
| VITE_API_URL | URL base de la API |

---

# Instalación

```bash
npm install
```

---

# Quickstart

```bash
npm install
npm run dev
```

Servidor local:

```text
http://localhost:5173
```

Build de producción:

```bash
npm run build
```

---

# Flujo de la aplicación

## Ejecución de un backtest

```text
BacktestForm
      │
      ▼
useRunBacktest
      │
      ▼
POST /api/backtests/run
      │
      ▼
BacktestResponse
      │
      ├── BacktestCard
      ├── TradesTable
      ├── AlertsChat
      ├── BacktestChart
      └── SignalsDebugTable
```

## Consulta de backtests históricos

```text
ViewBacktestsPage
      │
      ▼
useListBacktests
      │
      ▼
GET /api/backtests
      │
      ▼
BacktestNavigator
      │
      ▼
Visualización completa
```

## Estrategias guardadas

```text
StrategiesPanel
      │
      ▼
GET /api/strategies
      │
      ▼
Aplicar estrategia
      │
      ▼
BacktestForm
```

---

# Páginas

## RunBacktestPage

Pantalla principal para ejecutar simulaciones.

### Funcionalidades

* Configuración de parámetros.
* Ejecución de backtests.
* Visualización de resultados.
* Guardado de estrategias.

### Componentes utilizados

```text
BacktestForm
BacktestCard
TradesTable
BacktestChart
AlertsChat
SignalsDebugTable
StrategiesPanel
SaveStrategyPrompt
```

---

## ViewBacktestsPage

Pantalla para consultar resultados históricos.

### Funcionalidades

* Navegación entre backtests.
* Consulta de métricas.
* Visualización de operaciones.
* Exploración de alertas.
* Visualización de indicadores.

---

# Componentes

## BacktestForm

Formulario principal de ejecución.

Permite configurar:

* Símbolo
* Intervalo
* Capital inicial
* Apalancamiento
* Filtros EMA
* Filtros ADX
* Parámetros ATR

Responsable de construir el `BacktestRequest`.

---

## BacktestCard

Resumen ejecutivo de resultados.

Muestra:

* Capital inicial
* Capital final
* Retorno total
* Drawdown
* Win rate
* Profit factor
* Configuración utilizada

---

## BacktestChart

Visualización principal de mercado.

Incluye:

* Velas OHLC
* EMA 10
* EMA 55
* ADX
* DI+
* DI-
* Marcadores de entradas y salidas

Consume:

```http
GET /api/backtests/{id}/series
```

---

## TradesTable

Detalle de operaciones ejecutadas.

Columnas:

* Entry
* Exit
* PnL
* Return
* Candles held
* Exit reason

---

## AlertsChat

Representación cronológica de alertas.

Muestra:

* Señales de entrada
* Ejecuciones
* Salidas
* Razones de cierre

---

## BacktestNavigator

Permite navegar entre resultados históricos.

Funciones:

* Selección directa
* Anterior
* Siguiente

---

## SaveStrategyPrompt

Persistencia de configuraciones.

Consume:

```http
POST /api/strategies
```

---

## StrategiesPanel

Listado de estrategias almacenadas.

Permite:

* Aplicar estrategia
* Eliminar estrategia
* Recargar listado

---

## SignalsDebugTable

Vista de depuración de señales.

Incluye:

* EMA10
* EMA55
* Slope
* Gap
* ADX
* DI
* Condiciones evaluadas

---

# Hooks

## useRunBacktest

Gestiona:

```http
POST /api/backtests/run
```

Retorna:

```ts
{
  run,
  get,
  loading,
  error
}
```

---

## useListBacktests

Gestiona:

```http
GET /api/backtests
```

Retorna:

```ts
{
  items,
  loading,
  error,
  refresh
}
```

---

## useBacktestSeries

Obtiene datos de series temporales.

Consume:

```http
GET /api/backtests/{id}/series
```

---

## useStrategies

Carga estrategias guardadas.

Consume:

```http
GET /api/strategies
```

---

# Comunicación con la API

## Backtests

| Método | Endpoint                   |
| ------ | -------------------------- |
| POST   | /api/backtests/run         |
| GET    | /api/backtests             |
| GET    | /api/backtests/{id}        |
| GET    | /api/backtests/{id}/series |

---

## Strategies

| Método | Endpoint             |
| ------ | -------------------- |
| GET    | /api/strategies      |
| GET    | /api/strategies/{id} |
| POST   | /api/strategies      |
| DELETE | /api/strategies/{id} |

---

# Tipos y modelos

## BacktestResponse

Representa el resultado completo de una simulación.

Incluye:

* Métricas agregadas
* Trades
* Configuración
* Alertas
* Timeline de señales
* Marcadores para gráficos

---

## SeriesDataResponse

Payload utilizado para visualización.

Contiene:

* Candles
* EMA snapshots
* ADX snapshots
* Tendencias
* SMI
* Soportes y resistencias

---

## StrategyRecordResponse

Configuración reutilizable de estrategia.

Incluye:

* Nombre
* Descripción
* Symbol
* Interval
* Configuración completa

---

# Procesamiento de series y gráficos

La transformación de datos para Lightweight Charts se realiza en:

```text
src/utils/seriesChart.ts
```

Responsabilidades:

* Conversión de timestamps.
* Construcción de velas.
* Construcción de EMAs.
* Construcción de ADX.
* Construcción de DI.
* Sincronización temporal.
* Generación de marcadores de trades.

Flujo:

```text
SeriesDataResponse
        │
        ▼
buildBacktestChartData()
        │
        ▼
Lightweight Charts
```

---

# Estructura del proyecto

```text
src
├── api
│   ├── backtests.ts
│   └── strategies.ts
│
├── components
│   ├── AlertsChat.tsx
│   ├── BacktestCard.tsx
│   ├── BacktestChart.tsx
│   ├── BacktestForm.tsx
│   ├── BacktestNavigator.tsx
│   ├── SaveStrategyPrompt.tsx
│   ├── SignalsDebugTable.tsx
│   ├── StrategiesPanel.tsx
│   └── TradesTable.tsx
│
├── config
│   └── api.ts
│
├── hooks
│   ├── useBacktests.ts
│   └── useStrategies.ts
│
├── pages
│   ├── RunBacktestPage.tsx
│   └── ViewBacktestsPage.tsx
│
├── types
│   ├── backtesting.ts
│   ├── series.ts
│   └── strategies.ts
│
├── utils
│   ├── format.ts
│   └── seriesChart.ts
│
├── App.tsx
├── main.tsx
└── index.css
```
