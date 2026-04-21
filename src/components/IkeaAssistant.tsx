import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, X, Package, Info, AlertTriangle, MessageSquare } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface IkeaAssistantProps {
  onClose: () => void;
}

const SYSTEM_INSTRUCTION = `
Eres el Asistente de Devoluciones de IKEA España. Tu objetivo es guiar a los clientes a través del proceso de devolución siguiendo la política oficial.

DIRECTRICES DE OPERACIÓN:
1. MENSAJES DE TRANSPARENCIA: Siempre aclara que eres un asistente y que las condiciones pueden variar. Usa frases como: "Puedo orientarte según la política de devoluciones de IKEA, pero algunas excepciones pueden requerir revisión manual."
2. VALIDACIÓN DE DATOS MÍNIMOS: Antes de dar una respuesta definitiva, debes validar:
   - Fecha de compra.
   - Canal de compra (Online o Tienda).
   - Estado del producto (Sin usar, abierto, montado).
   - Disponibilidad de Ticket o Número de Pedido.
3. REGLAS DE NO-PROMESA:
   - NO confirmes reembolsos garantizados.
   - NO asegures la aceptación de devoluciones en casos límite.
   - NO interpretes excepciones no documentadas.
4. ESCALADO A HUMANO (Obligatorio si):
   - El producto está dañado o hay una incidencia logística.
   - El cliente muestra enfado alto o amenaza con reclamación.
   - Hay sospecha de fraude o abuso.
   - Faltan datos clave de forma persistente.
5. TONO: Empático ante problemas, pero claro y firme en los límites. Nunca confrontativo.

CASOS DE USO (Backlog):
- Consulta de plazos (Generalmente 365 días para productos sin usar).
- Condiciones (Abierto/Montado): IKEA acepta devoluciones de productos abiertos si están en perfecto estado, pero hay limitaciones si están usados intensivamente.
- Devolución sin ticket: Ofrecer alternativas como extracto bancario o cuenta IKEA Family.
- Productos no retornables: Colchones usados (tienen política especial de 89 días), productos de "Oportunidades", etc.
`;

export const IkeaAssistant: React.FC<IkeaAssistantProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hej! Soy tu asistente de devoluciones de IKEA. ¿En qué puedo ayudarte hoy? Por favor, ten a mano tu ticket o número de pedido si lo tienes.",
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
        model: "gemini-1.5-flash",
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
        content: response.text || "Lo siento, he tenido un problema técnico. ¿Podrías volver a intentarlo?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error de conexión. Por favor, inténtalo de nuevo en unos momentos.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ikea-assistant-title"
    >
      <div className="w-full max-w-2xl h-[80vh] bg-white border border-yellow-400 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#0058AB] p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#FFCC00] p-2 rounded-md shadow-inner" aria-hidden="true">
              <Package className="w-6 h-6 text-[#0058AB]" />
            </div>
            <div>
              <h2 id="ikea-assistant-title" className="text-white font-headline font-black text-xl leading-none tracking-tight">IKEA Returns</h2>
              <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Asistente de Devoluciones</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            aria-label="Cerrar chat"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Cerrar</span>
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50"
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
              <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === "user" ? "bg-[#FFCC00]" : "bg-[#0058AB]"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-[#0058AB]" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-[#FFCC00] text-[#0058AB] font-medium rounded-tr-none" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-[#0058AB] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#0058AB] rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#0058AB] rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#0058AB] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar bg-white" role="group" aria-label="Acciones rápidas">
          {[
            { label: "¿Cuál es el plazo?", icon: Info },
            { label: "He perdido el ticket", icon: AlertTriangle },
            { label: "Producto montado", icon: Package },
            { label: "Estado de reembolso", icon: MessageSquare }
          ].map((action) => (
            <button 
              key={action.label}
              onClick={() => setInput(action.label)}
              className="whitespace-nowrap px-4 py-2 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-[#0058AB] hover:bg-[#FFCC00] hover:border-[#FFCC00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058AB] transition-all flex items-center gap-2"
              aria-label={`Enviar mensaje rápido: ${action.label}`}
            >
              <action.icon className="w-3 h-3" aria-hidden="true" />
              {action.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-4">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe tu caso de devolución..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#0058AB] focus:ring-2 focus:ring-[#0058AB]/20 transition-colors text-slate-800 placeholder:text-slate-400"
            aria-label="Mensaje para el asistente"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#0058AB] text-white px-6 py-3 rounded-md hover:bg-[#004a91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058AB] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-xs uppercase tracking-widest shadow-md"
            aria-label="Enviar mensaje"
          >
            Enviar
          </button>
        </form>
      </div>
    </motion.div>
  );
};
