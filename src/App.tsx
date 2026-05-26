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
  Brain
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
      <span className="text-xl md:text-2xl font-black tracking-widest text-white font-sans leading-none">
        STAINY
      </span>
    </div>
  );
}

export default function App() {
  // Config States (stored in localStorage for easy user customization in the client side)
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem("stainy_supabase_url") || "https://SEU_PROJETO.supabase.co";
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem("stainy_supabase_key") || "SUA_CHAVE_PUBLICA";
  });
  const [youtubeVideoId, setYoutubeVideoId] = useState(() => {
    return localStorage.getItem("stainy_youtube_id") || "ScMzIvxBSi4";
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

  // Monitor Scroll for Header blur effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        // Enviar os dados via fetch POST com headers adequados
        const response = await fetch(`${supabaseUrl.trim()}/rest/v1/leads`, {
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
    <div className="min-h-screen font-sans bg-[#0a0a0a] bg-gradient-to-b from-[#0a0a0a] via-[#0d0d1e] to-[#121226] text-gray-100 relative selection:bg-brand-sky selection:text-white">
      
      {/* BACKGROUND PARTICLES EFFECT & RADIAL GLOW */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-deep/30 blur-[130px]" />
        <div className="absolute top-[400px] right-[10%] w-[350px] h-[350px] rounded-full bg-brand-sky/10 blur-[90px]" />
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      </div>

      {/* HEADER */}
      <header 
        id="app-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-[#0a0a0a]/90 backdrop-blur-md border-white/5 py-4" 
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* High fidelity vector logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="focus:outline-none" aria-label="Stainy Filmes Home">
              <StainyLogo className="h-[38px] md:h-[42px]" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollTo(quemSomosRef)} 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer hover:underline underline-offset-4 decoration-brand-sky"
            >
              Quem Somos
            </button>
            <button 
              onClick={() => scrollTo(servicosRef)} 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer hover:underline underline-offset-4 decoration-brand-sky"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollTo(formRef)} 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer hover:underline underline-offset-4 decoration-brand-sky"
            >
              Qualificação
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfigDrawerOpen(true)}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors cursor-pointer"
              title="Configurar Supabase & Chaves"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => scrollTo(formRef)}
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-brand-sky hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-300 shadow-[0_4px_14px_rgba(0,125,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,125,255,0.6)] hover:-translate-y-0.5 cursor-pointer"
            >
              Quero uma proposta
            </button>

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-gray-300 hover:text-white transition-colors rounded-lg bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            className="fixed inset-x-0 top-[72px] bg-[#0c0c14]/98 backdrop-blur-lg border-b border-white/10 p-6 z-40 md:hidden flex flex-col gap-5 shadow-2xl"
          >
            <button 
              onClick={() => scrollTo(quemSomosRef)}
              className="text-lg font-medium text-left text-gray-200 hover:text-brand-sky py-2 border-b border-white/5"
            >
              Quem Somos
            </button>
            <button 
              onClick={() => scrollTo(servicosRef)}
              className="text-lg font-medium text-left text-gray-200 hover:text-brand-sky py-2 border-b border-white/5"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollTo(formRef)}
              className="text-lg font-medium text-left text-gray-200 hover:text-brand-sky py-2 border-b border-white/5"
            >
              Qualificação / Contato
            </button>
            <button 
              onClick={() => scrollTo(formRef)}
              className="w-full mt-2 py-3.5 rounded-xl bg-brand-sky text-white font-bold text-center tracking-wide"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-deep/30 border border-brand-sky/30 backdrop-blur-sm text-brand-sky text-xs font-bold tracking-widest uppercase mb-8"
          >
            <Sparkles className="w-4 h-4 text-brand-sky animate-pulse" />
            Produção Audiovisual Cinematográfica de Elite
          </motion.div>

          {/* Highlight Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-tight md:leading-none text-white max-w-4xl"
          >
            POSICIONAMENTO NÃO ACONTECE POR ACASO. <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-brand-sky via-blue-400 to-indigo-300 bg-clip-text text-transparent glow-text">
              ELE É CONSTRUÍDO COM ESTRATÉGIA.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl font-light"
          >
            Audiovisual político de alto impacto e publicidade corporativa premium para lideranças e marcas que decidem vencer.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center"
          >
            <button 
              onClick={() => scrollTo(formRef)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-sky hover:bg-blue-600 text-white font-bold tracking-wide transition-all duration-300 shadow-[0_8px_30px_rgb(0,125,255,0.4)] hover:shadow-[0_12px_40px_rgb(0,125,255,0.6)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Preencher Formulário
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => scrollTo(servicosRef)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Conheça nossos serviços
            </button>
          </motion.div>

          {/* Trust proof stats mini */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-16 pt-12 border-t border-white/5 w-full max-w-3xl grid grid-cols-3 gap-4"
          >
            <div>
              <p className="text-2xl md:text-3xl font-display font-bold text-white">8 Anos</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">De Mercado</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-display font-bold text-white">Ceará</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Referência Estadual</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-display font-bold text-white">Campanhas</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Eleitorais Vitoriosas</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* FORMULÁRIO DE QUALIFICAÇÃO */}
      <section 
        ref={formRef}
        id="qualificacao"
        className="py-20 px-6 relative z-10 border-t border-white/5 bg-[#08080f]/40"
      >
        <div className="max-w-3xl mx-auto">
          
          {/* Form Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-sky uppercase tracking-[0.2em] bg-brand-sky/10 px-3 py-1.5 rounded-full inline-block mb-3 animate-pulse">
              Filtro Estratégico • Voucher de 10% de Desconto
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Vamos entender o seu projeto
            </h2>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto mb-6">
              A Stainy está selecionando um número restrito de projetos e campanhas para acompanhar mais de perto. 
              Este formulário é rápido e nos ajuda a entender como podemos contribuir com sua presença e estratégia.
            </p>

            {/* Glowing 10% voucher invitation layout */}
            <div className="relative flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-[#090a18] border border-brand-sky/30 max-w-2xl mx-auto shadow-[0_8px_30px_rgba(0,125,255,0.15)] overflow-hidden text-left">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-deep/25 via-transparent to-brand-sky/10 pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-brand-sky/10 border border-brand-sky/30 text-brand-sky text-xl font-bold flex items-center justify-center shrink-0 animate-bounce">
                🎁
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Incentivo de Boas-Vindas Stainy
                </h4>
                <p className="text-xs text-gray-350 leading-relaxed">
                  Quem enviar este formulário agora ganhará <strong className="text-brand-sky">10% de desconto definitivo</strong> em qualquer um de nossos serviços ou cápsulas de campanha. O código do voucher será disponibilizado imediatamente após o envio!
                </p>
              </div>
            </div>
          </div>

          {/* Setup Notice when defaults are active */}
          {(supabaseUrl.includes("SEU_PROJETO") || supabaseKey.includes("SUA_CHAVE")) && (
            <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-300">
                <span className="font-semibold block mb-0.5">Modo de Teste / Simulação Local Ativo</span>
                As credenciais do Supabase estão configuradas com valores genéricos padrões. Seus envios serão registrados em uma lista de simulação local abaixo para testes. Para conectar a seu banco de produção Supabase real, clique na engrenagem de configurações no canto superior direito para aplicar o seu URL do Supabase e Anon Key.
              </div>
            </div>
          )}

          {/* Form wrapper */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-sky" />
            
            <form onSubmit={handleFormSubmission} className="space-y-8">
              
              {/* SEÇÃO: INFORMAÇÕES PESSOAIS */}
              <div className="space-y-4">
                <h3 className="text-base font-bold uppercase tracking-wider text-brand-sky/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sky" />
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="space-y-1.5">
                    <label htmlFor="nome" className="text-xs font-semibold uppercase tracking-wider text-gray-300 block">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="nome"
                      type="text" 
                      required
                      placeholder="Ex: Deputado Silva ou Diretor Executivo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-[#0a0a14] border border-white/10 hover:border-brand-sky/40 focus:border-brand-sky rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-gray-600 focus:ring-1 focus:ring-brand-sky"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <label htmlFor="whatsapp" className="text-xs font-semibold uppercase tracking-wider text-gray-300 block">
                      WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="whatsapp"
                      type="tel"
                      required
                      placeholder="Ex: (85) 99999-9999"
                      value={whatsapp}
                      onChange={(e) => setWhatsApp(e.target.value)}
                      className="w-full bg-[#0a0a14] border border-white/10 hover:border-brand-sky/40 focus:border-brand-sky rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-gray-600 focus:ring-1 focus:ring-brand-sky"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="space-y-1.5">
                  <label htmlFor="instagram" className="text-xs font-semibold uppercase tracking-wider text-gray-300 block">
                    Instagram profissional
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">@</span>
                    <input 
                      id="instagram"
                      type="text" 
                      placeholder="Ex: stainyfilmes"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-[#0a0a14] border border-white/10 hover:border-brand-sky/40 focus:border-brand-sky rounded-lg pl-8 pr-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-gray-600 focus:ring-1 focus:ring-brand-sky"
                    />
                  </div>
                </div>
              </div>

              {/* VOCÊ É CHECKBOXES */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-base font-bold uppercase tracking-wider text-brand-sky/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sky" />
                  Você é:
                </h3>
                <p className="text-xs text-gray-400">Marque todas as opções correspondentes à sua atuação atual.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
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
                        className={`text-xs text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky/15 border-brand-sky text-white font-semibold glow-border" 
                            : "bg-[#0c0c16]/60 border-white/5 text-gray-400 hover:border-white/15 hover:bg-white/5"
                        }`}
                      >
                        {role}
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-brand-sky shrink-0 ml-1.5" />
                        ) : (
                          <div className="w-3 h-3 rounded bg-transparent border border-white/20 shrink-0 ml-1.5" />
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
                      <div className="flex gap-2 items-center bg-[#0d0d18] p-3 rounded-xl border border-white/5">
                        <CornerDownRight className="w-4 h-4 text-brand-sky shrink-0" />
                        <input
                          type="text"
                          placeholder="Especifique a sua atuação"
                          value={outroPerfilText}
                          onChange={(e) => setOutroPerfilText(e.target.value)}
                          className="w-full bg-transparent border-none text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 p-0"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SEÇÃO: HOJE VOCÊ JÁ POSSUI */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-base font-bold uppercase tracking-wider text-brand-sky/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sky" />
                  Hoje você já possui:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
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
                        className={`text-xs text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky/15 border-brand-sky text-white font-semibold glow-border" 
                            : "bg-[#0c0c16]/60 border-white/5 text-gray-400 hover:border-white/15 hover:bg-white/5"
                        }`}
                      >
                        {asset}
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-brand-sky shrink-0 ml-1.5" />
                        ) : (
                          <div className="w-3 h-3 rounded bg-transparent border border-white/20 shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEÇÃO: O QUE VOCÊ MAIS PRECISA HOJE? */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-base font-bold uppercase tracking-wider text-brand-sky/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sky" />
                  O que você mais precisa hoje?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
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
                        className={`text-xs text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky/15 border-brand-sky text-white font-semibold glow-border" 
                            : "bg-[#0c0c16]/60 border-white/5 text-gray-400 hover:border-white/15 hover:bg-white/5"
                        }`}
                      >
                        {need}
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-brand-sky shrink-0 ml-1.5" />
                        ) : (
                          <div className="w-3 h-3 rounded bg-transparent border border-white/20 shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEÇÃO: QUAL FORMATO TE INTERESSA (RADIO) */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-base font-bold uppercase tracking-wider text-brand-sky/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sky" />
                  Qual formato te interessa?
                </h3>
                <p className="text-xs text-gray-400">Selecione o plano ou escopo estimado para o atendimento.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
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
                        className={`text-xs text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky/15 border-brand-sky text-white font-semibold glow-border" 
                            : "bg-[#0c0c16]/60 border-white/5 text-gray-400 hover:border-white/15 hover:bg-white/5"
                        }`}
                      >
                        <span className="leading-tight">{format}</span>
                        <div className="flex items-center gap-2 self-end mt-2">
                          <span className="text-[10px] text-gray-500">Selecionar</span>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                            isSelected ? "border-brand-sky bg-brand-sky" : "border-white/20 bg-transparent"
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEÇÃO: VOCÊ TEM INTERESSE EM */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-base font-bold uppercase tracking-wider text-brand-sky/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sky" />
                  Você tem interesse em:
                </h3>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
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
                        className={`text-xs text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-brand-sky/15 border-brand-sky text-white font-semibold glow-border" 
                            : "bg-[#0c0c16]/60 border-white/5 text-gray-400 hover:border-white/15 hover:bg-white/5"
                        }`}
                      >
                        {goal}
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-brand-sky shrink-0 ml-1.5" />
                        ) : (
                          <div className="w-3 h-3 rounded bg-transparent border border-white/20 shrink-0 ml-1.5" />
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
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start gap-3.5"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Formulário Enviado com Sucesso!</p>
                      <p className="text-xs text-emerald-300/90 mt-1">
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
                    className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Erro no Envio</p>
                      <p className="text-xs text-rose-300 mt-1">
                        {errorMessage || "Não foi possível transmitir os dados da sua qualificação para o servidor. Por favor, tente novamente."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BTN ENVIAR SUBMIT */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-xl bg-brand-sky hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-extrabold text-sm tracking-widest uppercase transition-all duration-300 shadow-[0_6px_22px_rgba(0,125,255,0.3)] hover:shadow-[0_10px_30px_rgba(0,125,255,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Transmitindo Qualificação...
                    </>
                  ) : (
                    <>
                      ENVIAR FORMULÁRIO DE QUALIFICAÇÃO
                      <Send className="w-4 h-4 ml-1" />
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
            <span className="text-xs font-bold text-brand-sky uppercase tracking-[0.25em] flex items-center gap-1.5">
              <span className="w-1 h-3 bg-brand-sky rounded" />
              Sólida Trajetória
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white leading-tight">
              Uma história esculpida com <br />
              <span className="bg-gradient-to-r from-brand-sky via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Audiovisual de Alta Performance
              </span>
            </h2>
            
            <p className="text-sm md:text-base text-gray-300 leading-relaxed font-light">
              A <strong className="text-white font-semibold">Stainy Filmes</strong> nasceu para elevar o padrão da comunicação política através da estratégia, inovação e linguagem cinematográfica. Fundada pelos irmãos <strong className="text-white font-semibold">Dayvisson e David</strong>, a produtora uniu direção de fotografia e publicidade para criar campanhas com mais impacto, emoção e posicionamento.
            </p>

            <p className="text-sm md:text-base text-gray-350 leading-relaxed font-light">
              Em mais de 8 anos de atuação, a Stainy participou de <strong className="text-white font-semibold">mais de 30 campanhas proporcionais e 8 majoritárias</strong>, conquistando a eleição de mais de 20 candidatos proporcionais e vitória em 7 campanhas majoritárias. Com uma comunicação moderna e imagens em padrão de cinema, a Stainy se tornou referência em campanhas políticas que conectam estratégia, narrativa e autoridade.
            </p>

            {/* Founders Micro Badges */}
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                <p className="text-xs text-brand-sky font-semibold tracking-wide uppercase">Fundador & Diretor</p>
                <p className="text-sm text-white font-bold mt-1">Dayvisson Stainy</p>
              </div>
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                <p className="text-xs text-brand-sky font-semibold tracking-wide uppercase">Fundador & Executivo</p>
                <p className="text-sm text-white font-bold mt-1">David Stainy</p>
              </div>
            </div>
          </div>

          {/* YouTube Cinematic Video / Showreel */}
          <div className="lg:col-span-6">
            <div className="relative p-1.5 rounded-2xl bg-[#090912] border border-brand-sky/20 transition-all duration-500 hover:border-brand-sky/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)] group">
              
              {/* Outer decorative glow lights offset */}
              <div className="absolute inset-0 bg-brand-sky/5 filter blur-xl rounded-2xl group-hover:bg-brand-sky/10 transition-colors pointer-events-none" />
              
              <div className="video-wrapper overflow-hidden rounded-xl border border-white/5">
                <iframe 
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`} 
                  title="Stainy Filmes — Showreel Oficial" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </div>

              {/* Subtle footer credit of video */}
              <div className="px-3 pt-3 pb-1 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Play className="w-3 h-3 text-brand-sky fill-brand-sky" />
                  Portfólio & Showreel Institucional
                </span>
                <span>Qualidade Cinema 6K</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO DE SERVIÇOS ("Cápsulas de Campanha") */}
      <section 
        ref={servicosRef}
        id="servicos"
        className="py-24 px-6 relative z-10 bg-slate-950/20 border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          
          {/* Services Header */}
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold text-brand-sky uppercase tracking-[0.25em] bg-brand-sky/10 px-4 py-2 rounded-full inline-block">
              Nossas Linhas de Atuação
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white">
              Nossas cápsulas de campanha
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light">
              Formatos desenhados sob medida para posicionamento tático de imagem nas etapas cruciais de um político rumo à vitória. Escolha o nível de presença que a sua campanha merece hoje.
            </p>
          </div>

          {/* 3 Premium Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-4">
            
            {/* CARD 1: ESSENCIAL */}
            <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/5 p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/10 hover:translate-y-[-4px] group relative shadow-xl">
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div>
                {/* Active Tag */}
                <div className="flex items-center gap-1 text-[10px] text-[#007dff] font-bold tracking-widest uppercase mb-4 py-1 px-2.5 rounded bg-[#007dff]/10 w-fit">
                  NÍVEL I • ESSENCIAL
                </div>

                <h3 className="text-xl font-bold text-white mb-2">CÁPSULA ESSENCIAL</h3>
                <p className="text-xs italic text-gray-400 font-light mb-6">"Conexão • Autoridade • Posicionamento"</p>

                {/* Features list */}
                <div className="space-y-4 border-t border-white/5 pt-6 text-sm">
                  <div className="flex items-start gap-3">
                    <Video className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Institucional & Vida</h4>
                      <p className="text-xs text-gray-400 mt-1">Filme revelador de história e origem: família, fé e trajetória sólida do candidato.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Vídeo de Obras</h4>
                      <p className="text-xs text-gray-400 mt-1">Ações reais tangíveis no campo, depoimentos populares e resultados entregues.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Pedido de Voto</h4>
                      <p className="text-xs text-gray-400 mt-1">Apresentação focada de problema, solução planejada e chamada clara em vídeo.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Includes block bottom */}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
                <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Incluso na cápsula:</p>
                  <p className="text-xs text-gray-300 mt-1.5 font-medium leading-relaxed">
                    Captação em 6K • Fotografia com Drone • Direção cinematográfica • Formatação e corte para redes sociais (Reels/Shorts)
                  </p>
                </div>

                <button 
                  onClick={() => scrollTo(formRef)}
                  className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-brand-sky transition-all duration-300 border border-brand-sky/20 hover:bg-brand-sky/10 group-hover:border-brand-sky hover:-translate-y-0.5 cursor-pointer"
                >
                  Quero este plano
                </button>
              </div>

            </div>

            {/* CARD 2: DESTAQUE (MOST POPULAR) */}
            <div className="bg-[#0b0b18]/80 backdrop-blur-md rounded-2xl border-2 border-brand-sky p-8 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] relative shadow-[0_15px_30px_rgba(0,125,255,0.15)] group">
              {/* Highlight Ribbon */}
              <div className="absolute top-[-14px] left-[50%] -translate-x-1/2 px-4 py-1 rounded bg-brand-sky text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
                MAIS REQUISITADO
              </div>
              
              <div>
                {/* Active Tag */}
                <div className="flex items-center gap-1 text-[10px] text-brand-sky font-bold tracking-widest uppercase mb-4 py-1 px-2.5 rounded bg-brand-sky/10 w-fit">
                  NÍVEL II • COMPLETO
                </div>

                <h3 className="text-xl font-bold text-white mb-2">CÁPSULA DESTAQUE</h3>
                <p className="text-xs italic text-gray-300 font-light mb-6">"Impacto • Presença • Cinematografia"</p>

                {/* Features list */}
                <div className="space-y-4 border-t border-white/10 pt-6 text-sm">
                  <div className="flex items-start gap-3">
                    <Video className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Institucional & Vida</h4>
                      <p className="text-xs text-gray-300 mt-1">Filme de origem de alta comoção focado na conexão religiosa e social.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Vídeo de Obras</h4>
                      <p className="text-xs text-gray-300 mt-1">Validação das melhorias e conquistas obtidas pela liderança na região do Ceará.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Pedido de Voto</h4>
                      <p className="text-xs text-gray-300 mt-1">Formatos de 30s/60s para tráfego pago com copys de alto poder reflexivo.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Music className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Vídeo Clipe Musical</h4>
                      <p className="text-xs text-gray-300 mt-1">A versão do jingle da campanha em videoclipe ultra-dinâmico editado para explosão no digital.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Includes block bottom */}
              <div className="mt-8 pt-6 border-t border-white/10 space-y-6">
                <div className="bg-brand-sky/[0.04] p-3 rounded-lg border border-brand-sky/20">
                  <p className="text-[10px] font-bold tracking-wider text-brand-sky uppercase">Incluso na cápsula:</p>
                  <p className="text-xs text-gray-200 mt-1.5 font-semibold leading-relaxed">
                    Captação avançada em 6K • Drone tático militar • Motion Graphics premium • Grade completa de materiais verticais (TikTok/Reles) e horizontais (YouTube)
                  </p>
                </div>

                <button 
                  onClick={() => scrollTo(formRef)}
                  className="w-full py-4 px-4 rounded-xl text-center text-xs font-bold text-white bg-brand-sky hover:bg-blue-600 transition-all duration-300 shadow-[0_4px_12px_rgba(0,125,255,0.4)] hover:-translate-y-0.5 cursor-pointer"
                >
                  Quero este plano
                </button>
              </div>

            </div>

            {/* CARD 3: VENCEDORA */}
            <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/5 p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/10 hover:translate-y-[-4px] group relative shadow-xl">
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div>
                {/* Active Tag */}
                <div className="flex items-center gap-1 text-[10px] text-blue-300 font-bold tracking-widest uppercase mb-4 py-1 px-2.5 rounded bg-blue-500/10 w-fit">
                  NÍVEL III • DOMÍNIO TOTAL
                </div>

                <h3 className="text-xl font-bold text-white mb-2">CÁPSULA VENCEDORA</h3>
                <p className="text-xs italic text-gray-450 font-light mb-6">"Movimento • Força • Domínio Digital"</p>

                {/* Features list */}
                <div className="space-y-3.5 border-t border-white/5 pt-6 text-sm">
                  <div className="flex items-start gap-2.5">
                    <Video className="w-4 h-4 text-brand-sky mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-400 mt-0.5">Institucional & Vida de alta produção narrativa.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-brand-sky mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-400 mt-0.5">Vídeos de Obras estruturados em multiplas frentes.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-brand-sky mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-400 mt-0.5">Conjunto de Pedidos de Voto por temas municipais específicos.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Music className="w-4 h-4 text-brand-sky mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-400 mt-0.5">Vídeo Clipe Musical em alta cadência com militância.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Camera className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Equipe Filmmaker In-Loco</h4>
                      <p className="text-[11px] text-gray-400">Cobertura tática presencial ágil de até 5 eventos ou agendas políticas determinantes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Storymaker Full Time</h4>
                      <p className="text-[11px] text-gray-400">Acompanhamento diário em tempo integral da rotina e bastidores da liderança político-executiva.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Brain className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wide">Gestão Estratégica</h4>
                      <p className="text-[11px] text-gray-400">Planejamento e direcionamento criativo macro, analisando tendências e métricas digitais para ação imediata.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Includes block bottom */}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
                <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Incluso na cápsula:</p>
                  <p className="text-xs text-gray-300 mt-1.5 font-medium leading-relaxed">
                    Captação cinema 6K • Drone FPV de alta velocidade • Produtor e Coordenador de audiovisual tático • Entregas rápidas no formato D+0 • Suporte estúdio móvel premium
                  </p>
                </div>

                <button 
                  onClick={() => scrollTo(formRef)}
                  className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-brand-sky transition-all duration-300 border border-brand-sky/20 hover:bg-brand-sky/10 group-hover:border-brand-sky hover:-translate-y-0.5 cursor-pointer"
                >
                  Quero este plano
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* BIG STATEMENT IMPACT SECTION */}
      <section className="py-24 px-6 relative z-10 overflow-hidden text-center bg-[#07070d]">
        {/* Lights back drop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-sky/5 rounded-full filter blur-[100px]-none z-0" />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-sky/85">
            Mantra Estratégico
          </span>
          <h2 className="text-2xl md:text-5xl font-display font-extrabold text-white leading-tight uppercase tracking-tight">
            "POSICIONAMENTO NÃO ACONTECE POR ACASO. <br />
            ELE É CONSTRUÍDO COM ESTRATÉGIA."
          </h2>
          <div className="w-16 h-0.5 bg-brand-sky mx-auto" />
          <p className="text-gray-400 font-light text-sm md:text-base tracking-wide">
            Stainy Filmes — 8 anos liderando produções de candidatos e marcas de expressão que vencem.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer 
        id="app-footer"
        className="pt-16 pb-8 bg-[#050508] border-t border-white/5 relative z-10 text-gray-400 text-sm"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Col 1: Logo & address */}
          <div className="md:col-span-6 space-y-4">
            <StainyLogo className="h-9 md:h-10" />

            <p className="text-xs leading-relaxed text-gray-500 max-w-sm">
              Impacto, cinematografia e narrativa emocional para expandir autoridades e conquistar a mente e o coração dos eleitores em qualquer campanha.
            </p>

            <div className="pt-4 flex items-start gap-2.5 text-xs text-gray-500">
              <MapPin className="w-5 h-5 text-brand-sky shrink-0 mt-0.5" />
              <span>
                Avenida Desembargador Moreira, nº 1300, Sala 1006, 10º andar — Torre Sul, Aldeota, Fortaleza — CE
              </span>
            </div>
          </div>

          {/* Col 2: Navigation map shortcuts */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Navegação</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <button onClick={() => scrollTo(quemSomosRef)} className="text-left hover:text-white transition-colors cursor-pointer">Quem Somos</button>
              <button onClick={() => scrollTo(servicosRef)} className="text-left hover:text-white transition-colors cursor-pointer">Serviços e Cápsulas</button>
              <button onClick={() => scrollTo(formRef)} className="text-left hover:text-white transition-colors cursor-pointer">Formulário de Entrada</button>
            </div>
          </div>

          {/* col 3: Social link with premium style */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Redes Sociais</h4>
            <a 
              href="https://instagram.com/stainyfilmes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 text-white hover:border-brand-sky hover:text-brand-sky transition-all text-xs cursor-pointer group"
            >
              <Instagram className="w-4 h-4 text-brand-sky group-hover:scale-110 transition-transform" />
              <span>@stainyfilmes</span>
            </a>
            <div className="text-xs text-gray-500 pt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Qualificação Online Ativa
            </div>
          </div>

        </div>

        {/* trademark banner copyright */}
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© 2025 Stainy Filmes. Todos os direitos reservados.</p>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Config drawer layout */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-[#0a0a0f] border-l border-white/10 h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-brand-sky" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">Parâmetros de Integração</h3>
                  </div>
                  <button 
                    onClick={() => setConfigDrawerOpen(false)}
                    className="p-1 rounded bg-white/5 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Supabase inputs */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#007dff] bg-brand-sky/10 px-2 py-1 rounded">
                    CONEXÃO SUPABASE REST
                  </span>
                  
                  {/* URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Supabase Project URL
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#04040a] border border-white/10 rounded-lg p-3 text-xs text-white uppercase select-all"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="Ex: https://abcde-12345.supabase.co"
                    />
                  </div>

                  {/* KEY */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Supabase Anon Key
                    </label>
                    <input
                      type="password"
                      className="w-full bg-[#04040a] border border-white/10 rounded-lg p-3 text-xs text-white"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                  </div>
                </div>

                {/* YouTube Video ID Config */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                    PLAYER DE VÍDEO PORTFÓLIO
                  </span>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      YouTube Video ID
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#04040a] border border-white/10 rounded-lg p-3 text-xs text-white"
                      value={youtubeVideoId}
                      onChange={(e) => setYoutubeVideoId(e.target.value)}
                      placeholder="Ex: ScMzIvxBSi4 ou dQw4w9WgXcQ"
                    />
                    <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                      Substitua com o ID de vídeo de sua preferência para renderizar o seu respectivo vídeo cinematográfico na seção Quem Somos.
                    </p>
                  </div>
                </div>

                {/* Submissions debugger list */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                    REGISTROS ENVIADOS ({localSubmissionList.length})
                  </span>
                  
                  {localSubmissionList.length === 0 ? (
                    <div className="p-4 rounded-lg bg-white/[0.02] border border-dashed border-white/5 text-center text-xs text-gray-650">
                      Nenhum lead preenchido localmente ainda nesta sessão. Os dados aparecerão aqui instantaneamente ao enviar o formulário.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {localSubmissionList.map((lead, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] space-y-1 relative">
                          <p className="font-bold text-white flex items-center justify-between">
                            <span>{lead.nome}</span>
                            <span className="text-[9px] text-gray-500 font-normal">
                              {lead.criado_em ? new Date(lead.criado_em).toLocaleTimeString() : ""}
                            </span>
                          </p>
                          <p className="text-gray-400">Whatsapp : {lead.whatsapp} | @{lead.instagram}</p>
                          <div className="flex flex-wrap gap-1 pt-1 opacity-80">
                            {lead.perfil.map(p => <span key={p} className="px-1 py-0.5 rounded bg-brand-sky/10 border border-brand-sky/20 text-[9px] text-[#007dff]">{p}</span>)}
                            <span className="px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400">{lead.formato}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {localSubmissionList.length > 0 && (
                    <button
                      onClick={clearLocalLeads}
                      className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors uppercase font-bold tracking-wider"
                    >
                      Limpar registros locais
                    </button>
                  )}
                </div>

              </div>

              {/* Save changes footer button */}
              <div className="pt-6 border-t border-white/5">
                <button
                  onClick={() => saveConfig(supabaseUrl, supabaseKey, youtubeVideoId)}
                  className="w-full py-3 rounded-lg bg-brand-sky text-white font-bold text-xs uppercase tracking-widest transition-all hover:bg-blue-600 block text-center"
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
          <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 md:p-6 bg-black/75 backdrop-blur-sm">
            
            {/* Dark blur overlay bg */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoucherModal(false)}
              className="absolute inset-0 bg-black/20"
            />

            {/* Glowing cinematic voucher wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#0a0f28] to-[#0d0d18] border-2 border-brand-sky/60 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,125,255,0.4)] text-center overflow-hidden"
            >
              
              {/* Top ambient lights decoration */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-brand-sky to-transparent" />
              <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-[240px] h-[150px] bg-brand-sky/20 rounded-full blur-[60px] pointer-events-none" />
              
              {/* Close button button */}
              <button 
                onClick={() => setShowVoucherModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon / Ribbon badge */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-sky/15 border border-brand-sky/30 text-4xl mb-6 shadow-inner animate-pulse">
                🎁
                <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded bg-emerald-500 text-[10px] font-extrabold text-[#0a0a14] uppercase tracking-wide">
                  Ativo
                </div>
              </div>

              {/* Headings */}
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-sky bg-brand-sky/15 px-3 py-1 rounded-full inline-block mb-3">
                Parabéns! Recompensa Ativada
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">
                Você ganhou <span className="bg-gradient-to-r from-brand-sky to-blue-300 bg-clip-text text-transparent">10% de Desconto</span>
              </h3>
              
              <p className="mt-4 text-xs md:text-sm text-gray-300 leading-relaxed font-light">
                O seu formulário de qualificação estratégica foi recebido e validado com êxito em nosso sistema.
              </p>

              {/* Graphic Ticket Voucher block */}
              <div className="my-6 p-4 rounded-xl bg-black/40 border border-dashed border-brand-sky/40 relative flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 rounded-full bg-[#0d0d18] border-r border-[#0d0d18] z-10" />
                <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-[#0d0d18] border-l border-[#0d0d18] z-10" />
                
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Código do Voucher:</p>
                <div className="flex items-center gap-2 bg-brand-sky/10 border border-brand-sky/20 px-4 py-2 rounded-lg">
                  <span className="text-lg font-mono font-black text-white tracking-widest">
                    STAINY10
                  </span>
                  <CheckCheck className="w-4.5 h-4.5 text-brand-sky shrink-0 animate-pulse" />
                </div>
                <p className="text-[9px] text-gray-500 tracking-wide mt-2">Pronto para ser resgatado com a equipe!</p>
              </div>

              {/* Notification they will be contacted */}
              <div className="flex items-start gap-3 text-left bg-white/[0.02] p-4 rounded-xl border border-white/5 mb-6">
                <Check className="w-5 h-5 text-brand-sky shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Entraremos em contato</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Nossa equipe de atendimento já foi notificada. Entraremos em contato com você via <strong className="text-emerald-450 font-bold">WhatsApp</strong> dentro de instantes para agendar sua reunião estratégica e conduzir seu orçamento.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowVoucherModal(false)}
                className="w-full py-4 rounded-xl bg-brand-sky hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(0,125,255,0.3)] hover:shadow-[0_6px_25px_rgba(0,125,255,0.5)] cursor-pointer"
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
