import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Mail, Search, CheckCircle2, AlertCircle, Send, 
  User, Bot, Shield, ArrowRight, RefreshCw, ChevronRight,
  Database, Cpu, MessageSquare, History, ExternalLink,
  LifeBuoy, Edit3, Trash2, MailQuestion
} from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";

// Zalando Modern Theme Colors
const ZALANDO_ORANGE = "#FF6900";
const ZALANDO_BG = "#F5F5F5";
const ZALANDO_TEXT = "#000000";

// Mock Data
const MOCK_ORDERS = {
  "ZAL-123456": { id: "ZAL-123456", customer: "Elena Martínez", status: "Entregado", items: ["Zapatillas Gazelle", "Sudadera Oversize"], date: "2024-03-15" },
  "ZAL-654321": { id: "ZAL-654321", customer: "Marc Soler", status: "En tránsito", items: ["Vaqueros Slim", "Cinturón de cuero"], date: "2024-03-18" },
  "ZAL-987654": { id: "ZAL-987654", customer: "Sara Gomis", status: "Pendiente", items: ["Vestido Midi", "Bolso Bandolera"], date: "2024-03-20" },
};

const EMAIL_POOLS = [
  [
    { id: "eml_1", subject: "Devolución pedido ZAL-123456", sender: "elena.m@email.com", body: "Hola, me gustaría devolver las zapatillas Gazelle que recibí ayer. No me terminan de convencer el color. ¿Cómo lo hago?" },
    { id: "eml_2", subject: "Cambio de talla ZAL-654321", sender: "marc.soler@email.com", body: "Buenos días, recibí los vaqueros pero la talla 42 me queda pequeña. ¿Podríais cambiarlos por una 44? El pedido es el ZAL-654321." },
    { id: "eml_3", subject: "Retraso en entrega", sender: "pablo.ruiz@email.com", body: "Mi pedido ZAL-999999 aún no ha llegado y ponía que llegaba hoy. ¿Podéis revisarlo?" }
  ],
  [
    { id: "eml_4", subject: "Error en facturación ZAL-987654", sender: "sara.g@email.com", body: "Se me ha cobrado dos veces el mismo pedido ZAL-987654. Por favor, devolvedme el dinero de uno de los cargos." },
    { id: "eml_5", subject: "Consulta pedido", sender: "lucia.fer@email.com", body: "Hola, no encuentro el número de pedido pero compré ayer una chaqueta amarilla. Quería saber si ya ha salido del almacén." },
    { id: "eml_6", subject: "Artículo defectuoso ZAL-123456", sender: "elena.m@email.com", body: "A parte de la devolución, he visto que la sudadera tiene un pequeño descosido. ¿Qué procede en este caso?" }
  ]
];

interface LogEntry {
  timestamp: string;
  source: "SISTEMA" | "IA" | "VALIDACIÓN" | "MANUAL" | "ESCALACIÓN";
  message: string;
}

interface ExtractionResult {
  category: string;
  orderId: string;
  confidence: number;
  summary: string;
  missingInfo: string[];
}

export const ZalandoAssistant = ({ onClose }: { onClose: () => void }) => {
  const [inbox, setInbox] = useState(EMAIL_POOLS[0]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [manualOrderId, setManualOrderId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelStatus, setModelStatus] = useState("Listo (Gemini 3 Flash)");
  const [finalRoute, setFinalRoute] = useState<string | null>(null);

  const addLog = (source: LogEntry["source"], message: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      source,
      message
    }]);
  };

  const reloadInbox = () => {
    const nextPool = EMAIL_POOLS[Math.floor(Math.random() * EMAIL_POOLS.length)];
    setInbox(nextPool);
    addLog("SISTEMA", "Bandeja de entrada recargada aleatoriamente.");
  };

  const startProcess = async (email: any) => {
    setSelectedEmail(email);
    setCurrentStep(1);
    setExtraction(null);
    setValidationError(null);
    setManualOrderId("");
    setFinalRoute(null);
    setLogs([]);
    addLog("SISTEMA", `Iniciando proceso para: ${email.subject}`);
    
    await runAIAnalysis(email.body);
  };

  const runAIAnalysis = async (content: string, isDeepScan = false) => {
    setIsProcessing(true);
    setCurrentStep(1);
    addLog("IA", isDeepScan ? "Ejecutando Escaneo Profundo..." : "Analizando email con PNL...");

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Analiza el siguiente email de soporte de Zalando y extrae datos. 
        Devuelve estrictamente un JSON con este formato:
        {
          "category": "devoluciones" | "cambios" | "pagos" | "retrasos" | "otros",
          "orderId": "ZAL-XXXXXX" (si se encuentra, sino cadena vacía),
          "confidence": numero entre 0-1,
          "summary": "resumen corto en español",
          "missingInfo": ["lista de datos faltantes si hay"]
        }
        
        Email: ${content}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              orderId: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              missingInfo: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["category", "orderId", "confidence", "summary", "missingInfo"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setExtraction(result);
      addLog("IA", `Clasificación: ${result.category.toUpperCase()} (Confianza: ${result.confidence})`);
      
      setCurrentStep(2);
      validateProcess(result.orderId, result);
    } catch (error) {
      addLog("IA", "Error en el procesamiento de IA.");
      setValidationError("IA_UNAVAILABLE");
    } finally {
      setIsProcessing(false);
    }
  };

  const validateProcess = (orderId: string, result: ExtractionResult) => {
    setIsValidating(true);
    addLog("VALIDACIÓN", `Validando ID: ${orderId || "VACIÓ"}`);

    // Regex Check
    const zalandoRegex = /^ZAL-\d{6}$/;
    if (!orderId) {
      setValidationError("NO_ID_DETECTED");
      addLog("VALIDACIÓN", "Error: No se detectó ID de pedido.");
    } else if (!zalandoRegex.test(orderId)) {
      setValidationError("INVALID_FORMAT");
      addLog("VALIDACIÓN", "Error: Formato de ID inválido (debe ser ZAL-XXXXXX).");
    } else if (!(MOCK_ORDERS as any)[orderId]) {
      setValidationError("ORDER_NOT_FOUND");
      addLog("VALIDACIÓN", "Error: Pedido no encontrado en base de datos OMS.");
    } else {
      setValidationError(null);
      addLog("VALIDACIÓN", "ID validado correctamente en OMS.");
    }

    setIsValidating(false);
    setCurrentStep(3);

    // Final Routing logic
    determineRoute(orderId, result);
  };

  const determineRoute = (orderId: string, result: ExtractionResult) => {
    setCurrentStep(4);
    const zalandoRegex = /^ZAL-\d{6}$/;
    const validId = zalandoRegex.test(orderId) && (MOCK_ORDERS as any)[orderId];

    if (result.confidence > 0.8 && validId) {
      setFinalRoute("RUTA A: Auto-resolución");
      addLog("SISTEMA", "Ruta A activada: Alta confianza y ID válido. Ejecutando flujo automático.");
    } else if (!validId) {
      setFinalRoute("RUTA B: Requiere Corrección");
      addLog("SISTEMA", "Ruta B activada: Error en validación de ID.");
    } else {
      setFinalRoute("RUTA C: Escalar a Humano");
      addLog("ESCALACIÓN", "Ruta C activada: Confianza baja o ambigüedad detectada.");
    }
  };

  const handleManualCorrection = () => {
    addLog("MANUAL", `Corrección manual aplicada: ${manualOrderId}`);
    if (extraction) {
      const updated = { ...extraction, orderId: manualOrderId };
      setExtraction(updated);
      validateProcess(manualOrderId, updated);
    }
  };

  const reset = () => {
    setSelectedEmail(null);
    setCurrentStep(0);
    setExtraction(null);
    setLogs([]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-6"
    >
      <div className="bg-[#F5F5F5] w-full max-w-7xl h-full md:h-[90vh] rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans text-black">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center bg-white shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FF6900] flex items-center justify-center rounded-lg shadow-inner">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline font-black text-xl tracking-tight leading-none uppercase italic">ZALANDO OPS CENTRAL</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{modelStatus}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="flex flex-grow overflow-hidden">
          {/* Sidebar: Inbox */}
          <aside className="w-80 border-r bg-white flex flex-col shrink-0">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.2em] opacity-40">Bandeja Central</h2>
              <button onClick={reloadInbox} className="p-2 hover:bg-[#FF6900]/10 text-[#FF6900] rounded-full transition-colors" title="Recarga Aleatoria">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <AnimatePresence>
                {inbox.map((email) => (
                  <motion.button
                    key={email.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => startProcess(email)}
                    className={`w-full text-left p-6 border-b hover:bg-[#F5F5F5] transition-colors relative group ${selectedEmail?.id === email.id ? 'bg-[#FF6900]/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest opacity-20">{email.id}</span>
                      <Mail className={`w-4 h-4 ${selectedEmail?.id === email.id ? 'text-[#FF6900]' : 'opacity-20'}`} />
                    </div>
                    <h3 className="font-bold text-sm mb-1 truncate group-hover:text-[#FF6900] transition-colors">{email.sender}</h3>
                    <p className="text-[11px] font-medium opacity-60 truncate mb-2">{email.subject}</p>
                    <p className="text-[10px] opacity-40 line-clamp-2 leading-relaxed">{email.body}</p>
                    {selectedEmail?.id === email.id && (
                      <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6900]" />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </aside>

          {/* Main Stage */}
          <main className="flex-grow flex flex-col bg-[#F5F5F5] overflow-hidden relative">
            <div className="p-8 flex-grow overflow-y-auto space-y-8 scroll-smooth pb-32">
              {!selectedEmail ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <MailQuestion className="w-20 h-20" />
                  <div>
                    <h3 className="font-headline font-black text-xl uppercase italic">Esperando selección</h3>
                    <p className="font-sans text-xs uppercase tracking-widest">Elige un email para iniciar el triaje</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-8 pb-10">
                  {/* Step Visualization */}
                  <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                    {[
                      { icon: MessageSquare, label: "NLP Ingesta" },
                      { icon: Cpu, label: "Extracción" },
                      { icon: Database, label: "Validación OMS" },
                      { icon: ArrowRight, label: "Enrutamiento" }
                    ].map((step, i) => (
                      <div key={i} className={`flex items-center gap-4 ${i < 3 ? 'flex-grow' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentStep > i ? 'bg-[#FF6900] text-white' : currentStep === i ? 'bg-[#FF6900]/20 text-[#FF6900] border-2 border-[#FF6900]' : 'bg-gray-100 text-gray-300'}`}>
                          {currentStep > i ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                        </div>
                        {i < 3 && <div className={`flex-grow h-[2px] mx-2 ${currentStep > i ? 'bg-[#FF6900]' : 'bg-gray-100'}`} />}
                      </div>
                    ))}
                  </div>

                  {/* Flow Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Extraction Card */}
                    <AnimatePresence mode="wait">
                      {extraction && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 space-y-6"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-sans text-[10px] uppercase tracking-widest text-[#FF6900] font-bold">Paso 02</span>
                              <h3 className="font-headline font-black text-xl uppercase italic">Extracción Inteligente</h3>
                            </div>
                            <div className="p-3 bg-[#FF6900]/10 rounded-2xl">
                              <Cpu className="text-[#FF6900] w-6 h-6" />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] uppercase opacity-40 font-bold block mb-1">Categoría Detectada</span>
                              <div className="bg-gray-50 p-3 rounded-xl font-bold uppercase text-xs border">{extraction.category}</div>
                            </div>
                            
                            <div>
                              <span className="text-[10px] uppercase opacity-40 font-bold block mb-1">ID de Pedido</span>
                              <div className="relative group">
                                <input 
                                  value={manualOrderId || extraction.orderId}
                                  onChange={(e) => setManualOrderId(e.target.value)}
                                  className={`w-full bg-gray-50 p-3 rounded-xl font-mono text-sm border focus:ring-2 focus:ring-[#FF6900] focus:outline-none transition-all ${validationError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                  placeholder="ZAL-XXXXXX"
                                />
                                {validationError && (
                                  <div className="mt-2 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase">
                                    <AlertCircle className="w-3 h-3" />
                                    {validationError === "INVALID_FORMAT" ? "Formato Incorrecto" : validationError === "ORDER_NOT_FOUND" ? "No en OMS" : "No detectado"}
                                  </div>
                                )}
                              </div>
                            </div>

                            {validationError && (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <button onClick={handleManualCorrection} className="flex-grow bg-black text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-gray-800">
                                    Corregir Manualmente
                                  </button>
                                </div>
                                <button 
                                  onClick={() => runAIAnalysis(selectedEmail.body, true)} 
                                  className="w-full flex items-center justify-center gap-2 p-3 bg-[#FF6900]/5 text-[#FF6900] rounded-xl hover:bg-[#FF6900]/10 border border-[#FF6900]/20 text-[9px] font-black uppercase tracking-tighter"
                                >
                                  <Search className="w-4 h-4" />
                                  Ejecutar Escaneo Profundo (Último Recurso)
                                </button>
                              </div>
                            )}

                            <div>
                              <span className="text-[10px] uppercase opacity-40 font-bold block mb-1">Resumen AI</span>
                              <p className="text-xs leading-relaxed italic opacity-80">{extraction.summary}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Validation Card */}
                    <AnimatePresence mode="wait">
                      {(currentStep >= 3 && extraction) && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 space-y-6"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-sans text-[10px] uppercase tracking-widest text-[#FF6900] font-bold">Paso 03</span>
                              <h3 className="font-headline font-black text-xl uppercase italic">Validación OMS</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-2xl">
                              <Database className="text-blue-600 w-6 h-6" />
                            </div>
                          </div>

                          {validationError === null && (MOCK_ORDERS as any)[extraction.orderId] ? (
                            <div className="space-y-6">
                              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-4">
                                <CheckCircle2 className="text-green-600 w-6 h-6" />
                                <div>
                                  <p className="text-[10px] font-black uppercase text-green-700">Pedido Verificado</p>
                                  <p className="text-sm font-bold">{(MOCK_ORDERS as any)[extraction.orderId].customer}</p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between text-[11px]">
                                  <span className="opacity-40 uppercase font-black">Estado</span>
                                  <span className="font-bold">{(MOCK_ORDERS as any)[extraction.orderId].status}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="opacity-40 uppercase font-black">Últ. Artículo</span>
                                  <span className="font-bold">{(MOCK_ORDERS as any)[extraction.orderId].items[0]}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-center space-y-4 opacity-20 italic">
                               <Shield className="w-12 h-12" />
                               <p className="text-[10px] uppercase tracking-widest font-black">Esperando ID válido</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Interaction Log */}
                  <div className="bg-black text-white p-6 rounded-3xl font-mono text-[10px] space-y-3 max-h-48 overflow-y-auto">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                       <Terminal className="w-4 h-4 text-[#FF6900]" />
                       <span className="uppercase tracking-[0.2em] font-black text-[#FF6900]">Logs de Ejecución</span>
                    </div>
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-4 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="opacity-30">{log.timestamp}</span>
                        <span className={`font-black tracking-tighter w-16 ${log.source === 'IA' ? 'text-purple-400' : log.source === 'VALIDACIÓN' ? 'text-blue-400' : log.source === 'MANUAL' ? 'text-orange-400' : 'text-gray-400'}`}>[{log.source}]</span>
                        <span className="flex-grow">{log.message}</span>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex items-center gap-2 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-[#FF6900] rounded-full" />
                        <span className="italic opacity-40">Procesando por bloque...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <AnimatePresence>
              {selectedEmail && (
                <motion.footer 
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  className="absolute bottom-0 w-full bg-white border-t p-6 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20"
                >
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest opacity-40 font-black">Ruta Decidida</span>
                      <h4 className={`font-headline font-black text-xs uppercase italic ${finalRoute?.includes('A') ? 'text-green-600' : finalRoute?.includes('C') ? 'text-red-500' : 'text-blue-600'}`}>
                        {finalRoute || "Evaluando..."}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    {finalRoute?.includes('A') ? (
                      <button className="bg-[#FF6900] text-white px-8 py-3 rounded-xl font-headline font-black text-xs tracking-widest  hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-[#FF6900]/20">
                         AUTO-RESOLVER <Send className="w-4 h-4" />
                      </button>
                    ) : finalRoute?.includes('B') ? (
                      <div className="flex gap-3">
                        <button className="bg-black text-white px-6 py-3 rounded-xl font-headline font-black text-xs tracking-widest hover:bg-gray-800 transition-all">
                           VALIDAR MANUAL
                        </button>
                        <button className="bg-gray-100 text-black px-6 py-3 rounded-xl font-headline font-black text-xs tracking-widest hover:bg-gray-200 transition-all">
                           DERIVAR AGENTE
                        </button>
                      </div>
                    ) : (
                      <button className="bg-red-500 text-white px-8 py-3 rounded-xl font-headline font-black text-xs tracking-widest hover:bg-red-600 transition-all flex items-center gap-2">
                         ESCALAR A CRM <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.footer>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </motion.div>
  );
};

const Terminal = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
);
