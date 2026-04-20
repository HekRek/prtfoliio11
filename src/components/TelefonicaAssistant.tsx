import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, X, ShieldCheck, Building2, Terminal, MessageSquare, ChevronRight } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface TelefonicaAssistantProps {
  onClose: () => void;
}

type AssistantMode = "internal" | "external" | null;

const SYSTEM_INSTRUCTIONS = {
  internal: `
Eres el Asistente Interno de Soporte Técnico de Telefónica Empresas.
TU TONO: Operativo, directo y técnico. Puedes usar jerga técnica y acrónimos (NMS, CRM, OLT, IDU) sin explicarlos.
TU MISIÓN: Facilitar la apertura rápida de incidencias y reducir errores operativos.
DIRECTRICES:
1. DECLARACIÓN OBLIGATORIA: Al inicio o cuando sea relevante, indica: "Operando bajo perfil de Soporte Nivel 1".
2. LÍMITES: Declara que no tienes permisos para modificar configuraciones de red en vivo sin una OT asociada.
3. DATOS: Puedes pedir ID de empleado, IDU (Identificador de circuito), Código de nodo y estado de alarmas.
4. FORMATO: Mensajes breves, estructurados en bullets o códigos.
5. ESCALADO: A segundo nivel técnico o supervisor con detalles muy técnicos.
6. FRASES PROHIBIDAS: No prometas tiempos de resolución ni compensaciones. No pidas contraseñas.
`,
  external: `
Eres el Asistente Virtual de Telefónica Empresas para Clientes.
TU TONO: De servicio, empático y profesional. Evita jerga técnica. Si usas términos complejos (latencia, jitter), explícalos brevemente.
TU MISIÓN: Proporcionar soporte accesible y reducir la fricción en la experiencia del cliente.
DIRECTRICES:
1. IDENTIFICACIÓN: Identifícate siempre como asistente virtual.
2. LÍMITES: No prometas tiempos exactos ni compensaciones sin validación humana.
3. DATOS (Mínimo dato útil): Pide CIF de la empresa, nombre del contacto autorizado y número de línea afectada.
4. FORMATO: Narrativo, frases completas y confirmaciones explícitas.
5. ESCALADO: A agente humano de atención empresarial con un resumen comprensible.
6. FRASES PROHIBIDAS: No prometas tiempos ("en menos de 2h"), no prometas reembolsos, no pidas contraseñas.
`
};

export const TelefonicaAssistant: React.FC<TelefonicaAssistantProps> = ({ onClose }) => {
  const [mode, setMode] = useState<AssistantMode>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<any>(null);

  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startAssistant = (selectedMode: AssistantMode) => {
    setMode(selectedMode);
    const initialMessage = selectedMode === "internal" 
      ? "Consola de soporte activa. Operando bajo perfil de Soporte Nivel 1. ¿Qué segmento de red vamos a monitorizar?"
      : "Hola, soy el asistente virtual de Telefónica Empresas. ¿En qué puedo ayudar a tu negocio hoy?";
    
    setMessages([{
      role: "assistant",
      content: initialMessage,
      timestamp: new Date(),
    }]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !mode) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiRef.current.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: messages.concat(userMessage).map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS[mode],
        }
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.text || "Error en el procesamiento de la solicitud.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error de conexión con el sistema central. Por favor, reintente.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="telefonica-assistant-title"
    >
      <div className="w-full max-w-3xl h-[85vh] bg-white rounded-3xl shadow-[0_0_50px_rgba(0,102,255,0.3)] flex flex-col overflow-hidden border border-blue-100">
        {/* Header */}
        <div className="bg-[#003145] p-8 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20" aria-hidden="true">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 id="telefonica-assistant-title" className="text-white font-headline font-black text-2xl tracking-tight">Telefónica Empresas</h2>
              <p className="text-blue-300/60 text-[10px] uppercase tracking-[0.3em] font-bold">Smart Support System</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all relative z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Cerrar chat"
          >
            <X className="w-8 h-8" aria-hidden="true" />
          </button>
        </div>

        {!mode ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-b from-white to-blue-50">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-md"
            >
              <h3 className="text-slate-900 font-headline text-3xl font-bold mb-4 tracking-tight">Seleccione el perfil de acceso</h3>
              <p className="text-slate-500 text-sm mb-12 leading-relaxed">
                Para garantizar la seguridad y eficiencia, el sistema adapta su comportamiento según su rol en la organización.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => startAssistant("internal")}
                  className="group flex items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all text-left"
                >
                  <div className="bg-slate-100 p-4 rounded-xl group-hover:bg-blue-500 transition-colors">
                    <Terminal className="w-6 h-6 text-slate-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-900 font-bold text-lg">Soporte Interno</div>
                    <div className="text-slate-400 text-xs uppercase tracking-widest font-bold">Acceso Empleados</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                </button>

                <button 
                  onClick={() => startAssistant("external")}
                  className="group flex items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all text-left"
                >
                  <div className="bg-slate-100 p-4 rounded-xl group-hover:bg-blue-500 transition-colors">
                    <Building2 className="w-6 h-6 text-slate-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-900 font-bold text-lg">Atención Empresas</div>
                    <div className="text-slate-400 text-xs uppercase tracking-widest font-bold">Acceso Clientes</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/50"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      msg.role === "user" ? "bg-blue-600" : "bg-white border border-blue-100"
                    }`}>
                      {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white border border-blue-50 text-slate-700 rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shadow-sm">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="bg-white border border-blue-50 p-5 rounded-3xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1.5">
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-blue-600 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-blue-600 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-blue-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white border-t border-blue-50">
              <form onSubmit={handleSend} className="flex gap-4">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === "internal" ? "Introduce ID de circuito o código de avería..." : "Describe tu consulta empresarial..."}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all text-slate-800 placeholder:text-slate-400"
                  aria-label="Mensaje para el asistente"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-600/20"
                  aria-label="Enviar mensaje"
                >
                  Enviar
                </button>
              </form>
              <div className="mt-4 flex justify-between items-center px-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {mode === "internal" ? "Modo: Soporte Nivel 1" : "Modo: Atención Empresas"}
                </span>
                <button 
                  onClick={() => setMode(null)}
                  className="text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
                  aria-label="Cambiar perfil de acceso"
                >
                  Cambiar Perfil
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
