graph TB
  subgraph Frontend (React + TypeScript)
    direction TB
    subgraph Cliente (Browser)
      AppF[App.tsx (React)]
      HeaderF[Header.tsx]
      TabsF[Tabs.tsx]
      PageD[Dashboard.tsx]
      PageT[ToolsPage.tsx]
      PageI[InvestigationsPage.tsx]
      PageH[HistoryPage.tsx]
      ToolListF[ToolList.tsx]
      ToolFormF[ToolForm.tsx]
      InvFormF[InvestigationForm.tsx]
      ResultsF[ResultsDisplay.tsx]
      CompViewF[ComparisonView.tsx]
      HistF[InvestigationHistory.tsx]
    end

    subgraph Estado y Contexto
      ThemeCtx[Theme (dark/light) Context]
      InvCtx[Investigación Actual Context]
    end

    subgraph Estilos y Configuración
      TailwindCSS[Tailwind CSS + index.css]
      TypeDefs[vite-env.d.ts]
    end

    subgraph Bundler & Herramientas de Desarrollo
      ViteF[Vite]
      TSConfigF[tsconfig*.json]
      ESLintF[ESLint]
    end
  end

  subgraph Backend Simulado (Mock/Servicios Locales)
    direction TB
    ToolSvc[toolService.ts (CRUD API)]
    InvSvc[investigationService.ts (Investigar API)]
    MockDB[Mock Data / In-Memory]
  end

  subgraph Utilidades y Lógica Común
    RFStdz[respStandardizer.ts]
    Metrics[comparisionMetrics.ts]
    Formatter[formatter.ts]
    Types[index.ts]
  end

  subgraph Comunicación Cliente–Servidor
    Cliente --> |Llamadas a Servicios| Backend
    Backend --> |API Responses| Cliente
  end

  %% Conexiones Detalladas
  AppF --> HeaderF
  AppF --> TabsF

  TabsF --> PageD
  TabsF --> PageT
  TabsF --> PageI
  TabsF --> PageH

  PageD --> InvFormF
  PageD --> HistF

  PageT --> ToolListF
  PageT --> ToolFormF

  PageI --> ResultsF
  ResultsF --> RFStdz
  PageI --> CompViewF
  CompViewF --> Metrics

  PageH --> HistF

  ToolListF --> ToolSvc
  ToolFormF --> ToolSvc
  InvFormF --> InvSvc

  ToolSvc --> MockDB
  InvSvc --> MockDB

  RFStdz --> Types
  Metrics --> Types
  Formatter --> Types

  ClientCSS[TailwindCSS] -- estilos --> AppF

  ViteF -- bundling --> AppF
  TSConfigF -- compilación TS --> AppF
  ESLintF -- análisis estático --> AppF
