/**
 * Localization helper for NeuroScan AI
 * Supports English (default) and preparation keys for Spanish/German.
 */
export const translations: Record<string, Record<string, string>> = {
  en: {
    dashboardTitle: 'Clinical AI Analytics Dashboard',
    dashboardSub: 'System telemetry, active caseloads, and model accuracy tracking',
    patientName: 'PATIENT FULL NAME',
    patientAge: 'PATIENT AGE',
    patientGender: 'GENDER',
    scanUpload: 'MRI Scan Upload & Verification',
    scanAnalyze: 'Analyze MRI Scan',
    verdictReport: 'Clinical Verdict Report',
    verdictComplete: 'AI Analysis Complete',
    detectionStatus: 'Detection Status',
    tumorClass: 'Tumor Classification',
    confidenceScore: 'Confidence Score',
    needConsult: 'Need a specialist consultation?',
    bookConsult: 'Book Consultation',
    sendReportEmail: 'Send Report by Email',
    systemMonitor: 'Hospital System Monitor',
    serverStatus: 'Server Status',
    cpuUsage: 'CPU Utilization',
    memoryUsage: 'Memory Usage',
    apiStatus: 'Roboflow Workflow API',
    dbStatus: 'Database Registers',
    activeCaseload: 'Live Clinical Activity Feed',
    searchPlaceholder: 'Search by patient name, ID or diagnosis...'
  },
  es: {
    dashboardTitle: 'Panel de Análisis de IA Clínica',
    dashboardSub: 'Telemetría del sistema, casos activos y precisión del modelo',
    patientName: 'NOMBRE COMPLETO DEL PACIENTE',
    patientAge: 'EDAD DEL PACIENTE',
    patientGender: 'GÉNERO',
    scanUpload: 'Carga de Escaneo de RM y Verificación',
    scanAnalyze: 'Analizar Escaneo de RM',
    verdictReport: 'Informe de Veredicto Clínico',
    verdictComplete: 'Análisis de IA Completado',
    detectionStatus: 'Estado de Detección',
    tumorClass: 'Clasificación del Tumor',
    confidenceScore: 'Puntuación de Confianza',
    needConsult: '¿Necesita una consulta con un especialista?',
    bookConsult: 'Reservar Consulta',
    sendReportEmail: 'Enviar Informe por Correo Electrónico',
    systemMonitor: 'Monitor del Sistema del Hospital',
    serverStatus: 'Estado del Servidor',
    cpuUsage: 'Uso de CPU',
    memoryUsage: 'Uso de Memoria',
    apiStatus: 'API de Flujo de Trabajo Roboflow',
    dbStatus: 'Registros de Base de Datos',
    activeCaseload: 'Canal de Actividad Clínica en Vivo',
    searchPlaceholder: 'Buscar por nombre, ID o diagnóstico...'
  }
};

/**
 * Translates a key based on active language identifier
 */
export const t = (key: string, lang = 'en'): string => {
  const selectedLang = translations[lang] ? lang : 'en';
  return translations[selectedLang][key] || translations['en'][key] || key;
};
