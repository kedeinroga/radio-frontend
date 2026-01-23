// Mock para componentes de React Native que no deben usarse en Next.js
// Esto previene errores de importación durante el build

declare module '@radio-app/app/components/Button' {
  export const Button: any
}

declare module '@radio-app/app/components/LoadingSpinner' {
  export const LoadingSpinner: any
}

declare module '@radio-app/app/components/EmptyState' {
  export const EmptyState: any
}

declare module '@radio-app/app/components/StationCard' {
  export const StationCard: any
}
