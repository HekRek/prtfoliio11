/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useVelocity } from "motion/react";
import { Mail, Instagram, MessageCircle, Linkedin, Github, Terminal as TerminalIcon, Gamepad2 } from "lucide-react";
import { MovistarAssistant } from "./components/MovistarAssistant";
import { IkeaAssistant } from "./components/IkeaAssistant";
import { TelefonicaAssistant } from "./components/TelefonicaAssistant";
import { GlovoDashboard } from "./components/GlovoDashboard";
import { ZalandoAssistant } from "./components/ZalandoAssistant";
import { ProgressiveImage } from "./components/ProgressiveImage";
import { Loader } from "./components/Loader";

const projects = [
  {
    id: "01",
    category: "Chatbots",
    title: "TELEFÓNICA",
    description: "dos mini-especificaciones de asistente (interno vs externo) para averías y procedimientos en Telefónica Empresas",
    image: "/imagenes/telefonica.png",
    isAssistant: "telefonica"
  },
  {
    id: "02",
    category: "Chatbots",
    title: "IKEA",
    description: "backlog de 12 casos de uso del asistente de devoluciones IKEA España y un checklist MVP con 15 pruebas",
    image: "/imagenes/ikea.png",
    isAssistant: "ikea"
  },
  {
    id: "03",
    category: "Chatbots",
    title: "MOVISTAR",
    description: "mapa de piezas del asistente de soporte técnico de Movistar para averías de router, cortes y seguimiento de incidencias",
    image: "/imagenes/movistar.png",
    isAssistant: "movistar"
  },
  {
    id: "04",
    category: "Avatares",
    title: "MAPFRE",
    description: "storyboard de 6–8 escenas y brief.",
    image: "/imagenes/mapfre.png",
    link: "https://youtu.be/vfsu5MiizLc?si=GdNfXawtDt9zUZYj"
  },
  {
    id: "05",
    category: "Avatares",
    title: "IBERDROLA",
    description: "mini-vídeo de seguridad para Iberdrola: 5 reglas antes de iniciar una intervención.",
    image: "/imagenes/iberdrola.png",
    link: "https://youtu.be/9BIORoWmozQ?si=-ASTApxgl5ZZrgT6"
  },
   {
     id: "09",
     category: "Automatizaciones",
     title: "GLOVO DASHBOARD",
     description: "Dashboard técnico full-stack para comparar triggers de tiempo real (Kafka) vs batch (Cron), con visualización de latencia y completitud de datos.",
     image: "/imagenes/glovo.png",
     isAssistant: "glovo"
   },
   {
     id: "10",
     category: "Automatizaciones",
     title: "ZALANDO SUPPORT AI",
     description: "Gestión automatizada de incidencias con extracción de datos mediante IA, validación OMS y enrutado inteligente de clientes.",
     image: "/imagenes/zalando.png",
     isAssistant: "zalando"
   }
];

const TextScramble = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  
  useEffect(() => {
    let iteration = 0;
    let interval: any;
    
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, index) => {
              if (index < iteration) return text[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );
        
        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 30);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay]);

  return <span>{displayText}</span>;
};

const ProjectPath = ({ onOpenAssistant, invertedColor }: { onOpenAssistant: (type: string) => void, invertedColor: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001
  });

  const y = useTransform(pathLength, [0, 1], ["0%", "100%"]);
  
  return (
    <div ref={containerRef} className="relative max-w-7xl mx-auto py-40">
      {/* Central Path Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 hidden md:block" aria-hidden="true">
        <motion.div 
          style={{ height: y, backgroundColor: invertedColor }}
          className="absolute top-0 left-0 w-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        />
      </div>

      {/* Moving character removed as requested */}

      <div className="space-y-60 relative z-10">
        {["Chatbots", "Avatares", "Automatizaciones"].map((category) => (
          <div key={category} className="space-y-40">
            <motion.div 
              {...fadeInUp}
              className="flex items-center gap-6 px-8 mb-12"
            >
              <div className="flex flex-col">
                <span style={{ color: "#131313" }} className="font-mono text-[10px] uppercase tracking-[0.5em] opacity-40 mb-2">CATEGORÍA</span>
                <h3 style={{ color: "#131313" }} className="font-display text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                  {category}
                </h3>
              </div>
              <div className="flex-grow h-px bg-[#131313] opacity-10" />
            </motion.div>
            
            <div className="space-y-80 pb-40">
              {projects
                .filter(p => p.category === category)
                .map((project, idx) => {
                  // We calculate a relative index to keep zig-zag within the category or global
                  // The user likely wants zig-zag to continue or restart. Let's restart for cleaner group look.
                  const index = idx; 
                  return (
                    <motion.div 
                      key={project.id}
                      initial={{ opacity: 0.2, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ margin: "-20% 0px -20% 0px" }}
                      transition={{ duration: 0.8 }}
                      className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                    >
                      <div className="w-full md:w-1/2">
                        <div className="bg-surface-container-low rounded-lg overflow-hidden aspect-[16/10] group relative">
                          {project.isAssistant && (
                            <div className="absolute top-4 right-4 z-10 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              <span className="text-[8px] font-black text-background tracking-widest uppercase">Asistente en Vivo</span>
                            </div>
                          )}
                          {project.link ? (
                            <a 
                              href={project.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg transition-all"
                              aria-label={`View project: ${project.title}`}
                            >
                              <ProgressiveImage
                                src={project.image} 
                                alt={`Screenshot of ${project.title} project`}
                                className="w-full h-full group-hover:scale-105 transition-transform duration-700" 
                              />
                            </a>
                          ) : project.isAssistant ? (
                            <button 
                              onClick={() => onOpenAssistant(project.isAssistant as string)} 
                              className="block w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg transition-all"
                              aria-label={`Open interactive assistant for ${project.title}`}
                            >
                              <ProgressiveImage
                                src={project.image} 
                                alt={`Preview of ${project.title} assistant`}
                                className="w-full h-full group-hover:scale-105 transition-transform duration-700" 
                              />
                            </button>
                          ) : (
                            <ProgressiveImage
                              src={project.image} 
                              alt={`Preview of ${project.title}`}
                              className="w-full h-full group-hover:scale-105 transition-transform duration-700" 
                            />
                          )}
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
                        </div>
                      </div>
                      
                      <div className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12"} text-center md:text-left`}>
                        <span style={{ color: "#131313" }} className="font-sans text-[10px] opacity-40 mb-4 block tracking-[0.3em]">NIVEL {project.id}</span>
                        <motion.h3 
                          style={{ color: "#131313" }}
                          className="font-display text-4xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic"
                        >
                          {project.title}
                        </motion.h3>
                        <motion.p 
                          style={{ color: "#131313" }}
                          className="font-sans max-w-sm mx-auto md:mx-0 opacity-60 leading-relaxed uppercase tracking-widest text-xs"
                        >
                          {project.description}
                        </motion.p>
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeAssistant, setActiveAssistant] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const elem = document.getElementById(targetId);
    if (elem) {
      const offset = 100; // Height of the sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elemRect = elem.getBoundingClientRect().top;
      const elemPosition = elemRect - bodyRect;
      const offsetPosition = elemPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [loading]);

  const backgroundColor = useTransform(scrollYProgress, [0, 1], ["#131313", "#ffffff"]);
  const textColor = useTransform(scrollYProgress, [0, 1], ["#e5e2e1", "#131313"]);
  const navBg = useTransform(scrollYProgress, [0, 1], ["rgba(19, 19, 19, 0.6)", "rgba(255, 255, 255, 0.6)"]);
  const invertedColor = useTransform(scrollYProgress, [0, 1], ["#ffffff", "#000000"]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {loading && <Loader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <motion.div 
        style={{ 
          backgroundColor, 
          color: textColor,
          "--selection-bg": invertedColor,
          "--selection-text": backgroundColor
        } as any}
        className="min-h-screen overflow-x-hidden scroll-smooth"
      >
      <AnimatePresence>
        {activeAssistant === "movistar" && (
          <MovistarAssistant onClose={() => setActiveAssistant(null)} />
        )}
        {activeAssistant === "ikea" && (
          <IkeaAssistant onClose={() => setActiveAssistant(null)} />
        )}
        {activeAssistant === "telefonica" && (
          <TelefonicaAssistant onClose={() => setActiveAssistant(null)} />
        )}
        {activeAssistant === "glovo" && (
          <GlovoDashboard onClose={() => setActiveAssistant(null)} />
        )}
        {activeAssistant === "zalando" && (
          <ZalandoAssistant onClose={() => setActiveAssistant(null)} />
        )}
      </AnimatePresence>
      {/* Top Navigation */}
      <motion.nav 
        role="navigation"
        aria-label="Navegación Principal"
        style={{ backgroundColor: navBg }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl px-8 py-6"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ color: invertedColor }}
            className="font-display font-black tracking-tighter text-2xl uppercase italic cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            HÉCTOR MARTÍN DOMÍNGUEZ
          </motion.div>
          <div className="hidden md:flex items-center gap-10">
            {[
              { label: "SOBRE MÍ", href: "#about" },
              { label: "PROYECTOS", href: "#projects" },
              { label: "CONTACTO", href: "#contact" }
            ].map((item, i) => (
              <motion.a
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ color: textColor }}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="font-headline uppercase tracking-widest text-[10px] font-bold opacity-50 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current transition-all duration-500 ease-out-expo relative group"
                aria-label={`Ir a la sección ${item.label}`}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-current transition-all duration-500 group-hover:w-full" />
              </motion.a>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ color: invertedColor }}
            className="flex items-center"
            aria-hidden="true"
          >
            <div className="w-5 h-5" />
          </motion.div>
        </div>
        
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-secondary origin-left"
          style={{ scaleX, backgroundColor: invertedColor }}
        />
      </motion.nav>

      <main className="pt-32 pb-40 relative">
        {/* Noise Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Hero Section */}
        <section id="about" className="px-8 mb-64 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between gap-12">
              <motion.div 
                {...fadeInUp}
                className="w-full md:w-2/3"
              >
                <motion.h1 
                  style={{ color: invertedColor }}
                  className="font-display text-[clamp(2.5rem,8vw,6.5rem)] font-black leading-[0.85] tracking-tighter mb-12 flex flex-col origin-left"
                >
                  <motion.span 
                    initial={{ skewX: 0 }}
                    animate={{ skewX: -10 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="overflow-hidden block"
                  >
                    {"CRAFTING".split("").map((char, i) => (
                      <motion.span
                        key={i}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={{ 
                          duration: 0.8, 
                          delay: i * 0.05, 
                          ease: [0.19, 1, 0.22, 1] 
                        }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.span>
                  
                  <span className="flex items-center gap-6">
                    <motion.span 
                      className="overflow-hidden flex"
                      style={{ perspective: "1000px" }}
                    >
                      {"DIGITAL".split("").map((char, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, rotateX: -90, y: 30 }}
                          animate={{ opacity: 1, rotateX: 0, y: 0 }}
                          transition={{ 
                            duration: 1, 
                            delay: 0.5 + i * 0.08, 
                            ease: [0.215, 0.61, 0.355, 1] 
                          }}
                          className="inline-block font-mono text-secondary italic relative"
                        >
                          {char}
                          <motion.span 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="absolute bottom-2 left-0 h-[2px] bg-secondary/30"
                          />
                        </motion.span>
                      ))}
                    </motion.span>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.5, delay: 1, ease: [0.19, 1, 0.22, 1] }}
                      className="h-px flex-grow bg-white/20 hidden md:block relative"
                    >
                      <motion.div 
                        animate={{ left: ["0%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-secondary rounded-full blur-[2px]"
                      />
                    </motion.div>
                  </span>

                  <motion.span 
                    initial={{ fontVariationSettings: '"wght" 800' }}
                    animate={{ fontVariationSettings: '"wght" 400' }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="overflow-hidden block"
                  >
                    <TextScramble text="POETRY." delay={1.2} />
                  </motion.span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 0.6, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2 }}
                  className="font-sans text-lg md:text-2xl font-light leading-relaxed max-w-2xl border-l border-white/10 pl-8 mt-32"
                >
                  Especializado en <span className="text-secondary italic">herramientas IA</span>.
                </motion.p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.4 }}
                viewport={{ once: true }}
                className="w-full md:w-1/3 flex flex-col items-start md:items-end text-left md:text-right"
              >
                <div className="text-[10px] font-sans uppercase tracking-widest leading-loose">
                  LAT: 39.8628 <br />
                  LNG: -4.0273 <br />
                  EST: 2007
                </div>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
              className="absolute bottom-[-12rem] left-0 flex flex-col items-start gap-4"
              aria-hidden="true"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-white/20" />
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-40">DESLIZA PARA COMENZAR</span>
              </div>
              <div className="h-20 w-px bg-gradient-to-b from-white/20 to-transparent ml-6 relative overflow-hidden">
                <motion.div 
                  animate={{ y: ["-100%", "400%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 left-0 w-full h-1/4 bg-secondary blur-[1px]"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Projects Path Section */}
        <section id="projects" className="px-8 mb-60">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeInUp} className="mb-20">
              <div className="flex items-center gap-4 mb-8">
                <motion.h2 style={{ color: invertedColor }} className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                  <span className="text-secondary">PRO</span>YECTOS
                </motion.h2>
              </div>
              {/* Visual Scroll Guide */}
              <div className="flex items-center gap-12 mt-12">
                <div className="relative h-32 w-px bg-gradient-to-b from-secondary to-transparent overflow-hidden">
                  <motion.div 
                    animate={{ y: ["-100%", "300%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-1/2 bg-white blur-[2px]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-secondary"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.4em] opacity-40">SYSTEM_FLOW ACTIVE</span>
                </div>
              </div>
            </motion.div>
            
            <ProjectPath onOpenAssistant={(type) => setActiveAssistant(type)} invertedColor={invertedColor} />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mt-60 px-8 py-40">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <motion.div {...fadeInUp}>
                <motion.h2 
                  style={{ color: invertedColor }}
                  className="font-display text-[clamp(2rem,5vw,4rem)] font-black leading-none tracking-tighter mb-12 uppercase italic"
                >
                  HABLEMOS <br />
                </motion.h2>
                <div className="space-y-8">
                  {[
                    { label: "Email", value: "hectormartindominguezz@gmail.com", href: "mailto:hectormartindominguezz@gmail.com" },
                    { label: "Teléfono", value: "648 22 71 95", href: "tel:648227195" },
                    { label: "Ubicación", value: "Guadamur, Toledo, ES" }
                  ].map((item) => (
                    <div key={item.label} className="group cursor-pointer">
                      <span className="font-sans text-[10px] opacity-40 uppercase block mb-1">{item.label}</span>
                      {item.href ? (
                        <motion.a 
                          style={{ color: textColor }}
                          className="font-headline text-2xl md:text-3xl font-light hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current transition-all" 
                          href={item.href}
                          aria-label={`Contactar vía ${item.label}: ${item.value}`}
                        >
                          {item.value}
                        </motion.a>
                      ) : (
                        <motion.span style={{ color: textColor }} className="font-headline text-2xl md:text-3xl font-light">{item.value}</motion.span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div {...fadeInUp} className="flex flex-col justify-end gap-6 h-full">
                <motion.a 
                  href="https://wa.me/34648227195"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: invertedColor, color: useTransform(invertedColor, (v: string) => v === "#ffffff" ? "#000000" : "#ffffff") }}
                  className="flex items-center justify-center gap-4 px-8 py-6 rounded-md font-sans text-sm tracking-[0.2em] font-bold hover:opacity-80 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  aria-label="Contactar por WhatsApp"
                >
                  <MessageCircle size={20} />
                  WHATSAPP
                </motion.a>
                <motion.a 
                  href="https://www.instagram.com/hectoor.martin?igsh=aXhucHl0cGUxZnFt&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: invertedColor, color: useTransform(invertedColor, (v: string) => v === "#ffffff" ? "#000000" : "#ffffff") }}
                  className="flex items-center justify-center gap-4 px-8 py-6 rounded-md font-sans text-sm tracking-[0.2em] font-bold hover:opacity-80 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  aria-label="Seguir en Instagram"
                >
                  <Instagram size={20} />
                  INSTAGRAM
                </motion.a>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Padding for bottom */}
      <div className="pb-40" />
    </motion.div>
    </div>
  );
}
