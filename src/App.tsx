/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "motion/react";
import { Instagram, MessageCircle, Package, Megaphone, Globe, ArrowUpRight, QrCode } from "lucide-react";
import { Loader } from "./components/Loader";

const services = [
  {
    id: "01",
    title: "QR/NFC RESEÑAS GOOGLE",
    tagline: "Soportes acrílicos inteligentes con Contactless NFC y QR de alta velocidad",
    description: "Multiplica tus reseñas de 5 estrellas en Google y potencia tus canales al instante. Placas inteligentes de diseño premium (Google Reviews, Instagram, TikTok, Facebook) para que tus clientes acerquen su smartphone (NFC) o escaneen el código QR en el mostrador.",
    image: "/src/assets/images/qr_nfc_smart_stands_1790248979482.jpg",
    capabilities: [
      "Chip NFC contactless integrado con redirección inmediata",
      "Modelos para Google Reviews, Instagram, TikTok y Facebook",
      "Código QR de alto contraste grabado con máxima nitidez",
      "Sin aplicaciones adicionales, cuotas ni suscripciones"
    ],
    icon: QrCode,
    actionText: "Pedir Placa QR/NFC",
    whatsappMsg: "Hola Héctor, me gustaría solicitar información y precios sobre los soportes QR/NFC para mi negocio."
  },
  {
    id: "02",
    title: "ASESORÍA MARKETING",
    tagline: "Estrategia digital, captación de leads y automatización inteligente",
    description: "Consultoría estratégica para multiplicar la visibilidad y el rendimiento comercial de proyectos y marcas. Aplicación de analítica, herramientas de inteligencia artificial y optimización de canales digitales.",
    capabilities: [
      "Auditoría de presencia y canales digitales",
      "Embudos de captación y nutrición de leads",
      "Sistemas de generación y distribución de contenido con IA",
      "Estrategias de adquisición y optimización de conversión"
    ],
    icon: Megaphone,
    actionText: "Consultar Marketing",
    whatsappMsg: "Hola Héctor, me interesa una Asesoría de Marketing para mi marca o negocio."
  },
  {
    id: "03",
    title: "ASESORÍA WEB",
    tagline: "Arquitectura técnica, diseño UI/UX de alto impacto y rendimiento",
    description: "Asesoramiento integral y modernización de interfaces web. Optimización de velocidad, accesibilidad, experiencia de usuario y arquitectura técnica para convertir visitantes en clientes fidelizados.",
    capabilities: [
      "Auditoría técnica de rendimiento, UX y responsive",
      "Diseño y restyling de interfaces con estética contemporánea",
      "Arquitecturas modernas (React, Tailwind, Vite)",
      "Optimización de tiempos de carga y flujos de usuario"
    ],
    icon: Globe,
    actionText: "Consultar Asesoría Web",
    whatsappMsg: "Hola Héctor, quiero asesoramiento técnico sobre diseño y desarrollo web."
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

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
};

export default function App() {
  const [loading, setLoading] = useState(true);
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

  // Background transitions smoothly from technological deep blue (#07132b) -> rich cobalt (#12376e) -> vibrant azure (#356eb5) -> ice glacier (#d6e7fc) -> pure luminous white (#ffffff)
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 0.9, 1],
    ["#07132b", "#12376e", "#356eb5", "#d6e7fc", "#ffffff"]
  );

  // High-contrast primary text that stays sharp, clear, and perfectly legible across blue to white
  const textColor = useTransform(
    scrollYProgress,
    [0, 0.55, 0.68, 1],
    ["#f0f7ff", "#ffffff", "#0c1f3d", "#07132b"]
  );

  // Dominant color for strong titles, key logos, and inverted components
  const invertedColor = useTransform(
    scrollYProgress,
    [0, 0.55, 0.68, 1],
    ["#ffffff", "#ffffff", "#07132b", "#07132b"]
  );

  // Dynamic secondary color for technical tags, highlights, and icons (cyan/sky on deep blue, vivid cobalt/sapphire on white)
  const dynamicSecondary = useTransform(
    scrollYProgress,
    [0, 0.55, 0.68, 1],
    ["#38bdf8", "#7dd3fc", "#0284c7", "#0369a1"]
  );

  // Frosted navigation background matching real-time luminance
  const navBg = useTransform(
    scrollYProgress,
    [0, 0.55, 0.68, 1],
    [
      "rgba(7, 19, 43, 0.8)",
      "rgba(18, 55, 110, 0.85)",
      "rgba(225, 239, 255, 0.9)",
      "rgba(255, 255, 255, 0.9)"
    ]
  );

  // Cards backdrop and border for Services ensuring clean contrast on both blue and white zones
  const cardBg = useTransform(
    scrollYProgress,
    [0, 0.55, 0.68, 1],
    [
      "rgba(255, 255, 255, 0.06)",
      "rgba(255, 255, 255, 0.1)",
      "rgba(7, 19, 43, 0.05)",
      "rgba(7, 19, 43, 0.03)"
    ]
  );

  const cardBorder = useTransform(
    scrollYProgress,
    [0, 0.55, 0.68, 1],
    [
      "rgba(56, 189, 248, 0.25)",
      "rgba(125, 211, 252, 0.35)",
      "rgba(7, 19, 43, 0.16)",
      "rgba(7, 19, 43, 0.12)"
    ]
  );

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
              { label: "SERVICIOS", href: "#services" },
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
                className="font-headline uppercase tracking-widest text-[10px] font-bold opacity-75 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current transition-all duration-500 ease-out-expo relative group"
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
                          style={{ color: dynamicSecondary }}
                          className="inline-block font-mono italic relative"
                        >
                          {char}
                          <motion.span 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 1.5, duration: 1 }}
                            style={{ backgroundColor: dynamicSecondary }}
                            className="absolute bottom-2 left-0 h-[2px] opacity-40"
                          />
                        </motion.span>
                      ))}
                    </motion.span>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.5, delay: 1, ease: [0.19, 1, 0.22, 1] }}
                      className="h-px flex-grow bg-current opacity-25 hidden md:block relative"
                    >
                      <motion.div 
                        animate={{ left: ["0%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundColor: invertedColor }}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full blur-[1px]"
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
                  whileInView={{ opacity: 0.9, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2 }}
                  className="font-sans text-lg md:text-2xl font-normal leading-relaxed max-w-2xl border-l-2 border-current/25 pl-8 mt-32"
                >
                  Especializado en <motion.span style={{ color: dynamicSecondary }} className="italic font-semibold">herramientas IA</motion.span>.
                </motion.p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.75 }}
                viewport={{ once: true }}
                className="w-full md:w-1/3 flex flex-col items-start md:items-end text-left md:text-right"
              >
                <div className="text-[11px] font-mono uppercase tracking-widest leading-loose font-medium">
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
              className="absolute bottom-[-10rem] left-0 flex flex-col items-start gap-4"
              aria-hidden="true"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-current opacity-30" />
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-70 font-semibold">DESLIZA PARA COMENZAR</span>
              </div>
              <div className="h-20 w-px bg-gradient-to-b from-current to-transparent opacity-40 ml-6 relative overflow-hidden">
                <motion.div 
                  animate={{ y: ["-100%", "400%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ backgroundColor: invertedColor }}
                  className="absolute top-0 left-0 w-full h-1/4 blur-[1px]"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="px-8 mb-52 pt-16">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeInUp} className="mb-20">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-70 font-bold">02 // CAPACIDADES</span>
                <div className="w-12 h-px bg-current opacity-25" />
              </div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.h2 style={{ color: invertedColor }} className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                  <motion.span style={{ color: dynamicSecondary }}>SER</motion.span>VICIOS
                </motion.h2>
                <p className="font-sans text-sm md:text-base max-w-md opacity-85 leading-relaxed font-normal">
                  Soluciones digitales integrales diseñadas para acelerar proyectos mediante tecnología IA, automatización y consultoría estratégica de vanguardia.
                </p>
              </div>
            </motion.div>

            {/* Grid of Services */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {services.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.19, 1, 0.22, 1] }}
                    style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                    className="group relative flex flex-col justify-between p-8 md:p-10 rounded-2xl border transition-all duration-500 hover:shadow-2xl backdrop-blur-md"
                  >
                    {/* Card Corner Tech Decor */}
                    <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-2xl">
                      <motion.div 
                        style={{ borderColor: dynamicSecondary }} 
                        className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 opacity-60 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>

                    <div>
                      {/* Header: Index & Icon */}
                      <div className="flex items-center justify-between mb-8">
                        <span className="font-mono text-xs tracking-[0.4em] opacity-65 uppercase font-semibold">
                          // {service.id}
                        </span>
                        <motion.div 
                          style={{ borderColor: cardBorder }} 
                          className="w-10 h-10 rounded-lg flex items-center justify-center border bg-current/5 group-hover:scale-105 transition-transform"
                        >
                          <Icon size={18} style={{ color: invertedColor }} className="transition-transform group-hover:scale-110" />
                        </motion.div>
                      </div>

                      {/* Title & Tagline */}
                      <motion.h3 style={{ color: invertedColor }} className="font-display text-2xl md:text-3xl font-black tracking-tight uppercase italic mb-3">
                        {service.title}
                      </motion.h3>
                      <motion.p style={{ color: dynamicSecondary }} className="text-xs uppercase tracking-widest font-mono mb-6 font-semibold opacity-95">
                        {service.tagline}
                      </motion.p>

                      {/* Product Image if available */}
                      {service.image && (
                        <div className="relative mb-6 rounded-xl overflow-hidden border border-current/15 bg-black/20 group/img aspect-[16/9]">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[9px] uppercase tracking-wider bg-black/75 backdrop-blur-md border border-white/20 text-white font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              SOPORTE FÍSICO NFC + QR
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <p className="font-sans text-sm leading-relaxed opacity-85 mb-8 font-normal">
                        {service.description}
                      </p>

                      {/* Divider */}
                      <div className="w-full h-px bg-current opacity-15 mb-6" />

                      {/* Capabilities list */}
                      <div className="space-y-3 mb-10">
                        <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-65 font-bold block mb-2">
                          ÁREAS CLAVE
                        </span>
                        {service.capabilities.map((cap) => (
                          <div key={cap} className="flex items-start gap-3 text-xs opacity-90 font-medium">
                            <motion.span style={{ color: dynamicSecondary }} className="font-mono font-bold mt-0.5" aria-hidden="true">+</motion.span>
                            <span className="font-sans leading-snug">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.a
                      href={`https://wa.me/34648227195?text=${encodeURIComponent(service.whatsappMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ borderColor: cardBorder }}
                      className="flex items-center justify-between w-full px-5 py-3.5 rounded-lg border bg-current/[0.03] hover:bg-current/[0.08] group/btn transition-all duration-300 font-sans text-xs font-bold tracking-widest uppercase hover:scale-[1.01]"
                      aria-label={`${service.actionText} vía WhatsApp`}
                    >
                      <span style={{ color: textColor }}>{service.actionText}</span>
                      <ArrowUpRight size={16} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" style={{ color: invertedColor }} />
                    </motion.a>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mt-20 px-8 py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <motion.div {...fadeInUp}>
                <motion.h2 
                  style={{ color: invertedColor }}
                  className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-none tracking-tighter mb-12 uppercase italic"
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
                      <span className="font-sans text-[10px] opacity-70 font-bold uppercase tracking-wider block mb-1">{item.label}</span>
                      {item.href ? (
                        <motion.a 
                          style={{ color: textColor }}
                          className="font-headline text-2xl md:text-3xl font-normal hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current transition-all" 
                          href={item.href}
                          aria-label={`Contactar vía ${item.label}: ${item.value}`}
                        >
                          {item.value}
                        </motion.a>
                      ) : (
                        <motion.span style={{ color: textColor }} className="font-headline text-2xl md:text-3xl font-normal">{item.value}</motion.span>
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
                  style={{ backgroundColor: invertedColor, color: useTransform(invertedColor, (v: string) => v === "#ffffff" ? "#07132b" : "#ffffff") }}
                  className="flex items-center justify-center gap-4 px-8 py-6 rounded-md font-sans text-sm tracking-[0.2em] font-bold hover:opacity-85 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                  aria-label="Contactar por WhatsApp"
                >
                  <MessageCircle size={20} />
                  WHATSAPP
                </motion.a>
                <motion.a 
                  href="https://www.instagram.com/hectoor.martin?igsh=aXhucHl0cGUxZnFt&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: invertedColor, color: useTransform(invertedColor, (v: string) => v === "#ffffff" ? "#07132b" : "#ffffff") }}
                  className="flex items-center justify-center gap-4 px-8 py-6 rounded-md font-sans text-sm tracking-[0.2em] font-bold hover:opacity-85 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
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
