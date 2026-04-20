import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, X, ChevronRight, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "status" | "action";
}

interface MovistarAssistantProps {
  onClose: () => void;
}

const SYSTEM_INSTRUCTION = `
Eres el Asistente de Soporte Movistar, una IA de vanguardia diseñada bajo una arquitectura híbrida (Reglas + LLM).

TU MISIÓN:
Resolver averías técnicas y gestionar incidencias de clientes de Movistar de forma eficiente y segura.

CONOCIMIENTO DEL INFORME (Arquitectura Funcional):
1. CANALES: Operas en Web (Widget), App Mi Movistar, WhatsApp Business e IVR Cognitivo (1002).
2. MOTOR DE ORQUESTACIÓN: Actúas como un "router de intenciones". Debes detectar si el usuario reporta una avería nueva o consulta una existente.
3. SLOT FILLING: Para averías nuevas, DEBES recopilar:
   - Número de línea afectada.
   - Estado de las luces del router (HGU o Smart WiFi).
4. MOTOR HÍBRIDO: 
   - Usa REGLAS para pasos críticos: Identificación, avisos legales, comprobaciones básicas.
   - Usa LLM (tu capacidad actual) para: Interpretar lenguaje natural ("no me va el internet"), explicar manuales y resolver dudas no estructuradas.
5. INTEGRACIÓN CON TICKETING: Puedes simular la apertura de incidencias enviando un "Paquete de Contexto" con el log del diagnóstico.
6. SEGURIDAD (CRÍTICO): 
   - Principio de "mínimo dato útil".
   - NUNCA pidas contraseñas ni DNI completo.
   - Enmascara datos sensibles.
7. HANDOFF (Válvula de Seguridad): Si detectas avería física o frustración (2 intentos fallidos), ofrece pasar a un operador técnico.

ESPECIFICACIONES TÉCNICAS DE ROUTERS:
- Luz Azul Fija: Todo correcto.
- Luz Roja Fija: Fallo de potencia óptica (posible cable roto).
- Luz Roja Parpadeante: Fallo de registro/autenticación.
`;

export const MovistarAssistant: React.FC<MovistarAssistantProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy tu Asistente de Soporte Movistar. ¿En qué puedo ayudarte hoy? Puedes reportar una avería o consultar el estado de una incidencia.",
      timestamp: new Date(),
    }
  ]);
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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

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
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.text || "Lo siento, he tenido un problema procesando tu solicitud. ¿Podrías repetir?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error de conexión con el motor de orquestación. Por favor, inténtalo de nuevo más tarde.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
    >
      <div className="w-full max-w-2xl h-[80vh] bg-white border border-blue-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#0066FF] p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg" aria-hidden="true">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="assistant-title" className="text-white font-headline font-bold text-lg leading-tight">Soporte Movistar</h2>
              <p className="text-white/60 text-[10px] uppercase tracking-widest">Asistente Virtual Híbrido</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Cerrar chat"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Cerrar</span>
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-blue-50/30"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-[#0066FF]" : "bg-white border border-blue-200 shadow-sm"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#0066FF]" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-[#0066FF] text-white rounded-tr-none" 
                    : "bg-white border border-blue-100 text-slate-700 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-blue-200 shadow-sm flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#0066FF]" />
                </div>
                <div className="bg-white border border-blue-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#0066FF] rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#0066FF] rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#0066FF] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 border-t border-blue-50 flex gap-2 overflow-x-auto no-scrollbar bg-white" role="group" aria-label="Acciones rápidas">
          {["Mi internet no funciona", "Luces rojas en el router", "Consultar avería", "Hablar con agente"].map((action) => (
            <button 
              key={action}
              onClick={() => {
                setInput(action);
              }}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[10px] uppercase tracking-widest text-[#0066FF] hover:bg-[#0066FF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] transition-all"
              aria-label={`Enviar mensaje rápido: ${action}`}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-6 bg-white border-t border-blue-100 flex gap-4">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta aquí..."
            className="flex-1 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-colors text-slate-700 placeholder:text-slate-400"
            aria-label="Mensaje para el asistente"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#0066FF] text-white p-3 rounded-xl hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            aria-label="Enviar mensaje"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        </form>
      </div>

    </motion.div>
  );
};
