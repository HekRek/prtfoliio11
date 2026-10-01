import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Activity, Database, ShieldAlert, Cpu, AlertTriangle, 
  CheckCircle2, Play, RefreshCw, Terminal, ArrowRight,
  TrendingUp, Clock, Package
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";

const GLOVO_YELLOW = "#FFC244";
const GLOVO_GREEN = "#00A082";
const GLOVO_INK = "#1F2937";
const GLOVO_BG = "#F9FAFB";

interface Event {
  id: string;
  type: string;
  location: string;
  urgency: string;
  timestamp: string;
  latency: number;
  isDuplicate: boolean;
}

interface BatchReport {
  day: string;
  processed: number;
  expected: number;
  completion: number;
}

export const GlovoDashboard = ({ onClose }: { onClose: () => void }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [reports, setReports] = useState<BatchReport[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRunningBatch, setIsRunningBatch] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchReports();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerEvent = async () => {
    setIsSimulating(true);
    const types = ["Router Failure", "Courier Delay", "Cancellation", "Order Issue"];
    const locations = ["Madrid - Centro", "Barcelona - Les Corts", "Valencia - Ruzafa", "Sevilla - Triana"];
    const idKey = `key_${Math.floor(Math.random() * 20)}`; // Simulate potential duplicates with 1/20 overlap

    try {
      await fetch("/api/events/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idKey,
          type: types[Math.floor(Math.random() * types.length)],
          location: locations[Math.floor(locations.length * Math.random())]
        })
      });
      await fetchEvents();
    } finally {
      setIsSimulating(false);
    }
  };

  const runBatch = async () => {
    setIsRunningBatch(true);
    try {
      await fetch("/api/cron/run", { method: "POST" });
      await fetchReports();
    } finally {
      setIsRunningBatch(false);
    }
  };

  // KPI Calculations
  const avgLatency = events.length > 0 
    ? (events.reduce((acc, curr) => acc + curr.latency, 0) / events.length).toFixed(2)
    : "0.00";
  
  const duplicateCount = events.filter(e => e.isDuplicate).length;
  const currentIntegrity = reports.length > 0 ? reports[reports.length - 1].completion : 100;

  // Chart Data: Latency last 5 mins (simulated)
  const latencyData = [...events].reverse().slice(-15).map((e, index) => ({
    time: index,
    latency: parseFloat(e.latency.toFixed(3))
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-0 md:p-4 lg:p-8"
    >
      <div className="bg-[#F9FAFB] w-full max-w-7xl h-full md:h-[95vh] rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-8 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FFC244] rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
              <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline font-black text-2xl text-[#1F2937] tracking-tighter uppercase italic line-height-none">CONTROL DE INCIDENCIAS GLOVO</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-mono text-[9px] text-[#1F2937]/40 uppercase tracking-widest">Estado del Sistema: Óptimo</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-mono text-[10px] uppercase opacity-40">Orquestador v4.2</span>
              <span className="font-mono text-[10px] uppercase text-[#00A082] font-bold">Clúster Node.js / Express</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-8 space-y-8">
          {/* KPI Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "LATENCIA P99", value: `${avgLatency}s`, icon: Clock, color: "text-blue-600", trend: "Objetivo < 2.0s" },
              { label: "EVENTOS HOY", value: events.length * 12 + 1500, icon: Activity, color: "text-[#FFC244]", trend: "+12% vs T-1" },
              { label: "INTEGRIDAD DE DATOS", value: `${currentIntegrity}%`, icon: ShieldAlert, color: "text-[#00A082]", trend: "Lote Verificado" },
              { label: "IDEMPOTENCIA", value: duplicateCount, icon: RefreshCw, color: "text-orange-500", trend: "Bloqueos Shadow" }
            ].map((kpi, i) => (
              <motion.div 
                key={kpi.label} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-gray-50 ${kpi.color}`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#1F2937]/30">{kpi.trend}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-sans text-[10px] uppercase tracking-widest opacity-40">{kpi.label}</span>
                  <p className="font-headline text-3xl font-black text-[#1F2937] tracking-tighter">{kpi.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Feed Column */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-headline font-black text-xl text-[#1F2937] uppercase italic">Eventos en Tiempo Real</h2>
                  <p className="font-sans text-xs opacity-40">Flujo de Eventos Pub-Sub (Kafka Gateway)</p>
                </div>
                <button 
                  onClick={triggerEvent}
                  disabled={isSimulating}
                  className="bg-[#00A082] text-white px-6 py-3 rounded-xl font-headline font-black text-xs tracking-widest flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  SIMULAR EVENTO
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis hide dataKey="time" />
                    <YAxis domain={[0, 2.5]} fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="latency" 
                      stroke="#FFC244" 
                      strokeWidth={3} 
                      dot={false}
                      animationDuration={400}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {events.map((event) => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`bg-white p-4 rounded-xl border-l-4 shadow-sm flex items-center justify-between ${event.isDuplicate ? 'border-orange-500 bg-orange-50/50' : 'border-[#00A082]'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${event.isDuplicate ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-[#00A082]'}`}>
                          {event.isDuplicate ? <AlertTriangle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline font-bold text-sm tracking-tight">{event.type}</h4>
                            {event.isDuplicate && <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-black">DUPLICADO BLOQUEADO</span>}
                          </div>
                          <p className="font-mono text-[10px] opacity-40 uppercase">{event.location} • {event.latency.toFixed(3)}s</p>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] opacity-20">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Batch History Column */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-headline font-black text-xl text-[#1F2937] uppercase italic">Análisis por Lotes</h2>
                  <p className="font-sans text-xs opacity-40">Reconciliación T-1 (Cron@0300)</p>
                </div>
                <button 
                  onClick={runBatch}
                  disabled={isRunningBatch}
                  className="bg-[#1F2937] text-white px-6 py-3 rounded-xl font-headline font-black text-xs tracking-widest flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningBatch ? 'animate-spin' : ''}`} />
                  EJECUTAR LOTE
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reports}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: '#f9fafb'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="expected" fill="#e5e7eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="processed" fill="#00A082" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {reports.slice().reverse().map((report, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-black/5 flex items-center justify-between group hover:border-[#00A082]/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="text-center w-12 shrink-0">
                        <span className="font-headline text-lg font-black text-[#1F2937]">{report.day}</span>
                      </div>
                      <div className="h-8 w-px bg-black/5" />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-[10px] uppercase opacity-40 tracking-wider">Completitud</span>
                          <div className="bg-green-100 text-[#00A082] px-2 py-0.5 rounded text-[10px] font-black">{report.completion}%</div>
                        </div>
                        <p className="font-sans text-xs text-[#1F2937]/70">
                          <span className="font-bold text-[#1F2937]">{report.processed}</span> procesados de <span className="font-bold text-[#1F2937]">{report.expected}</span> registros.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-200 group-hover:text-[#00A082] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Table */}
          <section className="bg-[#1F2937] text-white p-8 rounded-3xl">
            <h3 className="font-headline font-black text-xl mb-6 uppercase italic flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FFC244]" />
              Comparativa de Estrategias
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white/30">
                    <th className="py-4 font-normal tracking-widest">PARÁMETRO</th>
                    <th className="py-4 font-normal tracking-widest text-[#FFC244]">STREAMING (A)</th>
                    <th className="py-4 font-normal tracking-widest text-[#00A082]">LOTES (B)</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  <tr className="border-b border-white/5">
                    <td className="py-4 opacity-40">Modo de Disparo</td>
                    <td className="py-4 font-bold">Basado en Eventos (Pub/Sub)</td>
                    <td className="py-4 font-bold">Cron (03:00 AM)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 opacity-40">KPI Principal</td>
                    <td className="py-4">Latencia P99 &lt; 2s</td>
                    <td className="py-4">Completitud 100%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 opacity-40">Factor de Riesgo</td>
                    <td className="py-4 text-orange-400">Tormentas de Eventos / Picos</td>
                    <td className="py-4 text-orange-400">Bloqueos de BD / OOM</td>
                  </tr>
                  <tr>
                    <td className="py-4 opacity-40">Mitigación</td>
                    <td className="py-4">Contrapresión/Idempotencia</td>
                    <td className="py-4">Fragmentos Paginados/Read-Rep</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </motion.div>
  );
};
