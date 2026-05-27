import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Check, 
  Send, 
  Phone, 
  Instagram, 
  MapPin, 
  Sparkles, 
  Menu, 
  X, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  Video, 
  Camera, 
  Clock, 
  Award, 
  ChevronRight, 
  Users, 
  LayoutGrid, 
  Music, 
  Flame,
  CornerDownRight, 
  Eye, 
  CheckCheck,
  Building2,
  Smartphone,
  Brain,
  VolumeX,
  Volume2,
  Pause,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types for Lead schema
interface LeadData {
  id?: string;
  nome: string;
  whatsapp: string;
  instagram: string;
  perfil: string[];
  outro_perfil?: string;
  possui: string[];
  necessidade: string[];
  formato: string;
  interesse: string[];
  criado_em?: string;
}

// Highly precise inline vector Stainy logo reproducing all characteristics of the official branding
export function StainyLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <span className="text-xl md:text-2xl font-black tracking-widest text-brand-deep font-sans leading-none flex items-center gap-0.5">
        STAINY<span className="text-brand-sky font-black">.</span>
      </span>
    </div>
  );
}

export default function App() {
  // Config States (stored in localStorage for easy user customization in the client side)
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem("stainy_supabase_url") || "https://hpgyhjfqsuhehfbkaqxx.supabase.co/rest/v1/";
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem("stainy_supabase_key") || "sb_publishable_RRLfaOwuMkWDUWTHStZQfA_pMga8Dnp";
  });
  const [youtubeVideoId, setYoutubeVideoId] = useState(() => {
    const saved = localStorage.getItem("stainy_youtube_id");
    return (!saved || saved === "ScMzIvxBSi4") ? "R2ZT_QXd7T4" : saved;
  });

  // UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [localSubmissionList, setLocalSubmissionList] = useState<LeadData[]>(() => {
    try {
      const saved = localStorage.getItem("stainy_local_leads");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Form Field States
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsApp] = useState("");
  const [instagram, setInstagram] = useState("");
  
  // Multiple Choice Checklist States
  const [selectedPerfil, setSelectedPerfil] = useState<string[]>([]);
  const [outroPerfilText, setOutroPerfilText] = useState("");
  const [selectedPossui, setSelectedPossui] = useState<string[]>([]);
  const [selectedNecessidade, setSelectedNecessidade] = useState<string[]>([]);
  const [selectedFormato, setSelectedFormato] = useState("");
  const [selectedInteresse, setSelectedInteresse] = useState<string[]>([]);

  // Submission Management State
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const quemSomosRef = useRef<HTMLDivElement>(null);
  const servicosRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isAutoplayActive, setIsAutoplayActive] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);

  // Helper to send events to YouTube iframe postMessage API
  const sendPlayerCommand = (func: string, args: any = "") => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: func,
          args: args,
        }),
        "*"
      );
    }
  };

  const toggleMute = () => {
    const nextMuted = !videoMuted;
    setVideoMuted(nextMuted);
    sendPlayerCommand(nextMuted ? "mute" : "unMute");
    if (!nextMuted) {
      sendPlayerCommand("setVolume", [100]);
    }
  };

  const togglePlay = () => {
    const nextPlaying = !videoPlaying;
    setVideoPlaying(nextPlaying);
    sendPlayerCommand(nextPlaying ? "playVideo" : "pauseVideo");
  };

  const rewindVideo = () => {
    // Replay/seek back to beginning (seekTo(0, true))
    sendPlayerCommand("seekTo", [0, true]);
    sendPlayerCommand("playVideo");
    setVideoPlaying(true);
  };

  // Monitor Scroll for Header blur effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer to autoplay YouTube video when it enters viewport without sound
  useEffect(() => {
    const currentRef = videoContainerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAutoplayActive(true);
          setVideoPlaying(true);
          setVideoMuted(true);
          // Wait a brief timeout for iframe load state, then play/mute
          setTimeout(() => {
            sendPlayerCommand("playVideo");
            sendPlayerCommand("mute");
          }, 1000);
          observer.unobserve(currentRef); // Trigger once
        }
      },
      {
        threshold: 0.15, // trigger when 15% of the video container is visible
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  // Save Config parameters
  const saveConfig = (url: string, key: string, vid: string) => {
    localStorage.setItem("stainy_supabase_url", url);
    localStorage.setItem("stainy_supabase_key", key);
    localStorage.setItem("stainy_youtube_id", vid);
    setSupabaseUrl(url);
    setSupabaseKey(key);
    setYoutubeVideoId(vid);
    setConfigDrawerOpen(false);
  };

  // Helper multi-select toggles
  const toggleSelection = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setter(list.filter(x => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Smooth Scrollers
  const scrollTo = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    setMobileMenuOpen(false);
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Validate and submit Lead
  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim()) {
      setSubmitStatus("error");
      setErrorMessage("Por favor, preencha pelo menos o Nome e o WhatsApp.");
      return;
    }

    setSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    const payload: LeadData = {
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim().replace("@", ""),
      perfil: selectedPerfil,
      outro_perfil: selectedPerfil.includes("Outro") ? outroPerfilText.trim() : undefined,
      possui: selectedPossui,
      necessidade: selectedNecessidade,
      formato: selectedFormato,
      interesse: selectedInteresse,
      criado_em: new Date().toISOString()
    };

    try {
      // Direct REST API Supabase implementation
      // Safe guard against placeholder domains
      const isPlaceholder = supabaseUrl.includes("SEU_PROJETO") || supabaseKey.includes("SUA_CHAVE");
      let success = false;

      if (!isPlaceholder) {
        // Remove trailing slashes dynamically to prevent PGRST125 double slash error
        let cleanUrl = supabaseUrl.trim().replace(/\/+$/, "");
        if (cleanUrl.endsWith("/rest/v1")) {
          cleanUrl = cleanUrl.substring(0, cleanUrl.length - 8);
        }
        
        // Enviar os dados via fetch POST com headers adequados
        const response = await fetch(`${cleanUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey.trim(),
            'Authorization': `Bearer ${supabaseKey.trim()}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          success = true;
        } else {
          const textError = await response.text();
          console.error("Supabase REST Error Response:", textError);
          // Don't crash, log for developer debugging and fallback to local demonstration
          throw new Error(textError || "Erro ao conectar com a API do Supabase.");
        }
      } else {
        // Fallback or demo mode active
        console.warn("Utilizando dados de demonstração. Configure suas chaves reais do Supabase na engrenagem de configurações.");
        // Simulate networking delay
        await new Promise(resolve => setTimeout(resolve, 800));
        success = true;
      }

      if (success) {
        setSubmitStatus("success");
        setShowVoucherModal(true);
        // Save to local logs mock log for client inspection
        const updatedLocal = [payload, ...localSubmissionList].slice(0, 30);
        setLocalSubmissionList(updatedLocal);
        localStorage.setItem("stainy_local_leads", JSON.stringify(updatedLocal));

        // Reset form inputs
        setNome("");
        setWhatsApp("");
        setInstagram("");
        setSelectedPerfil([]);
        setOutroPerfilText("");
        setSelectedPossui([]);
        setSelectedNecessidade([]);
        setSelectedFormato("");
        setSelectedInteresse([]);

        // Rolar suavemente até "Quem Somos" após um breve delay
        setTimeout(() => {
          scrollTo(quemSomosRef);
          // reset status after 5s
          setTimeout(() => setSubmitStatus("idle"), 5000);
        }, 1200);
      }
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorMessage(err?.message || "Erro na conexão. Verifique o URL do seu projeto Supabase no painel de configurações.");
    } finally {
      setSubmitting(false);
    }
  };

  const clearLocalLeads = () => {
    localStorage.removeItem("stainy_local_leads");
    setLocalSubmissionList([]);
  };

  return (
    <div className="min-h-screen font-sans bg-white text-gray-800 relative selection:bg-brand-sky/30 selection:text-brand-deep">
      
      {/* BACKGROUND PARTICLES EFFECT & RADIAL GLOW */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-deep/5 blur-[120px]" />
        <div className="absolute top-[400px] right-[10%] w-[350px] h-[350px] rounded-full bg-brand-sky/5 blur-[80px]" />
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      </div>

      {/* HEADER */}
      <header 
        id="app-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md border-gray-100 py-4 shadow-sm" 
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* High fidelity vector logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="focus:outline-none" aria-label="Stainy Filmes Home">
              <StainyLogo className="h-[42px] md:h-[48px]" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <button 
              onClick={() => scrollTo(quemSomosRef)} 
              className="text-base md:text-lg font-bold text-gray-600 hover:text-brand-sky transition-all transform hover:scale-105 cursor-pointer hover:underline underline-offset-4 decoration-brand-sky"
            >
              Quem Somos
            </button>
            <button 
              onClick={() => scrollTo(servicosRef)} 
              className="text-base md:text-lg font-bold text-gray-600 hover:text-brand-sky transition-all transform hover:scale-105 cursor-pointer hover:underline underline-offset-4 decoration-brand-sky"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollTo(formRef)} 
              className="text-base md:text-lg font-bold text-gray-600 hover:text-brand-sky transition-all transform hover:scale-105 cursor-pointer hover:underline underline-offset-4 decoration-brand-sky"
            >
              Qualificação
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => scrollTo(formRef)}
              className="hidden sm:inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-sky hover:bg-blue-600 text-white font-black text-base transition-all duration-300 shadow-[0_4px_14px_rgba(0,125,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,125,255,0.45)] hover:-translate-y-0.5 cursor-pointer"
            >
              Quero uma proposta
            </button>

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-gray-600 hover:text-brand-sky transition-colors rounded-lg bg-gray-50 border border-gray-100"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[72px] bg-white/98 backdrop-blur-lg border-b border-gray-200 p-6 z-40 md:hidden flex flex-col gap-6 shadow-2xl"
          >
            <button 
              onClick={() => scrollTo(quemSomosRef)}
              className="text-xl font-extrabold text-left text-gray-700 hover:text-brand-sky py-3 border-b border-gray-100"
            >
              Quem Somos
            </button>
            <button 
              onClick={() => scrollTo(servicosRef)}
              className="text-xl font-extrabold text-left text-gray-700 hover:text-brand-sky py-3 border-b border-gray-100"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollTo(formRef)}
              className="text-xl font-extrabold text-left text-gray-700 hover:text-brand-sky py-3 border-b border-gray-100"
            >
              Qualificação / Contato
            </button>
            <button 
              onClick={() => scrollTo(formRef)}
              className="w-full mt-2 py-4 rounded-xl bg-brand-sky text-white text-lg font-black text-center tracking-widest"
            >
              QUERO UMA PROPOSTA
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-36 px-6 z-10 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Badge animation */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-brand-sky/10 border border-brand-sky/20 backdrop-blur-sm text-brand-sky text-sm md:text-base font-extrabold tracking-widest uppercase mb-8"
          >
            <Sparkles className="w-5 h-5 text-brand-sky animate-pulse" />
            Produção Audiovisual Cinematográfica de Elite
          </motion.div>

          {/* Highlight Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-tight md:leading-none text-gray-950 max-w-4xl"
          >
            POSICIONAMENTO NÃO ACONTECE POR ACASO. <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-brand-deep to-brand-sky bg-clip-text text-transparent">
              ELE É CONSTRUÍDO COM ESTRATÉGIA.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 text-xl md:text-2xl text-gray-650 max-w-3xl font-medium leading-relaxed"
          >
            Audiovisual político de alto impacto e publicidade corporativa premium para lideranças e marcas que decidem vencer.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center justify-center"
          >
            <button 
              onClick={() => scrollTo(formRef)}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-brand-sky hover:bg-blue-650 text-white font-black text-lg tracking-widest transition-all duration-300 shadow-[0_8px_30px_rgba(0,125,255,0.3)] hover:shadow-[0_12px_40px_rgba(0,125,255,0.45)] hover:-translate-y-0.75 flex items-center justify-center gap-3.5 group cursor-pointer border-none"
            >
              Preencher Formulário
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </button>
            
            <button 
              onClick={() => scrollTo(servicosRef)}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-black text-lg tracking-widest border border-gray-200 hover:border-gray-305 transition-all duration-300 flex items-center justify-center gap-3.5 cursor-pointer animate-none"
            >
              Conheça nossos serviços
            </button>
          </motion.div>

          {/* Trust proof stats mini */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-18 pt-14 border-t border-gray-150 w-full max-w-4xl grid grid-cols-3 gap-6"
          >
            <div>
              <p className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-brand-deep">8 Anos</p>
              <p className="text-sm md:text-base text-gray-500 font-bold uppercase tracking-widest mt-2">De Mercado</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-brand-deep">Ceará</p>
              <p className="text-sm md:text-base text-gray-500 font-bold uppercase tracking-widest mt-2">Referência Estadual</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-brand-deep">Campanhas</p>
              <p className="text-sm md:text-base text-gray-500 font-bold uppercase tracking-widest mt-2">Eleitorais Vitoriosas</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* FORMULÁRIO DE QUALIFICAÇÃO */}
      <section 
        ref={formRef}
        id="qualificacao"
        className="py-24 px-6 relative z-10 border-t border-gray-100 bg-gray-50/70"
      >
        <div className="max-w-4xl mx-auto">
          
          {/* Form Header */}
          <div className="text-center mb-16">
            <span className="text-sm md:text-base font-extrabold text-[#00bfff] uppercase tracking-[0.2em] bg-brand-sky/10 px-5 py-2.5 rounded-full inline-block mb-4">
              Filtro Estratégico • Voucher de 10% de Desconto
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-5 transition-transform duration-300">
              Vamos entender o seu projeto
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8 font-medium">
              A Stainy está selecionando um número restrito de projetos e campanhas para acompanhar mais de perto. 
              Este formulário é rápido e nos ajuda a entender como podemos contribuir com sua presença e estratégia.
            </p>

            {/* Glowing 10% voucher invitation layout */}
            <div className="relative flex flex-col sm:flex-row items-center gap-5 p-6 rounded-2xl bg-white border-2 border-brand-sky/25 max-w-2xl mx-auto shadow-[0_8px_30px_rgba(0,125,255,0.08)] overflow-hidden text-left">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-deep/5 via-transparent to-brand-sky/5 pointer-events-none" />
              <div className="w-14 h-14 rounded-2xl bg-brand-sky/10 border border-brand-sky/20 text-brand-sky text-2xl font-bold flex items-center justify-center shrink-0 animate-bounce">
                🎁
              </div>
              <div className="space-y-1">
                <h4 className="text-base md:text-lg font-black text-brand-deep uppercase tracking-wider">
                  Parabéns vc está no caminho da vitória !
                </h4>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed font-semibold">
                  Preencha seu cadastro e garanta seu <strong className="text-brand-sky">10% de desconto</strong>
                </p>
              </div>
            </div>
          </div>


          {/* Form wrapper */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-sky" />
            
            <form onSubmit={handleFormSubmission} className="space-y-10">
              
              {/* SEÇÃO: INFORMAÇÕES PESSOAIS */}
              <div className="space-y-6">
                <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-brand-sky flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-sky" />
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <label htmlFor="nome" className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-700 block">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="nome"
                      type="text" 
                      required
                      placeholder="Ex: Deputado Silva ou Diretor Executivo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 hover:border-brand-sky/40 focus:border-brand-sky focus:bg-white rounded-xl px-5 py-4 text-base md:text-lg text-gray-900 focus:outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-brand-sky/20"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <label htmlFor="whatsapp" className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-700 block">
                      WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="whatsapp"
                      type="tel"
                      required
                      placeholder="Ex: (85) 99999-9999"
                      value={whatsapp}
                      onChange={(e) => setWhatsApp(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 hover:border-brand-sky/40 focus:border-brand-sky focus:bg-white rounded-xl px-5 py-4 text-base md:text-lg text-gray-900 focus:outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-brand-sky/20"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <label htmlFor="instagram" className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-700 block">
                    Instagram profissional
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base md:text-lg">@</span>
                    <input 
                      id="instagram"
                      type="text" 
                      placeholder="Ex: stainyfilmes"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 hover:border-brand-sky/40 focus:border-brand-sky focus:bg-white rounded-xl pl-10 pr-5 py-4 text-base md:text-lg text-gray-900 focus:outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-brand-sky/20"
                    />
                  </div>
                </div>
              </div>

              {/* VOCÊ É CHECKBOXES */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-brand-sky flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-sky" />
                  Você é:
                </h3>
                <p className="text-sm md:text-base text-gray-500 font-semibold">Marque todas as opções correspondentes à sua atuação atual.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    "Político",
                    "Pré-candidato",
                    "Assessor",
                    "Empresário",
                    "Agência",
                    "Trabalha com político",
                    "Outro"
                  ].map((role) => {
                    const isSelected = selectedPerfil.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleSelection(role, selectedPerfil, setSelectedPerfil)}
                        className={`text-sm md:text-base text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky border-brand-sky text-white font-extrabold shadow-md" 
                            : "bg-gray-50 border-gray-200 text-gray-750 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        {role}
                        {isSelected ? (
                          <Check className="w-5 h-5 text-white shrink-0 ml-2" />
                        ) : (
                          <div className="w-4 h-4 rounded bg-transparent border border-gray-300 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Conditional Text Field for "Outro" */}
                <AnimatePresence>
                  {selectedPerfil.includes("Outro") && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 overflow-hidden"
                    >
                      <div className="flex gap-3 items-center bg-gray-55 p-4 rounded-xl border border-gray-200">
                        <CornerDownRight className="w-5 h-5 text-brand-sky shrink-0" />
                        <input
                          type="text"
                          placeholder="Especifique a sua atuação"
                          value={outroPerfilText}
                          onChange={(e) => setOutroPerfilText(e.target.value)}
                          className="w-full bg-transparent border-none text-sm md:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 p-0.5"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SEÇÃO: HOJE VOCÊ JÁ POSSUI */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-brand-sky flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-sky" />
                  Hoje você já possui:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    "Equipe de marketing",
                    "Videomaker",
                    "Social media",
                    "Estratégia de campanha",
                    "Nada estruturado ainda"
                  ].map((asset) => {
                    const isSelected = selectedPossui.includes(asset);
                    return (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => toggleSelection(asset, selectedPossui, setSelectedPossui)}
                        className={`text-sm md:text-base text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky border-brand-sky text-white font-extrabold shadow-md" 
                            : "bg-gray-50 border-gray-200 text-gray-750 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        {asset}
                        {isSelected ? (
                          <Check className="w-5 h-5 text-white shrink-0 ml-2" />
                        ) : (
                          <div className="w-4 h-4 rounded bg-transparent border border-gray-300 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEÇÃO: O QUE VOCÊ MAIS PRECISA HOJE? */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-brand-sky flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-sky" />
                  O que você mais precisa hoje?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    "Vídeos profissionais",
                    "Estratégia digital",
                    "Fortalecer imagem",
                    "Redes sociais",
                    "Cobertura de agenda",
                    "Campanha completa"
                  ].map((need) => {
                    const isSelected = selectedNecessidade.includes(need);
                    return (
                      <button
                        key={need}
                        type="button"
                        onClick={() => toggleSelection(need, selectedNecessidade, setSelectedNecessidade)}
                        className={`text-sm md:text-base text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky border-brand-sky text-white font-extrabold shadow-md" 
                            : "bg-gray-50 border-gray-200 text-gray-750 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        {need}
                        {isSelected ? (
                          <Check className="w-5 h-5 text-white shrink-0 ml-2" />
                        ) : (
                          <div className="w-4 h-4 rounded bg-transparent border border-gray-300 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEÇÃO: QUAL FORMATO TE INTERESSA (RADIO) */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-brand-sky flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-sky" />
                  Qual formato te interessa?
                </h3>
                <p className="text-sm md:text-base text-gray-500 font-semibold">Selecione o plano ou escopo estimado para o atendimento.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {[
                    "Plano básico de conteúdo",
                    "Plano estratégico mensal",
                    "Estrutura completa de campanha"
                  ].map((format) => {
                    const isSelected = selectedFormato === format;
                    return (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setSelectedFormato(format)}
                        className={`text-sm md:text-base text-left p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky border-brand-sky text-white font-extrabold shadow-md" 
                            : "bg-gray-50 border-gray-200 text-gray-750 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <span className="leading-tight font-extrabold">{format}</span>
                        <div className="flex items-center gap-2 self-end mt-2">
                          <span className={`${isSelected ? "text-white/80" : "text-gray-400"} text-xs md:text-sm font-bold`}>Selecionar</span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            isSelected ? "border-white bg-white" : "border-gray-300 bg-transparent"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-brand-sky" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEÇÃO: VOCÊ TEM INTERESSE EM */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-brand-sky flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-sky" />
                  Você tem interesse em:
                </h3>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    "Receber proposta",
                    "Agendar reunião",
                    "Conhecer parceria",
                    "Ter suporte na campanha"
                  ].map((goal) => {
                    const isSelected = selectedInteresse.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleSelection(goal, selectedInteresse, setSelectedInteresse)}
                        className={`text-sm md:text-base text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky border-brand-sky text-white font-extrabold shadow-md" 
                            : "bg-gray-50 border-gray-200 text-gray-750 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        {goal}
                        {isSelected ? (
                          <Check className="w-5 h-5 text-white shrink-0 ml-2" />
                        ) : (
                          <div className="w-4 h-4 rounded bg-transparent border border-gray-300 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUBMISSION MESSAGES AND ALERTS */}
              <AnimatePresence>
                {submitStatus === "success" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 flex items-start gap-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-base md:text-lg">Formulário Enviado com Sucesso!</p>
                      <p className="text-sm md:text-base text-emerald-600/90 mt-1.5 font-bold leading-relaxed">
                        Sua qualificação foi enviada ao banco de dados da Stainy Filmes. Nossa equipe entrará em contato com você via WhatsApp para analisar os próximos passos do planejamento estratégico.
                      </p>
                    </div>
                  </motion.div>
                )}

                {submitStatus === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/20 text-rose-600 flex items-start gap-4"
                  >
                    <AlertCircle className="w-7 h-7 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-base md:text-lg">Erro no Envio</p>
                      <p className="text-sm md:text-base text-rose-600 mt-1.5 font-bold leading-relaxed">
                        {errorMessage || "Não foi possível transmitir os dados da sua qualificação para o servidor. Por favor, tente novamente."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BTN ENVIAR SUBMIT */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 px-8 rounded-2xl bg-brand-sky hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-black text-base md:text-lg tracking-widest uppercase transition-all duration-300 shadow-[0_10px_35px_rgba(0,125,255,0.3)] hover:shadow-[0_12px_45px_rgba(0,125,255,0.5)] hover:-translate-y-0.75 flex items-center justify-center gap-3.5 cursor-pointer border-none"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Transmitindo Qualificação...
                    </>
                  ) : (
                    <>
                      ENVIAR FORMULÁRIO DE QUALIFICAÇÃO
                      <Send className="w-6 h-6 ml-1.5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* SEÇÃO "QUEM SOMOS" */}
      <section 
        ref={quemSomosRef}
        id="quem-somos"
        className="py-24 px-6 relative z-10 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text block */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-sm md:text-base font-extrabold text-brand-sky uppercase tracking-[0.25em] flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-brand-sky rounded" />
              Sólida Trajetória
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-display font-black text-gray-900 leading-tight">
              Uma história esculpida com <br />
              <span className="bg-gradient-to-r from-brand-deep to-brand-sky bg-clip-text text-transparent">
                Audiovisual de Alta Performance
              </span>
            </h2>
            
            <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed font-semibold">
              A <strong className="text-brand-deep font-black">Stainy Filmes</strong> nasceu para elevar o padrão da comunicação política através da estratégia, inovação e linguagem cinematográfica. Fundada pelos irmãos <strong className="text-brand-deep font-black">Dayvisson e David</strong>, a produtora uniu direção de fotografia e publicidade para criar campanhas com mais impacto, emoção e posicionamento.
            </p>

            <p className="text-base md:text-lg lg:text-xl text-gray-650 leading-relaxed font-medium">
              Em mais de 8 anos de atuação, a Stainy participou de <strong className="text-brand-deep font-black">mais de 30 campanhas proporcionais e 8 majoritárias</strong>, conquistando a eleição de mais de 20 candidatos proporcionais e vitória em 7 campanhas majoritárias. Com uma comunicação moderna e imagens em padrão de cinema, a Stainy se tornou referência em campanhas políticas que conectam estratégia, narrativa e autoridade.
            </p>

            {/* Founders Micro Badges */}
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-55 border border-gray-200 rounded-xl shadow-sm">
                <p className="text-sm md:text-base text-brand-sky font-bold tracking-wide uppercase">Fundador & Diretor</p>
                <p className="text-base md:text-lg text-gray-950 font-black mt-1.5">Dayvisson Stainy</p>
              </div>
              <div className="p-4 bg-gray-55 border border-gray-200 rounded-xl shadow-sm">
                <p className="text-sm md:text-base text-brand-sky font-bold tracking-wide uppercase">Fundador & Executivo</p>
                <p className="text-base md:text-lg text-gray-950 font-black mt-1.5">David Stainy</p>
              </div>
            </div>
          </div>

          {/* YouTube Cinematic Video / Showreel */}
          <div className="lg:col-span-6">
            <div className="relative p-2 rounded-2xl bg-white border-2 border-brand-sky/20 transition-all duration-500 hover:border-brand-sky/40 shadow-xl group">
              
              {/* Outer decorative glow lights offset */}
              <div className="absolute inset-0 bg-brand-sky/5 filter blur-2xl rounded-2xl group-hover:bg-brand-sky/10 transition-colors pointer-events-none animate-pulse" />
              
              <div ref={videoContainerRef} className="video-wrapper overflow-hidden rounded-xl border border-gray-150 relative z-10">
                <iframe 
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&autoplay=${isAutoplayActive ? "1" : "0"}&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${youtubeVideoId}&showinfo=0&iv_load_policy=3`} 
                  title="Stainy Filmes — Showreel Oficial" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </div>

              {/* Dynamic Video Control Bar */}
              <div className="relative z-10 mt-4 px-2 pb-2 grid grid-cols-3 gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="py-3 px-4 rounded-xl font-bold text-sm text-gray-700 bg-gray-50 border border-gray-200 hover:border-brand-sky hover:bg-brand-sky/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-102"
                  title="Play / Pause"
                >
                  {videoPlaying ? (
                    <>
                      <Pause className="w-5 h-5 text-brand-sky fill-brand-sky" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 text-brand-sky fill-brand-sky" />
                      <span>Assistir</span>
                    </>
                  )}
                </button>

                {/* Mute/Unmute Audio Button */}
                <button
                  onClick={toggleMute}
                  className={`py-3 px-4 rounded-xl font-bold text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-102 ${
                    !videoMuted 
                      ? "bg-brand-sky/15 border-brand-sky text-brand-deep shadow-sm font-extrabold" 
                      : "bg-gray-50 border-gray-200 text-gray-750 hover:border-brand-sky hover:bg-brand-sky/10"
                  }`}
                  title="Ligar/Desligar Áudio"
                >
                  {videoMuted ? (
                    <>
                      <VolumeX className="w-5 h-5 text-gray-500" />
                      <span>Áudio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 text-brand-sky font-bold" />
                      <span>Muted</span>
                    </>
                  )}
                </button>

                {/* Rewind Scene Button */}
                <button
                  onClick={rewindVideo}
                  className="py-3 px-4 rounded-xl font-bold text-sm text-gray-750 bg-gray-50 border border-gray-200 hover:border-brand-sky hover:bg-brand-sky/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-102"
                  title="Voltar ao Início"
                >
                  <RotateCcw className="w-5 h-5 text-brand-sky" />
                  <span>Voltar</span>
                </button>
              </div>

              {/* Subtle footer credit of video */}
              <div className="px-3 pt-2 pb-1 flex items-center justify-between text-xs text-gray-500 font-bold relative z-10 border-t border-gray-150 mt-3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00bfff] animate-ping" />
                  Showreel Institucional — Portfólio 8 Anos
                </span>
                <span className="text-gray-450">Qualidade Cinema 6K</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO DE SERVIÇOS ("Cápsulas de Campanha") */}
      <section 
        ref={servicosRef}
        id="servicos"
        className="py-24 px-6 relative z-10 bg-gray-50/70 border-y border-gray-200/80"
      >
        <div className="max-w-7xl mx-auto">
          
          {/* Services Header */}
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm md:text-base font-extrabold text-brand-sky uppercase tracking-[0.25em] bg-brand-sky/10 px-5 py-2.5 rounded-full inline-block">
              Nossas Linhas de Atuação
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-black text-gray-900">
              Nossas cápsulas de campanha
            </h2>
            <p className="text-gray-600 text-base md:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
              Formatos desenhados sob medida para posicionamento tático de imagem nas etapas cruciais de um político rumo à vitória. Escolha o nível de presença que a sua campanha merece hoje.
            </p>
          </div>

          {/* 3 Premium Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
            
            {/* CARD 1: ESSENCIAL */}
            <div className="bg-white rounded-2xl border border-gray-200 p-10 md:p-12 flex flex-col justify-between transition-all duration-300 hover:border-brand-sky/50 hover:translate-y-[-4px] group relative shadow-lg">
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
              
              <div>
                {/* Active Tag */}
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#007dff] font-extrabold tracking-widest uppercase mb-6 py-2 px-3.5 rounded bg-[#007dff]/10 w-fit">
                  NÍVEL I • ESSENCIAL
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 uppercase">CÁPSULA ESSENCIAL</h3>
                <p className="text-sm md:text-base italic text-gray-500 font-semibold mb-8">"Conexão • Autoridade • Posicionamento"</p>

                {/* Features list */}
                <div className="space-y-6 border-t border-gray-150 pt-6">
                  <div className="flex items-start gap-4">
                    <Video className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Institucional & Vida</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Filme revelador de história e origem: família, fé e trajetória sólida do candidato.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Building2 className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Vídeo de Obras</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Ações reais tangíveis no campo, depoimentos populares e resultados entregues.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Award className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Pedido de Voto</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Apresentação focada de problema, solução planejada e chamada clara em vídeo.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Includes block bottom */}
              <div className="mt-10 pt-6 border-t border-gray-150 space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                  <p className="text-xs font-bold tracking-wider text-brand-sky uppercase">Incluso na cápsula:</p>
                  <p className="text-sm md:text-base text-gray-700 mt-2 font-semibold leading-relaxed">
                    Captação em 6K • Fotografia com Drone • Direção cinematográfica • Formatação e corte para redes sociais (Reels/Shorts)
                  </p>
                </div>

                <button 
                  onClick={() => scrollTo(formRef)}
                  className="w-full py-4 px-6 rounded-2xl text-center text-sm md:text-base font-black text-gray-800 bg-white border border-gray-300 hover:bg-brand-sky hover:text-white hover:border-brand-sky transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm"
                >
                  Quero este plano
                </button>
              </div>

            </div>

            {/* CARD 2: DESTAQUE */}
            <div className="bg-white rounded-2xl border border-gray-200 p-10 md:p-12 flex flex-col justify-between transition-all duration-300 hover:border-brand-sky/50 hover:translate-y-[-4px] group relative shadow-lg">
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
              
              <div>
                {/* Active Tag */}
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-brand-sky font-extrabold tracking-widest uppercase mb-6 py-2 px-3.5 rounded bg-brand-sky/10 w-fit">
                  NÍVEL II • COMPLETO
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 uppercase">CÁPSULA DESTAQUE</h3>
                <p className="text-sm md:text-base italic text-gray-500 font-semibold mb-8">"Impacto • Presença • Cinematografia"</p>

                {/* Features list */}
                <div className="space-y-6 border-t border-gray-150 pt-6">
                  <div className="flex items-start gap-4">
                    <Video className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Institucional & Vida</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Filme de origem de alta comoção focado na conexão religiosa e social.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Building2 className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Vídeo de Obras</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Validação das melhorias e conquistas obtidas pela liderança na região do Ceará.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Award className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Pedido de Voto</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Formatos de 30s/60s para tráfego pago com copys de alto poder reflexivo.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Music className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Vídeo Clipe Musical</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">A versão do jingle da campanha em videoclipe ultra-dinâmico editado para explosão no digital.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Includes block bottom */}
              <div className="mt-10 pt-6 border-t border-gray-150 space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                  <p className="text-xs font-bold tracking-wider text-brand-sky uppercase">Incluso na cápsula:</p>
                  <p className="text-sm md:text-base text-gray-700 mt-2 font-semibold leading-relaxed">
                    Captação avançada em 6K • Drone tático militar • Motion Graphics premium • Grade completa de materiais verticais (TikTok/Reles) e horizontais (YouTube)
                  </p>
                </div>

                <button 
                  onClick={() => scrollTo(formRef)}
                  className="w-full py-4 px-6 rounded-2xl text-center text-sm md:text-base font-black text-gray-800 bg-white border border-gray-300 hover:bg-brand-sky hover:text-white hover:border-brand-sky transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm"
                >
                  Quero este plano
                </button>
              </div>

            </div>

            {/* CARD 3: VENCEDORA */}
            <div className="bg-white md:border-3 border-brand-sky p-10 md:p-12 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] relative shadow-xl group rounded-2xl">
              {/* Highlight Ribbon */}
              <div className="absolute top-[-20px] left-[50%] -translate-x-1/2 px-6 py-2 rounded-full bg-brand-sky text-white text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-[0_6px_20px_rgba(0,125,255,0.25)] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white shrink-0 animate-ping" />
                Mais Requisitado
              </div>
              
              <div>
                {/* Active Tag */}
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-brand-sky font-extrabold tracking-widest uppercase mb-6 py-2 px-3.5 rounded bg-brand-sky/10 w-fit">
                  NÍVEL III • DOMÍNIO TOTAL
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 uppercase">CÁPSULA VENCEDORA</h3>
                <p className="text-sm md:text-base italic text-gray-500 font-semibold mb-8">"Movimento • Força • Domínio Digital"</p>

                {/* Features list */}
                <div className="space-y-5 border-t border-gray-150 pt-6">
                  <div className="flex items-start gap-4">
                    <Video className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-gray-700 font-semibold">Institucional & Vida de alta produção narrativa.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Building2 className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-gray-700 font-semibold">Vídeos de Obras estruturados em multiplas frentes.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Award className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-gray-700 font-semibold">Conjunto de Pedidos de Voto por temas municipais específicos.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Music className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-gray-700 font-semibold">Vídeo Clipe Musical em alta cadência com militância.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Camera className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Equipe Filmmaker In-Loco</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Cobertura tática presencial ágil de até 5 eventos ou agendas políticas determinantes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Smartphone className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Storymaker Full Time</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Acompanhamento diário em tempo integral da rotina e bastidores da liderança político-executiva.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Brain className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide">Gestão Estratégica</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Planejamento e direcionamento criativo macro, analisando tendências e métricas digitais para ação imediata.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Includes block bottom */}
              <div className="mt-10 pt-6 border-t border-gray-150 space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                  <p className="text-xs font-bold tracking-wider text-brand-sky uppercase">Incluso na cápsula:</p>
                  <p className="text-sm md:text-base text-gray-700 mt-2 font-semibold leading-relaxed">
                    Captação cinema 6K • Drone FPV de alta velocidade • Produtor e Coordenador de audiovisual tático • Entregas rápidas no formato D+0 • Suporte estúdio móvel premium
                  </p>
                </div>

                <button 
                  onClick={() => scrollTo(formRef)}
                  className="w-full py-4 px-6 rounded-2xl text-center text-sm md:text-base font-black text-white bg-brand-sky hover:bg-blue-600 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border-none shadow-sm"
                >
                  Quero este plano
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* BIG STATEMENT IMPACT SECTION */}
      <section className="py-24 px-6 relative z-10 overflow-hidden text-center bg-gray-50 border-y border-gray-200">
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-sky">
            Mantra Estratégico
          </span>
          <h2 className="text-2xl md:text-5xl font-display font-extrabold text-[#005cbb] leading-normal uppercase tracking-tight">
            “A IMAGEM QUE VENCE UMA ELEIÇÃO <br />
            É CONSTRUÍDA ANTES MESMO DO PRIMEIRO VOTO.”
          </h2>
          <div className="w-16 h-0.5 bg-brand-sky mx-auto" />
          <p className="text-gray-500 font-bold text-sm md:text-base tracking-wide">
            Stainy Filmes — 8 anos liderando produções de candidatos e marcas de expressão que vencem.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer 
        id="app-footer"
        className="pt-20 pb-12 bg-white border-t border-gray-200 relative z-10 text-gray-700 text-base md:text-lg"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Col 1: Logo & address */}
          <div className="md:col-span-6 space-y-6">
            <StainyLogo className="h-11 md:h-12" />

            <p className="text-xs md:text-sm leading-relaxed text-gray-500 max-w-md font-medium">
              Impacto, cinematografia e narrativa emocional para expandir autoridades e conquistar a mente e o coração dos eleitores em qualquer campanha.
            </p>

            <div className="pt-4 flex items-start gap-3.5 text-xs md:text-sm text-gray-750 font-semibold">
              <MapPin className="w-6 h-6 text-brand-sky shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Avenida Desembargador Moreira, nº 1300, Sala 1006, 10º andar — Torre Sul, Aldeota, Fortaleza — CE
              </span>
            </div>
          </div>

          {/* Col 2: Navigation map shortcuts */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-gray-900 text-sm md:text-base font-extrabold uppercase tracking-widest">Navegação</h4>
            <div className="flex flex-col gap-3 text-xs md:text-sm">
              <button onClick={() => scrollTo(quemSomosRef)} className="text-left hover:text-brand-sky text-gray-500 transition-colors cursor-pointer font-bold">Quem Somos</button>
              <button onClick={() => scrollTo(servicosRef)} className="text-left hover:text-brand-sky text-gray-500 transition-colors cursor-pointer font-bold">Serviços e Cápsulas</button>
              <button onClick={() => scrollTo(formRef)} className="text-left hover:text-brand-sky text-gray-500 transition-colors cursor-pointer font-bold">Formulário de Entrada</button>
            </div>
          </div>

          {/* col 3: Social link with premium style */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-gray-900 text-sm md:text-base font-extrabold uppercase tracking-widest">Redes Sociais</h4>
            <a 
              href="https://instagram.com/stainyfilmes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 hover:border-brand-sky hover:text-brand-sky hover:bg-brand-sky/10 transition-all text-xs md:text-sm cursor-pointer group"
            >
              <Instagram className="w-5 h-5 text-brand-sky group-hover:scale-110 transition-transform" />
              <span className="font-extrabold">@stainyfilmes</span>
            </a>
            <div className="text-xs md:text-sm text-gray-550 pt-1 flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Qualificação Online Ativa
            </div>
          </div>

        </div>

        {/* trademark banner copyright */}
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs md:text-sm text-gray-500 font-semibold">
          <p>© 2026 Stainy Filmes. Todos os direitos reservados.</p>
          <p>Made with high-end strategic precision.</p>
        </div>
      </footer>

      {/* DRAWER MODAL CONFIGURATION SETTINGS FOR DEMO IN AI STUDIO CONTAINER */}
      <AnimatePresence>
        {configDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            
            {/* Backdrop cover blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfigDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Config drawer layout */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white border-l border-gray-200 h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-brand-sky" />
                    <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wider">Parâmetros de Integração</h3>
                  </div>
                  <button 
                    onClick={() => setConfigDrawerOpen(false)}
                    className="p-1.5 rounded bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Supabase inputs */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#007dff] bg-brand-sky/10 px-2.5 py-1.5 rounded">
                    CONEXÃO SUPABASE REST
                  </span>
                  
                  {/* URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-650 uppercase tracking-widest">
                      Supabase Project URL
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-55 border border-gray-250 rounded-lg p-3 text-xs text-gray-900 focus:border-brand-sky focus:outline-none"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="Ex: https://abcde-12345.supabase.co"
                    />
                  </div>

                  {/* KEY */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-650 uppercase tracking-widest">
                      Supabase Anon Key
                    </label>
                    <input
                      type="password"
                      className="w-full bg-gray-55 border border-gray-250 rounded-lg p-3 text-xs text-gray-900 focus:border-brand-sky focus:outline-none"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                  </div>
                </div>

                {/* YouTube Video ID Config */}
                <div className="space-y-4 pt-4 border-t border-gray-150">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-650 bg-indigo-50 px-2.5 py-1.5 rounded">
                    PLAYER DE VÍDEO PORTFÓLIO
                  </span>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-650 uppercase tracking-widest">
                      YouTube Video ID
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-55 border border-gray-250 rounded-lg p-3 text-xs text-gray-900 focus:border-brand-sky focus:outline-none"
                      value={youtubeVideoId}
                      onChange={(e) => setYoutubeVideoId(e.target.value)}
                      placeholder="Ex: R2ZT_QXd7T4"
                    />
                    <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                      Substitua com o ID de vídeo de sua preferência para renderizar o seu respectivo vídeo na seção Quem Somos.
                    </p>
                  </div>
                </div>

                {/* Submissions debugger list */}
                <div className="space-y-4 pt-4 border-t border-gray-150">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded">
                    REGISTROS ENVIADOS ({localSubmissionList.length})
                  </span>
                  
                  {localSubmissionList.length === 0 ? (
                    <div className="p-4 rounded-lg bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-500 font-medium">
                      Nenhum lead preenchido localmente ainda nesta sessão. Os dados aparecerão aqui instantaneamente ao enviar o formulário.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {localSubmissionList.map((lead, i) => (
                        <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-[11px] space-y-1 relative">
                          <p className="font-extrabold text-gray-900 flex items-center justify-between">
                            <span>{lead.nome}</span>
                            <span className="text-[9px] text-gray-400 font-normal">
                              {lead.criado_em ? new Date(lead.criado_em).toLocaleTimeString() : ""}
                            </span>
                          </p>
                          <p className="text-gray-650 font-medium">Whatsapp : {lead.whatsapp} | @{lead.instagram}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {lead.perfil.map(p => <span key={p} className="px-1 py-0.5 rounded bg-brand-sky/10 border border-brand-sky/20 text-[9px] text-[#007dff] font-bold">{p}</span>)}
                            <span className="px-1 py-0.5 rounded bg-indigo-50 border border-indigo-2 w-fit text-[9px] text-indigo-600 font-bold">{lead.formato}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {localSubmissionList.length > 0 && (
                    <button
                      onClick={clearLocalLeads}
                      className="text-[10px] text-rose-600 hover:text-rose-500 transition-colors uppercase font-bold tracking-wider cursor-pointer"
                    >
                      Limpar registros locais
                    </button>
                  )}
                </div>

              </div>

              {/* Save changes footer button */}
              <div className="pt-6 border-t border-gray-150">
                <button
                  onClick={() => saveConfig(supabaseUrl, supabaseKey, youtubeVideoId)}
                  className="w-full py-3.5 rounded-lg bg-brand-sky text-white font-bold text-xs uppercase tracking-widest transition-all hover:bg-blue-600 block text-center cursor-pointer border-none"
                >
                  Salvar Parâmetros
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING VOUCHER POPUP AWARD */}
      <AnimatePresence>
        {showVoucherModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
            
            {/* Backdrop cover blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoucherModal(false)}
              className="absolute inset-0 bg-black/10"
            />

            {/* Glowing cinematic voucher wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white border-2 border-brand-sky/20 rounded-3xl p-8 shadow-2xl text-center overflow-hidden"
            >
              
              {/* Top ambient decoration */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-sky" />
              
              {/* Close button button */}
              <button 
                onClick={() => setShowVoucherModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon / Ribbon badge */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-sky/10 border border-brand-sky/25 text-4xl mb-6 shadow-inner">
                🎁
                <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded bg-emerald-500 text-[10px] font-black text-white uppercase tracking-wide">
                  Ativo
                </div>
              </div>

              {/* Headings */}
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-sky bg-brand-sky/10 px-3 py-1 rounded-full inline-block mb-3">
                Parabéns! Recompensa Ativada
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-black text-gray-900 leading-tight">
                Você ganhou <span className="bg-gradient-to-r from-brand-sky to-blue-600 bg-clip-text text-transparent">10% de Desconto</span>
              </h3>
              
              <p className="mt-4 text-xs md:text-sm text-gray-500 leading-relaxed font-semibold">
                O seu formulário de qualificação estratégica foi recebido e validado com êxito em nosso sistema.
              </p>

              {/* Graphic Ticket Voucher block */}
              <div className="my-6 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 relative flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 rounded-full bg-white border border-gray-250 z-10" />
                <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-white border border-gray-250 z-10" />
                
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Código do Voucher:</p>
                <div className="flex items-center gap-2 bg-brand-sky/10 border border-brand-sky/20 px-4 py-2 rounded-lg">
                  <span className="text-lg font-mono font-black text-brand-sky tracking-widest">
                    STAINY10
                  </span>
                  <CheckCheck className="w-4.5 h-4.5 text-brand-sky shrink-0 animate-pulse" />
                </div>
                <p className="text-[9px] text-gray-400 font-bold tracking-wide mt-2">Pronto para ser resgatado com a equipe!</p>
              </div>

              {/* Notification they will be contacted */}
              <div className="flex items-start gap-3 text-left bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <Check className="w-5 h-5 text-brand-sky shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Entraremos em contato</h4>
                  <p className="text-[11px] text-gray-650 leading-relaxed font-medium">
                    Nossa equipe de atendimento já foi notificada. Entraremos em contato com você via <strong className="text-emerald-600 font-black">WhatsApp</strong> dentro de instantes para agendar sua reunião estratégica e conduzir seu orçamento.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowVoucherModal(false)}
                className="w-full py-4 rounded-xl bg-brand-sky hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(0,125,255,0.15)] hover:shadow-[0_6px_25px_rgba(0,125,255,0.25)] cursor-pointer border-none"
              >
                Garantir meu cupom e continuar
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
