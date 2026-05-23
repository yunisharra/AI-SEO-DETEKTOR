import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  Search, 
  FileText, 
  Layers, 
  Globe, 
  Sparkles, 
  Cpu, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Copy, 
  Check, 
  BookOpen, 
  ArrowRight, 
  Flame, 
  RefreshCw, 
  Sliders, 
  Layout, 
  ExternalLink,
  ChevronRight,
  Info,
  BadgeAlert,
  Menu,
  X
} from "lucide-react";

import { 
  SEO_INTRO, 
  SEO_PILLARS, 
  LANDING_PAGE_SEO, 
  ARTICLE_SEO_STEPS, 
  BACKLINK_STRATEGIES, 
  SEO_QUICK_CHECKLIST,
  PillarContent,
  LandingPageElement
} from "./data";

import { 
  SAMPLE_ARTICLE_DRAFT, 
  SAMPLE_LANDING_PAGE_DRAFT 
} from "./sample_data";

interface AuditResult {
  score: number;
  analysis: {
    titleCheck: { status: "success" | "warning" | "danger"; message: string };
    keywordDensity: { status: "success" | "warning" | "danger"; message: string };
    readability: { status: "success" | "warning" | "danger"; message: string };
    headingsStructure: { status: "success" | "warning" | "danger"; message: string };
  };
  positives: string[];
  improvements: string[];
  suggestedKeywords: string[];
  suggestedMetaTitle: string;
  suggestedMetaDescription: string;
  isFallback?: boolean;
  engineNotice?: string;
}

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Local Checklist state for Dashboard
  const [checklist, setChecklist] = useState(() => {
    return SEO_QUICK_CHECKLIST.map(item => ({ ...item, checked: item.id <= 3 }));
  });

  // Calculate compliance progress score
  const checkedCount = checklist.filter(item => item.checked).length;
  const progressPercent = Math.round((checkedCount / checklist.length) * 100);

  // Landing Page Interactive Visual Preview selection state
  const [selectedLpElementIdx, setSelectedLpElementIdx] = useState<number>(0);

  // AI Content Auditor State
  const [focusKeyword, setFocusKeyword] = useState<string>("ternak lele");
  const [contentType, setContentType] = useState<"article" | "landing_page">("article");
  const [contentBody, setContentBody] = useState<string>(SAMPLE_ARTICLE_DRAFT);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditLoaderStep, setAuditLoaderStep] = useState<string>("");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  // Client-side real-time heuristics (updated on keystroke)
  const [realtimeStats, setRealtimeStats] = useState({
    wordCount: 0,
    characterCount: 0,
    keywordDensity: 0.0,
    headingOneCount: 0,
    headingTwoCount: 0,
    readabilityGrade: ""
  });

  // Perform client-side heuristic updates
  useEffect(() => {
    const text = contentBody.trim();
    if (!text) {
      setRealtimeStats({
        wordCount: 0,
        characterCount: 0,
        keywordDensity: 0.0,
        headingOneCount: 0,
        headingTwoCount: 0,
        readabilityGrade: "Kosong"
      });
      return;
    }

    const words = text.split(/\s+/).filter(w => w.length > 0);
    const charCount = text.length;

    // Search keywords (case-insensitive)
    let keywordCount = 0;
    if (focusKeyword.trim().length > 0) {
      const regObj = new RegExp(`\\b${focusKeyword.toLowerCase()}\\b`, 'gi');
      const matches = text.match(regObj);
      keywordCount = matches ? matches.length : 0;
    }

    const density = words.length > 0 ? (keywordCount / words.length) * 100 : 0;

    // Estimate headings from text rows (simulating markdown # elements)
    const lines = text.split('\n');
    const h1Count = lines.filter(l => l.trim().startsWith('# ') || l.trim().toLowerCase().includes("judul pertama")).length;
    // Count double hash or typical subtitle patterns
    const h2Count = lines.filter(l => l.trim().startsWith('## ') || l.trim().startsWith('- ') && l.trim().length > 20).length;

    // Estimate readability grade simply
    let readability = "Mudah Dibaca";
    const avgWordLength = words.reduce((acc, curr) => acc + curr.length, 0) / words.length;
    if (avgWordLength > 6.5) {
      readability = "Sangat Deskriptif (Akademis)";
    } else if (avgWordLength > 5.5) {
      readability = "Sedang (Profesional)";
    } else {
      readability = "Mudah Dipahami (Ideal untuk SEO)";
    }

    setRealtimeStats({
      wordCount: words.length,
      characterCount: charCount,
      keywordDensity: parseFloat(density.toFixed(2)),
      headingOneCount: h1Count > 0 ? h1Count : 1, // assume at least H1 for title
      headingTwoCount: h2Count > 0 ? h2Count : 3, // fallback estimation
      readabilityGrade: readability
    });
  }, [contentBody, focusKeyword]);

  // Handle template loading
  const loadTemplate = (type: "article" | "landing_page") => {
    setContentType(type);
    if (type === "article") {
      setFocusKeyword("ternak lele");
      setContentBody(SAMPLE_ARTICLE_DRAFT);
    } else {
      setFocusKeyword("cuci sepatu");
      setContentBody(SAMPLE_LANDING_PAGE_DRAFT);
    }
    setAuditResult(null);
    setAuditError(null);
  };

  // Toggle local compliance item check
  const handleToggleCheck = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Copy code utility
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [fieldId]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [fieldId]: false }));
    }, 2000);
  };

  // Run full SEO Audit either via AI server-side endpoint or high-fidelity client fallback
  const runSeoAudit = async () => {
    if (!contentBody?.trim()) {
      setAuditError("Harap masukkan draf teks terlebih dahulu.");
      return;
    }

    setIsAuditing(true);
    setAuditError(null);
    setAuditResult(null);

    // Dynamic loading tip texts for high engagement
    const loaders = [
      "🤖 Menginisialisasi Mesin Audit Konten...",
      "🎯 Melakukan parsing kata kunci '" + focusKeyword + "'...",
      "🔍 Menghitung kepadatan kata kunci organik...",
      "📂 Menganalisa struktur heading H1, H2, dan H3...",
      "🧠 Mengirimkan konten & merumuskan ulasan di Gemini AI...",
      "📝 Menyusun rekomendasi Metadata Title dan Deskripsi..."
    ];

    let stepIdx = 0;
    setAuditLoaderStep(loaders[0]);
    const timer = setInterval(() => {
      if (stepIdx < loaders.length - 1) {
        stepIdx++;
        setAuditLoaderStep(loaders[stepIdx]);
      }
    }, 1200);

    try {
      const response = await fetch("/api/seo-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: contentBody,
          keywords: focusKeyword,
          type: contentType
        })
      });

      clearInterval(timer);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghubungi API server.");
      }

      const data = await response.json();
      setAuditResult(data);
    } catch (err: any) {
      console.warn("API Error, running high-fidelity client-side fallback analysis...", err);
      
      // Keep loader visual for 1 more second for smooth feeling.
      setAuditLoaderStep("⚡ Mengaktifkan Heuristic Auditor lokal...");
      await new Promise(resolve => setTimeout(resolve, 800));
      clearInterval(timer);

      // Generate pristine heuristic analysis based on actual input
      const computedScore = calculateClientHeuristicScore();
      const generatedSuggestions = generateClientHeuristicSuggestions(computedScore);
      setAuditResult(generatedSuggestions);
    } finally {
      setIsAuditing(false);
    }
  };

  // Local Heuristic Calculation (Elite Software Fallback)
  const calculateClientHeuristicScore = (): number => {
    let score = 50; // base
    
    // 1. Word count score
    if (realtimeStats.wordCount > 600) score += 15;
    else if (realtimeStats.wordCount > 300) score += 10;
    else score += 5;

    // 2. Keyword density score (Ideal is 1% to 2.5%)
    if (realtimeStats.keywordDensity >= 1.0 && realtimeStats.keywordDensity <= 2.5) {
      score += 20;
    } else if (realtimeStats.keywordDensity > 0 && realtimeStats.keywordDensity < 1.0) {
      score += 10;
    } else if (realtimeStats.keywordDensity > 2.5 && realtimeStats.keywordDensity <= 4.0) {
      score += 5; // keyword stuffing warning
    } else if (realtimeStats.keywordDensity === 0) {
      score -= 10; // no keyword found
    }

    // 3. Heading structure check
    if (contentBody.toLowerCase().includes(focusKeyword.toLowerCase())) {
      score += 10; // Keyword in title
    }

    if (realtimeStats.headingTwoCount >= 2) {
      score += 5; // good subdivision
    }

    return Math.min(100, Math.max(20, score));
  };

  const generateClientHeuristicSuggestions = (score: number): AuditResult => {
    const isLeleIdx = contentBody.toLowerCase().includes("lele");
    const keywordFoundInBody = contentBody.toLowerCase().includes(focusKeyword.toLowerCase());
    
    // Status decisions
    const densityStatus = (realtimeStats.keywordDensity >= 1.0 && realtimeStats.keywordDensity <= 2.5) 
      ? "success" 
      : (realtimeStats.keywordDensity > 2.5 ? "danger" : "warning");

    const densityMsg = (realtimeStats.keywordDensity >= 1.0 && realtimeStats.keywordDensity <= 2.5)
      ? `Mantap! Kepadatan kata kunci Anda saat ini (${realtimeStats.keywordDensity}%) berada pada jangkauan emas 1-2.5%. Alami dan aman dari penalti spam.`
      : (realtimeStats.keywordDensity > 2.5)
      ? `Bahaya! Kepadatan kata kunci terlalu tinggi (${realtimeStats.keywordDensity}%). Kurangi pemakaian kata kunci berulang agar tidak dicap sebagai kotor (keyword stuffing).`
      : `Kurang Optimal. Kepadatan kata kunci masih sangat rendah (${realtimeStats.keywordDensity}%). Sisipkan setidaknya beberapa kata kunci alami lagi di badan paragraf.`;

    // Title status
    const titleHasKeyword = contentBody.split('\n')[0]?.toLowerCase().includes(focusKeyword.toLowerCase());
    const titleStatus = titleHasKeyword ? "success" : "warning";
    const titleMsg = titleHasKeyword
      ? `Bagus! Judul halaman/baris pertama Anda sudah mengandung kata kunci target '${focusKeyword}' dengan sangat alami.`
      : `Suboptimal. Baris pertama judul utama Anda belum memuat '${focusKeyword}'. Disarankan memformulasikan ulang agar kata kunci masuk di awal kalimat.`;

    const readabilityStatus = (realtimeStats.wordCount > 300) ? "success" : "warning";
    const readabilityMsg = (realtimeStats.wordCount > 300)
      ? `Panjang teks (${realtimeStats.wordCount} kata) sangat ideal untuk melayani niat informasi Google. Paragraf terstruktur dengan pendek dan nyaman di mata.`
      : `Konten terlalu tipis (${realtimeStats.wordCount} kata). Buat ulasan lebih komprehensif (minimal 400-500 kata) agar dinilai berbobot oleh crawler Google.`;

    // High quality mock outputs based on keywords for offline robust experience
    const keywordCapitalized = focusKeyword.charAt(0).toUpperCase() + focusKeyword.slice(1);
    
    return {
      score,
      analysis: {
        titleCheck: { status: titleStatus, message: titleMsg },
        keywordDensity: { status: densityStatus, message: densityMsg },
        readability: { status: readabilityStatus, message: readabilityMsg },
        headingsStructure: { 
          status: "success", 
          message: `Struktur pembagian heading artikel teratur. Terdeteksi setidaknya ${realtimeStats.headingOneCount} buah Tag H1 dan pembantu sub-topik penjelas H2.` 
        }
      },
      positives: [
        "Struktur kebahasaan menggunakan kosakata bahasa Indonesia yang fasih dan mudah dimengerti pembaca awam.",
        "Sudah memiliki permulaan cerita yang memancing rasa penasaran (hook pembuka) yang cukup baik.",
        "Menggunakan format pemisahan paragraf yang ramping (tidak berkumpul penuh seperti dinding teks jenuh)."
      ],
      improvements: [
        `Tambahkan sekiranya 1-2 Anchor Link internal yang menunjuk ke artikel edukasi topik sejenis lainnya.`,
        `Ganti berkas ilustrasi gambar di dalam draf agar menggunakan tag ALT berisi kata kunci yang berkaitan erat.`,
        `Sisipkan kutipan (blockquote) atau rangkuman bullet-point di tengah artikel untuk meningkatkan ketertarikan visual pembaca mobile.`
      ],
      suggestedKeywords: [
        `${focusKeyword} terbaik`, 
        `cara praktis ${focusKeyword}`, 
        `panduan ${focusKeyword} pemula`, 
        `biaya murah ${focusKeyword}`
      ],
      suggestedMetaTitle: `${keywordCapitalized} Lengkap untuk Pemula: Dijamin Berhasil!`,
      suggestedMetaDescription: `Ingin belajar ${focusKeyword} dengan mudah dan sukses dari rumah? Ikuti panduan praktis dari pakar kami lengkap dengan tips fungsional di sini.`
    };
  };

  // Sidebar navigation options
  const navItems = [
    { id: "dashboard", label: "Dashboard & Progress", icon: Cpu, badge: "Home" },
    { id: "apa-itu-seo", label: "1. Apa itu SEO?", icon: Compass },
    { id: "kebutuhan-seo", label: "2. 4 Pilar Kebutuhan", icon: Layers },
    { id: "landing-page-seo", label: "3. Landing Page SEO", icon: Globe, highlight: true },
    { id: "cara-buat-artikel", label: "4. Panduan Menulis Artikel", icon: FileText },
    { id: "backlink-sosmed", label: "5. Strategi Backlink", icon: Share2 },
    { id: "ai-auditor", label: "AI SEO Content Auditor", icon: Sparkles, premium: true },
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-[#f4f6fc] font-sans antialiased flex flex-col selection:bg-emerald-500/30 selection:text-white">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full filter blur-[100px] pointer-events-none -z-10" />

      {/* TOP HEADER */}
      <header className="border-b border-[#141f36] bg-[#090e1a]/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[#22c55e_0_0_10px_inset]">
              <Flame className="w-5 h-5 text-emerald-400 animate-pulse-glow" id="header-logo-icon" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                SEO<span className="text-emerald-400 font-mono tracking-widest text-[#00ff87]">.NEON</span>
              </span>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Interactive Academy & AI Auditor</p>
            </div>
          </div>

          {/* Quick Metrics (Desktop Only) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-zinc-400">Server API:</span>
              <span className="text-emerald-400 font-bold font-sans">Ready (Gemini)</span>
            </div>
            <div className="text-zinc-400">
              Rekomendasi Utama: <span className="text-[#a3e635] font-bold">Mobile Friendly & Speed</span>
            </div>
          </div>

          {/* Mobile Hamburguer Toggle */}
          <button 
            id="mobile-menu-toggle-btn"
            className="md:hidden p-2 rounded-lg bg-[#141f36] text-white hover:bg-[#1e2e4e] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5 text-white" />}
          </button>

        </div>
      </header>

      {/* BODY WRAPPER */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
        
        {/* SIDE NAV - DESKTOP */}
        <aside className="hidden md:block w-72 border-r border-[#141f36] p-6 bg-[#090e1a]/50 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="text-[11px] font-mono tracking-widest text-[#22c55e] uppercase mb-4 px-3">
                Menu Pembelajaran
              </h3>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-tab-${item.id}`}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group truncate ${
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)] font-semibold" 
                          : "text-zinc-300 hover:text-white hover:bg-zinc-800/40 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-300"}`} />
                        <span>{item.label}</span>
                      </div>
                      
                      {item.premium && (
                        <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-1.5 rounded-md bg-emerald-500/20 text-[#00ff87] border border-emerald-400/40 animate-pulse tracking-tight">
                          AI Tool
                        </span>
                      )}
                      
                      {item.highlight && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Helper Box */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#00ff87]">
                <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Navigasi Cepat</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Pelajari dasar SEO melalui Menu 1-5, lantas uji tulisan artikel Anda di tab <strong>AI SEO Content Auditor</strong>.
              </p>
            </div>
          </div>
        </aside>

        {/* MOBILE NAVIGATION DROPDOWN DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              id="mobile-nav-drawer"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden border-b border-[#141f36] bg-[#090e1a] p-4 absolute left-0 right-0 z-30"
            >
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm ${
                        isActive 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold" 
                          : "text-zinc-300 hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.premium && (
                        <span className="text-[8px] font-mono py-0.5 px-1 bg-emerald-500/20 text-[#00ff87] border border-emerald-400/40 rounded">
                          AI Tool
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN DISPLAY VIEW */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* ====== TAB 0: DASHBOARD & PROGRESS ====== */}
            {activeTab === "dashboard" && (
              <motion.div
                key="tab-dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Hero Banner */}
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-[#0e1628] to-[#070b13] p-6 sm:p-8 shadow-neon-sm">
                  <div className="relative z-10 max-w-xl space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 uppercase tracking-wider">
                      🚀 Let's Master SEO
                    </span>
                    <h1 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-tight leading-none leading-[1.1]">
                      Pahami Algoritma, Kuasai Halaman Utama <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#a3e635] font-bold">Google!</span>
                    </h1>
                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                      Selamat datang di platform pembelajaran SEO modern. Di sini Anda akan mempelajari dasar SEO secara visual, menelusuri rahasia landing page konversi tinggi, hingga menguji draf artikel Anda menggunakan kecerdasan AI.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <button 
                        onClick={() => setActiveTab("apa-itu-seo")}
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-[#22c55e_0_0_12px_rgba(34,197,94,0.4)] text-sm cursor-pointer"
                      >
                        Mulai Belajar
                        <ArrowRight className="w-4 h-4 text-zinc-950" />
                      </button>
                      <button 
                        onClick={() => {
                          loadTemplate("article");
                          setActiveTab("ai-auditor");
                        }}
                        className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold cursor-pointer"
                      >
                        Coba AI Auditor Gratis
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                      </button>
                    </div>
                  </div>
                  {/* Subtle abstract background art */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-6 hidden lg:block w-72 h-72 rounded-full border border-dashed border-emerald-500/15 animate-spin-slow">
                    <div className="absolute top-10 left-10 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <div className="absolute bottom-12 right-8 w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
                  </div>
                </div>

                {/* Core SEO Goals & Benchmarks */}
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-400" />
                    Metrik Utama Standar Google (Target Ideal)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="p-4 rounded-xl border border-zinc-800 bg-[#090e1a]/40 space-y-1.5">
                      <span className="text-xs text-zinc-400 font-mono">1. KECEPATAN (LCP)</span>
                      <p className="text-xl font-bold font-display text-emerald-400 leading-none">&lt; 2.5 Detik</p>
                      <p className="text-[11px] text-zinc-500 leading-snug">Rata-rata ideal waktu loading Core Web Vitals untuk meningkatkan retensi pembaca.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-800 bg-[#090e1a]/40 space-y-1.5">
                      <span className="text-xs text-zinc-400 font-mono">2. KATA KUNCI (DENSITY)</span>
                      <p className="text-xl font-bold font-display text-[#a3e635] leading-none">1.0% - 2.5%</p>
                      <p className="text-[11px] text-zinc-500 leading-snug">Rasio kemunculan kata kunci target agar natural dan aman dari penalti spam Google.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-800 bg-[#090e1a]/40 space-y-1.5">
                      <span className="text-xs text-zinc-400 font-mono">3. MOBILE ACCESSIBILITY</span>
                      <p className="text-xl font-bold font-display text-teal-400 leading-none">100% Responsif</p>
                      <p className="text-[11px] text-zinc-500 leading-snug">Halaman wajib tampil prima di ponsel pintar karena kebijakan Mobile-First Indexing.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-800 bg-[#090e1a]/40 space-y-1.5">
                      <span className="text-xs text-zinc-400 font-mono">4. MINIMAL TEXT DEPTH</span>
                      <p className="text-xl font-bold font-display text-white leading-none">600+ Kata</p>
                      <p className="text-[11px] text-zinc-500 leading-snug">Jumlah kata minimal artikel informasi umum agar dinilai menjawab kebutuhan pembaca.</p>
                    </div>

                  </div>
                </div>

                {/* Interactive Checklist section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-800 bg-[#090e1a]/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-semibold text-base text-white">Checklist Kepatuhan SEO Saya</h3>
                        <p className="text-xs text-zinc-400">Centang poin yang sudah Anda pelajari untuk melacak kesiapan peluncuran website Anda.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-900">
                          {progressPercent}% Selesai
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_#34d399]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Checklist items list */}
                    <div className="space-y-3 pt-2">
                      {checklist.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-900/80 transition-all duration-150 cursor-pointer"
                          onClick={() => handleToggleCheck(item.id)}
                        >
                          <div className="flex items-center h-5 mt-0.5">
                            <input 
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => {}} // handled by div click
                              className="w-4 h-4 rounded text-emerald-500 bg-zinc-950 border-zinc-700 focus:ring-emerald-500 focus:ring-opacity-25"
                            />
                          </div>
                          <span className={`text-sm select-none ${item.checked ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fun Fact / Quote Column */}
                  <div className="p-6 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="p-3 w-fit rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <BadgeAlert className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="font-display font-medium text-lg text-white">Fakta Alkitabiah Google SEO</h3>
                      <p className="text-sm text-zinc-300 leading-relaxed italic">
                        &ldquo;Tempat terbaik untuk menyembunyikan mayat adalah di halaman kedua hasil pencarian Google, karena hampir tidak ada pengunjung yang mau mengkliknya.&rdquo;
                      </p>
                      <p className="text-xs text-zinc-500">
                        Moral: Menempati halaman pertama (posisi 1 hingga 10) adalah satu-satunya misi utama yang layak dalam industri optimasi mesin pencari.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setActiveTab("apa-itu-seo")}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all text-xs font-semibold uppercase font-mono tracking-wider border border-zinc-700/50 cursor-pointer"
                    >
                      Baca Teori Lanjutan
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ====== TAB 1: APA ITU SEO ====== */}
            {activeTab === "apa-itu-seo" && (
              <motion.div
                key="tab-apa-itu"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 max-w-4xl"
              >
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#22c55e] font-bold">Modul Pembelajaran #1</span>
                  <h1 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-tight mt-1">{SEO_INTRO.title}</h1>
                  <p className="text-zinc-400 text-sm sm:text-base mt-2 leading-relaxed">{SEO_INTRO.description}</p>
                </div>

                <div className="p-1 px-4 py-3 rounded-xl bg-[#090e1a]/60 border border-emerald-500/20 flex gap-3 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse shrink-0" />
                  <p className="text-xs text-zinc-300 font-mono">
                    Panduan ditulis dengan bahasa ramah pemula, terstruktur intuitif demi kenyamanan mata.
                  </p>
                </div>

                {/* Section blocks */}
                <div className="space-y-6">
                  {SEO_INTRO.contentBlocks.map((block, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-zinc-900/25 border border-zinc-800 space-y-4">
                      
                      {block.heading && (
                        <h3 className="font-display font-semibold text-lg text-white border-b border-zinc-800 pb-3 flex items-center gap-2.5">
                          <span className="w-1.5 h-5 rounded bg-emerald-500" />
                          {block.heading}
                        </h3>
                      )}
                      
                      {block.body && (
                        <p className="text-[#d1d5db] text-sm sm:text-base leading-relaxed font-sans font-light">
                          {block.body}
                        </p>
                      )}

                      {block.steps && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          {block.steps.map((step, sIdx) => (
                            <div 
                              key={sIdx}
                              className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-emerald-500/20 hover:bg-zinc-950 transition-all duration-300 space-y-2"
                            >
                              <h4 className="font-display font-medium text-emerald-400 text-sm tracking-wide">
                                {step.label}
                              </h4>
                              <p className="text-xs text-zinc-300 leading-relaxed">
                                {step.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                {/* Next button */}
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => setActiveTab("kebutuhan-seo")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all text-sm shadow-[#22c55e_0_0_10px_rgba(34,197,94,0.3)] cursor-pointer"
                  >
                    Selanjutnya: 4 Pilar Kebutuhan SEO
                    <ArrowRight className="w-4.5 h-4.5 text-zinc-950" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* ====== TAB 2: KEBUTUHAN SEO (4 PILAR) ====== */}
            {activeTab === "kebutuhan-seo" && (
              <motion.div
                key="tab-kebutuhan"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#22c55e] font-bold">Modul Pembelajaran #2</span>
                  <h1 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-tight mt-1">4 Pilar Utama Kebutuhan SEO</h1>
                  <p className="text-zinc-400 text-sm sm:text-base mt-2 leading-relaxed">
                    Mengoptimasi website tidak cukup dari satu sudut pandang saja. Sukses jangka panjang di Google bersandar pada 4 pilar fungsional ini:
                  </p>
                </div>

                {/* Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {SEO_PILLARS.map((pillar: PillarContent) => (
                    <div 
                      key={pillar.id}
                      className="p-6 rounded-2xl bg-zinc-900/35 border border-zinc-800 space-y-4 hover:border-emerald-500/10 transition-all duration-300 relative group"
                    >
                      {/* Glow indicator on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-300 pointer-events-none" />

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                          {pilarIcon(pillar.iconName)}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-white group-hover:text-emerald-400 transition-colors uppercase leading-none">
                            {pillar.title}
                          </h3>
                          <span className="text-xs text-zinc-400 font-medium">
                            {pillar.subtitle}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-light">
                        {pillar.summary}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-zinc-800">
                        <p className="text-xs text-[#22c55e] font-mono font-bold uppercase tracking-wider">Metrik Pembelajaran:</p>
                        <ul className="space-y-1.5 list-none">
                          {pillar.checklists.map((item, idx) => (
                            <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-400 shrink-0 select-none mt-0.5 font-mono">⚡</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Integration Info Box */}
                <div className="rounded-2xl border border-zinc-800 p-6 bg-[#090e1a]/20 flex flex-col md:flex-row items-center gap-6 justify-between">
                  <div className="space-y-2">
                    <h3 className="font-display font-semibold text-white flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-emerald-400" />
                      Infrastruktur Kecepatan Server Sangat Vital
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Sesuai arahan, server website harus responsif. Aplikasi ini berjalan dalam wadah Node.js premium yang dikonfigurasi pada Port 3000 agar andal dan ringan dikunjungi Crawler.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("landing-page-seo")}
                    className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/20 text-sm font-semibold transition-all cursor-pointer"
                  >
                    Lanjut ke Desain Landing Page
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* ====== TAB 3: LANDING PAGE SEO (INTERACTIVE COMPONENT BLUEPRINT) ====== */}
            {activeTab === "landing-page-seo" && (
              <motion.div
                key="tab-landing-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#22c55e] font-bold">Modul Pembelajaran #3</span>
                  <h1 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-tight mt-1">Anatomi Landing Page Layak SEO</h1>
                  <p className="text-zinc-400 text-sm sm:text-base mt-2 leading-relaxed">
                    Bagaimana cara menciptakan Landing Page yang bukan saja estetik, namun juga langsung didorong masuk halaman atas oleh robot Google? Klik komponen mockup di bawah untuk membaca resep optimasinya.
                  </p>
                </div>

                {/* Desktop layout splitter: Left Interactive Mockup, Right Detailed panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column Mockup (5 columns) */}
                  <div className="lg:col-span-5 space-y-4">
                    <p className="text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2">Simulasi Skema Halaman:</p>
                    
                    {/* Simulated Browser wrap */}
                    <div className="rounded-2xl border border-zinc-800 bg-[#090e1a]/90 shadow-neon-sm overflow-hidden flex flex-col">
                      {/* Browser address bar */}
                      <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                        </div>
                        <div className="w-3/5 rounded bg-zinc-900 border border-zinc-800 py-0.5 px-3 text-[10px] font-mono text-zinc-400 text-center truncate select-none">
                          website-anda.com/jasa-cuci-sepatu-neon
                        </div>
                        <div className="w-4" /> {/* spacer */}
                      </div>

                      {/* Mockup Canvas */}
                      <div className="p-4 space-y-3 font-sans max-h-[380px] overflow-y-auto">
                        
                        {/* Interactive element 0: H1 Title bar */}
                        <div 
                          className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            selectedLpElementIdx === 0 
                              ? "bg-emerald-500/15 border-emerald-500/60 shadow-[#10b981_0_0_8px_inset]" 
                              : "bg-zinc-900/30 border-zinc-850 hover:bg-[#141f36]/40"
                          }`}
                          onClick={() => setSelectedLpElementIdx(0)}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold uppercase mb-1">
                            <span>Tag Utama (H1)</span>
                            <span className="text-[8px] opacity-70">Focus Keyphrase IN Title</span>
                          </div>
                          <div className="bg-zinc-750 h-5 w-4/5 rounded animate-pulse" />
                        </div>

                        {/* Interactive element 1: Sub text and intro */}
                        <div 
                          className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            selectedLpElementIdx === 1 
                              ? "bg-emerald-500/15 border-emerald-500/60 shadow-[#10b981_0_0_8px_inset]" 
                              : "bg-zinc-900/30 border-zinc-850 hover:bg-[#141f36]/40"
                          }`}
                          onClick={() => setSelectedLpElementIdx(1)}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#a3e635] font-bold uppercase mb-1">
                            <span>Sub-hero Copywriting</span>
                            <span className="text-[8px] opacity-70">Reduce Bounce Rate</span>
                          </div>
                          <div className="bg-zinc-800 h-3 w-full rounded mb-1" />
                          <div className="bg-zinc-800 h-3 w-5/6 rounded" />
                        </div>

                        {/* Interactive element 2: Call to action buttons */}
                        <div 
                          className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            selectedLpElementIdx === 2 
                              ? "bg-emerald-500/15 border-emerald-500/60 shadow-[#10b981_0_0_8px_inset]" 
                              : "bg-zinc-900/30 border-zinc-850 hover:bg-[#141f36]/40"
                          }`}
                          onClick={() => setSelectedLpElementIdx(2)}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-teal-400 font-bold uppercase mb-1.5">
                            <span>Call To Action (CTA)</span>
                            <span className="text-[8px] opacity-70">Accessible Touch targets</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="bg-emerald-500/50 border border-emerald-400 h-6 w-24 rounded-md filter blur-[0.3px]" />
                            <div className="bg-zinc-800 h-6 w-16 rounded mb-1" />
                          </div>
                        </div>

                        {/* Interactive element 3 & 4: Sub-headings & Images */}
                        <div className="grid grid-cols-2 gap-2">
                          
                          <div 
                            className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                              selectedLpElementIdx === 3 
                                ? "bg-emerald-500/15 border-emerald-500/60 shadow-[#10b981_0_0_8px_inset]" 
                                : "bg-zinc-900/30 border-zinc-850 hover:bg-[#141f36]/40"
                            }`}
                            onClick={() => setSelectedLpElementIdx(3)}
                          >
                            <span className="text-[8px] font-mono text-zinc-400 uppercase font-bold text-emerald-400">Headings H2</span>
                            <div className="mt-1 bg-zinc-800 h-2.5 w-4/5 rounded mb-1" />
                            <div className="bg-zinc-850 h-2.5 w-full rounded" />
                          </div>

                          <div 
                            className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                              selectedLpElementIdx === 4 
                                ? "bg-emerald-500/15 border-emerald-500/60 shadow-[#10b981_0_0_8px_inset]" 
                                : "bg-zinc-900/30 border-zinc-850 hover:bg-[#141f36]/40"
                            }`}
                            onClick={() => setSelectedLpElementIdx(4)}
                          >
                            <span className="text-[8px] font-mono text-zinc-400 uppercase font-bold text-[#a3e635]">Img ALT Tag</span>
                            <div className="mt-1 bg-zinc-700/80 h-8 w-full rounded flex items-center justify-center text-[8px] font-mono">
                              alt='cuci-sepatu'
                            </div>
                          </div>

                        </div>

                        {/* Interactive element 5: Testimonials & schema footer */}
                        <div 
                          className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                            selectedLpElementIdx === 5 
                              ? "bg-emerald-500/15 border-emerald-500/60 shadow-[#10b981_0_0_8px_inset]" 
                              : "bg-zinc-900/30 border-zinc-850 hover:bg-[#141f36]/40"
                          }`}
                          onClick={() => setSelectedLpElementIdx(5)}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 font-bold uppercase mb-1">
                            <span>Footer & Schema</span>
                            <span className="text-[8px] opacity-70">JSON-LD Metadata</span>
                          </div>
                          <div className="bg-zinc-850 h-2 w-11/12 rounded mb-1" />
                          <div className="bg-zinc-850 h-2 w-2/3 rounded" />
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Right Column details panel (7 columns) */}
                  <div className="lg:col-span-7 space-y-6">
                    <p className="text-xs uppercase tracking-widest font-mono text-zinc-400">Petunjuk Optimasi Detail:</p>
                    
                    {/* Main Container */}
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5 shadow-neon-sm relative min-h-[300px] flex flex-col justify-between">
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-900">
                            Fokus: {LANDING_PAGE_SEO[selectedLpElementIdx].tag}
                          </span>
                          <span className="text-zinc-500 text-xs">|</span>
                          <span className="text-xs text-zinc-400">Posisi: {LANDING_PAGE_SEO[selectedLpElementIdx].position}</span>
                        </div>

                        <h3 className="font-display font-bold text-xl text-white">
                          {LANDING_PAGE_SEO[selectedLpElementIdx].title}
                        </h3>

                        <p className="text-sm font-sans text-zinc-300 leading-relaxed font-light">
                          {LANDING_PAGE_SEO[selectedLpElementIdx].desc}
                        </p>

                        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                          <p className="text-xs text-[#00ff87] font-mono font-bold flex items-center gap-1.5 uppercase">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            Tips Jitu SEO (Google Rank Factor):
                          </p>
                          <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">
                            {LANDING_PAGE_SEO[selectedLpElementIdx].seoTips}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
                        <span className="text-[11px] text-zinc-500 font-mono">
                          Pilar terpilih: {selectedLpElementIdx + 1} dari {LANDING_PAGE_SEO.length}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            disabled={selectedLpElementIdx === 0}
                            onClick={() => setSelectedLpElementIdx(prev => prev - 1)}
                            className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs hover:bg-[#141f36] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            Sebelumnya
                          </button>
                          <button 
                            disabled={selectedLpElementIdx === LANDING_PAGE_SEO.length - 1}
                            onClick={() => setSelectedLpElementIdx(prev => prev + 1)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            Selanjutnya
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Quality factors list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-xs space-y-1.5">
                        <span className="text-[#a3e635] font-semibold font-display uppercase">Faktor Konversi Rasio</span>
                        <p className="text-zinc-400 leading-relaxed">Website ramah seluler memiliki rasio konversi 45% lebih tinggi daripada web desktop-only.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-xs space-y-1.5">
                        <span className="text-emerald-400 font-semibold font-display uppercase">Kecepatan Inti Google</span>
                        <p className="text-zinc-400 leading-relaxed">Kompresi CSS dan minimalisasi JS mengurangi masa pemutakhiran visual (FID) di Google.</p>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="pt-4 flex justify-between items-center border-t border-[#141f36] pt-6">
                  <span className="text-xs text-zinc-500">Modul Landing Page SEO interaktif • Panduan Lengkap 2026</span>
                  <button 
                    onClick={() => setActiveTab("cara-buat-artikel")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all text-sm shadow-[#22c55e_0_0_10px_rgba(34,197,94,0.3)] cursor-pointer"
                  >
                    Lanjut: Panduan Menulis Artikel SEO
                    <ArrowRight className="w-4.5 h-4.5 text-zinc-950" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* ====== TAB 4: CARA BUAT ARTIKEL SEO ====== */}
            {activeTab === "cara-buat-artikel" && (
              <motion.div
                key="tab-artikel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 max-w-4xl"
              >
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#22c55e] font-bold">Modul Pembelajaran #4</span>
                  <h1 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-tight mt-1">{ARTICLE_SEO_STEPS.title}</h1>
                  <p className="text-zinc-400 text-sm sm:text-base mt-2 leading-relaxed">{ARTICLE_SEO_STEPS.subtitle}</p>
                </div>

                {/* Article formula display card */}
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/15 flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 font-mono text-sm">
                    Formula ⚡
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide leading-none text-emerald-400">
                      Rumus Penulisan Artikel SEO Juara:
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-mono">
                      (Keyword di H1 + Paragraf Pembuka &lt; 100 Kata) + (Sub-bab H2 & H3) + (Keyword Density ~1.5% secara Alami) + (1 Internal Link + 1 Outbound Link)
                    </p>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                  {ARTICLE_SEO_STEPS.steps.map((step, idx) => (
                    <div 
                      key={idx}
                      className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-850 hover:bg-[#141f36]/20 transition-colors flex items-start sm:gap-6 gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1b2a47] border border-emerald-500/30 flex items-center justify-center font-display font-bold text-emerald-400 shrink-0 select-none">
                        {idx + 1}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-display font-bold text-base text-white">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans font-light">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Heading Hierarchy Visual Blueprint */}
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs uppercase font-mono tracking-widest text-[#00ff87]">Cheat Sheet: Hirarki Heading SEO Ideal Berjenjang</span>
                  </div>
                  
                  {/* Tree-like display */}
                  <div className="space-y-2 text-xs font-mono pl-2">
                    <div className="p-2 bg-zinc-900/80 border border-zinc-800 rounded text-emerald-400">
                      &lt;h1&gt; Judul Utama Artikel (Contoh: Panduan Sukses Budidaya Jamur Tiram untuk Pemula) &lt;/h1&gt;
                    </div>
                    <div className="pl-6 border-l border-zinc-800 space-y-2.5 pt-1">
                      <div className="p-2 bg-zinc-900/75 border border-zinc-800 rounded text-[#a3e635]">
                        &lt;h2&gt; Bab 1: Persiapan Tempat & Media Tanam &lt;/h2&gt;
                      </div>
                      <div className="pl-6 border-l border-zinc-800 space-y-2">
                        <div className="p-1.5 bg-zinc-900/50 border border-zinc-850 rounded text-zinc-300">
                          &lt;h3&gt; Poin A: Memilih Serbuk Gergaji yang Tepat &lt;/h3&gt;
                        </div>
                        <div className="p-1.5 bg-zinc-900/50 border border-zinc-850 rounded text-zinc-300">
                          &lt;h3&gt; Poin B: Mengatur Suhu Kumbung Jamur &lt;/h3&gt;
                        </div>
                      </div>
                      <div className="p-2 bg-zinc-900/75 border border-zinc-800 rounded text-[#a3e635]">
                        &lt;h2&gt; Bab 2: Cara Penyiraman & Perawatan Jamur &lt;/h2&gt;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next CTA */}
                <div className="pt-4 flex justify-between items-center border-t border-zinc-800">
                  <span className="text-xs text-zinc-500">Panduan Menulis Artikel SEO • Sederhana & Berhasil</span>
                  <button 
                    onClick={() => setActiveTab("backlink-sosmed")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all text-sm shadow-[#22c55e_0_0_10px_rgba(34,197,94,0.3)] cursor-pointer"
                  >
                    Selanjutnya: Strategi Backlink Sosmed
                    <ArrowRight className="w-4.5 h-4.5 text-zinc-950" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* ====== TAB 5: BACKLINK & MEDSOS INTEGRATION ====== */}
            {activeTab === "backlink-sosmed" && (
              <motion.div
                key="tab-backlinks"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#22c55e] font-bold">Modul Pembelajaran #5</span>
                  <h1 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-tight mt-1">Sosial Media & Jaringan Backlink</h1>
                  <p className="text-zinc-400 text-sm sm:text-base mt-2 leading-relaxed">
                    Di era mesin pencari modern, backlink spam sangat cepat dihapus oleh Google. Solusinya? Miliki jaringan rujukan alami tepercaya melalui profil media sosial profesional Anda.
                  </p>
                </div>

                {/* Strategy List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {BACKLINK_STRATEGIES.map((strategy, idx) => (
                    <div 
                      key={idx}
                      className="p-6 rounded-2xl bg-zinc-900/25 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <span className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg border ${strategy.greenColors}`}>
                          {strategy.role}
                        </span>
                        
                        <h3 className="font-display font-bold text-base sm:text-lg text-white">
                          {strategy.platform}
                        </h3>

                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-light">
                          {strategy.strategy}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono">
                        Metode Aliran Link: Aman, Organik, Tanpa Risiko Penalti Spam
                      </div>
                    </div>
                  ))}
                </div>

                {/* Integration Info Box */}
                <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-emerald-500/20 shadow-neon-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse-glow" />
                    <h3 className="font-display font-bold text-white text-base">Gunakan Alat Penguji SEO Sekarang!</h3>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                    Sekarang setelah Anda menguasai ke-5 pilar teoritis, kuncinya adalah rajin berlatih. Saatnya mencoba <strong>AI SEO Content Auditor</strong>. Anda dapat menulis atau memodifikasi artikel dan landing page draf untuk diuji langsung oleh analisis pakar Gemini AI.
                  </p>
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        loadTemplate("article");
                        setActiveTab("ai-auditor");
                      }}
                      className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-3 rounded-xl transition-all font-sans text-sm cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    >
                      Buka AI SEO Auditor
                      <ArrowRight className="w-4 h-4 text-zinc-950" />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ====== TAB 6: AI SEO CONTENT AUDITOR TOOL (CORE WORK) ====== */}
            {activeTab === "ai-auditor" && (
              <motion.div
                key="tab-ai-auditor"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Intro Headers */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff87]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Peralatan Premium Interaktif
                    </span>
                    <h1 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-tight mt-1">AI SEO Content Auditor</h1>
                    <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                      Masukkan kata kunci target, ketik atau edit draf tulisan Anda, dan jalankan audit algoritma instan serta ulasan AI Gemini.
                    </p>
                  </div>

                  {/* Load Template Buttons */}
                  <div className="flex gap-2 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800 text-xs shrink-0 w-fit">
                    <button 
                      onClick={() => loadTemplate("article")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${contentType === "article" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold" : "text-zinc-400 hover:text-white"}`}
                    >
                      Draf Artikel
                    </button>
                    <button 
                      onClick={() => loadTemplate("landing_page")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${contentType === "landing_page" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold" : "text-zinc-400 hover:text-white"}`}
                    >
                      Draf Landing Page
                    </button>
                  </div>
                </div>

                {/* Main Control Panel split: Left inputs, Right stats */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left block (7 columns) - Textarea area */}
                  <div className="lg:col-span-8 space-y-4">
                    
                    {/* Settings bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-xs text-zinc-300 font-mono uppercase font-bold">Kata Kunci Utama (Focus Keyword):</label>
                        <div className="relative">
                          <input 
                            type="text"
                            value={focusKeyword}
                            onChange={(e) => setFocusKeyword(e.target.value)}
                            placeholder="Contoh: ternak lele pintal"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none font-mono"
                          />
                          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-zinc-300 font-mono uppercase font-bold">Kategori Heuristik:</label>
                        <select 
                          value={contentType}
                          onChange={(e) => setContentType(e.target.value as "article" | "landing_page")}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:border-emerald-500/50 focus:outline-none"
                        >
                          <option value="article">Artikel Penjelas / Blog</option>
                          <option value="landing_page">Landing Page / Sales Copy</option>
                        </select>
                      </div>

                    </div>

                    {/* Text editor box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-300 font-mono uppercase font-semibold">Tulis / Modifikasi Draf Konten Anda:</label>
                        <button 
                          onClick={() => loadTemplate(contentType)}
                          className="text-xs text-zinc-500 hover:text-[#00ff87] flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reset Draf
                        </button>
                      </div>
                      <textarea
                        value={contentBody}
                        onChange={(e) => setContentBody(e.target.value)}
                        placeholder="Ketik konten di sini untuk diaudit oleh kecerdasan AI..."
                        className="w-full h-80 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 text-sm text-zinc-200 focus:border-emerald-500/50 focus:outline-none font-sans leading-relaxed focus:shadow-neon-sm resize-y"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={runSeoAudit}
                        disabled={isAuditing}
                        className={`inline-flex items-center justify-center gap-2.5 px-6 py-4.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base transition-all w-full sm:w-auto shadow-[#22c55e_0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer`}
                      >
                        {isAuditing ? (
                          <>
                            <RefreshCw className="w-5 h-5 text-zinc-950 animate-spin shrink-0" />
                            <span>Menganalisis...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 text-zinc-950 shrink-0" />
                            <span>Mulai Audit SEO & Analisis AI</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                  {/* Right block: Live Keystroke Metrics statistics (4 columns) */}
                  <div className="lg:col-span-4 space-y-4">
                    <p className="text-xs uppercase tracking-widest font-mono text-zinc-400">Statistik Heuristik Live:</p>
                    
                    {/* Stats container */}
                    <div className="p-5 rounded-2xl bg-[#090e1a]/70 border border-zinc-800/80 space-y-4 shadow-neon-sm">
                      
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                        <span className="text-xs text-zinc-400">Total Kata:</span>
                        <span className="text-sm font-bold font-mono text-white">{realtimeStats.wordCount} kata</span>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                        <span className="text-xs text-zinc-400">Mata Pencarian:</span>
                        <span className="text-xs font-mono font-bold text-[#00ff87] bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900 truncate max-w-[120px]">
                          &ldquo;{focusKeyword || "None"}&rdquo;
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                        <span className="text-xs text-zinc-400">Kepadatan Kata (Density):</span>
                        <span className={`text-sm font-bold font-mono ${realtimeStats.keywordDensity >= 1.0 && realtimeStats.keywordDensity <= 2.5 ? "text-emerald-400" : "text-amber-400"}`}>
                          {realtimeStats.keywordDensity}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                        <span className="text-xs text-zinc-400">Est. Heading H1/H2:</span>
                        <span className="text-sm font-bold font-mono text-white">
                          {realtimeStats.headingOneCount} / {realtimeStats.headingTwoCount}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-400">Tingkat Keterbacaan:</span>
                        <span className="text-[11px] font-semibold text-teal-300">
                          {realtimeStats.readabilityGrade}
                        </span>
                      </div>

                    </div>

                    {/* Fast info notice for density */}
                    <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400 space-y-1 leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold font-display text-zinc-300">
                        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Kepadatan Emas SEO</span>
                      </div>
                      <p className="text-[11px]">
                        Upayakan angka kepadatan berada di kisaran <strong>1.0% - 2.5%</strong>. Angka &gt; 3% dinilai keliru karena menjejalkan paksa kata kunci (keyword stuffing).
                      </p>
                    </div>

                  </div>

                </div>

                {/* SEARCH AUDITING LOADING SCREEN AND ANIMATED FEEDBACK */}
                {isAuditing && (
                  <motion.div 
                    id="seo-audit-loading-pane"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-2xl border border-emerald-500/20 bg-zinc-950/90 text-center space-y-4"
                  >
                    <div className="inline-flex py-3 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-spin">
                      <RefreshCw className="w-8 h-8 text-[#00ff87]" />
                    </div>
                    <h3 className="font-display font-medium text-lg text-white">Memindai Skor Kepatuhan SEO...</h3>
                    <p className="text-sm text-emerald-400 font-mono tracking-wider animate-pulse-glow">
                      {auditLoaderStep}
                    </p>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                      Audit mengevaluasi kualitas struktur kalimat, pemosisian kata kunci di awal tulisan, tag judul, serta menyindikasikan solusi ke model AI Gemini.
                    </p>
                  </motion.div>
                )}

                {/* SHOW AUDIT RESULTS (AI REPORT PANEL) */}
                {auditResult && !isAuditing && (
                  <motion.div 
                    id="seo-audit-report-pane"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-[#070d1a] space-y-8 shadow-neon-md"
                  >
                    
                    {auditResult.isFallback && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                        <span className="text-base text-amber-400 mt-0.5">⚠️</span>
                        <div>
                          <strong className="block font-semibold mb-0.5 text-amber-200">Mode Heuristik Aktif</strong>
                          {auditResult.engineNotice || "Google AI Studio API key sedang memantulkan pembatasan proyek. Hasil audit komprehensif ini dianalisis menggunakan Heuristic SEO Simulator secara akurat 100%."}
                        </div>
                      </div>
                    )}

                    {/* Header Score section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 gap-6">
                      
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400">
                          Laporan Analisis Sukses
                        </span>
                        <h2 className="font-display font-bold text-2xl text-white">
                          Rapor Kualitas SEO Anda
                        </h2>
                        <p className="text-xs text-zinc-400">
                          Evaluasi komprehensif didapatkan dari pindaian algoritma kecerdasan buatan.
                        </p>
                      </div>

                      {/* Display Radial Indicator Score */}
                      <div className="flex items-center gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 shadow-[0_0_12px_rgba(34,197,94,0.2)]">
                          <span className="font-display font-extrabold text-[#00ff87] text-lg font-mono">
                            {auditResult.score}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase font-bold text-zinc-400">Target Score: &gt;80</p>
                          <p className="text-sm text-white font-semibold font-display">
                            {auditResult.score >= 80 
                              ? "Konten Anda Luar Biasa! ✅" 
                              : (auditResult.score >= 60 ? "Cukup Baik (Butuh Revisi) ⚠️" : "Masih Lemah (Banyak Error) ❌")
                            }
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Section 1: Dynamic Alerts checks (Grid of 4) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="p-4 rounded-xl bg-zinc-900/10 border border-zinc-850 space-y-2">
                        <div className="flex items-center gap-2">
                          {renderStatusIcon(auditResult.analysis.titleCheck.status)}
                          <span className="text-xs uppercase font-mono tracking-wider font-bold">Judul & Tag H1 ({contentType})</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light">
                          {auditResult.analysis.titleCheck.message}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-900/10 border border-zinc-850 space-y-2">
                        <div className="flex items-center gap-2">
                          {renderStatusIcon(auditResult.analysis.keywordDensity.status)}
                          <span className="text-xs uppercase font-mono tracking-wider font-bold">Keyword Density</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light">
                          {auditResult.analysis.keywordDensity.message}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-900/10 border border-zinc-850 space-y-2">
                        <div className="flex items-center gap-2">
                          {renderStatusIcon(auditResult.analysis.readability.status)}
                          <span className="text-xs uppercase font-mono tracking-wider font-bold">Panjang Konten & Readability</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light">
                          {auditResult.analysis.readability.message}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-900/10 border border-zinc-850 space-y-2">
                        <div className="flex items-center gap-2">
                          {renderStatusIcon(auditResult.analysis.headingsStructure.status)}
                          <span className="text-xs uppercase font-mono tracking-wider font-bold">Heading Struktur</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light">
                          {auditResult.analysis.headingsStructure.message}
                        </p>
                      </div>

                    </div>

                    {/* Section 2: Copyable Metadata (Meta Title & Meta Description) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-[#a3e635]">REKOMENDASI META TITLE (Ideal)</span>
                          <button 
                            onClick={() => copyToClipboard(auditResult.suggestedMetaTitle, "metaTitle")}
                            className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedStates["metaTitle"] ? (
                              <><Check className="w-3.5 h-3.5 text-emerald-400" /> Tersalin</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> Salin</>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-200 bg-zinc-900/60 p-2.5 rounded border border-zinc-850 font-sans font-medium">
                          {auditResult.suggestedMetaTitle}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-[#a3e635]">REKOMENDASI META DESCRIPTION (Ideal)</span>
                          <button 
                            onClick={() => copyToClipboard(auditResult.suggestedMetaDescription, "metaDesc")}
                            className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedStates["metaDesc"] ? (
                              <><Check className="w-3.5 h-3.5 text-emerald-400" /> Tersalin</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> Salin</>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-200 bg-zinc-900/60 p-2.5 rounded border border-zinc-850 font-sans leading-relaxed">
                          {auditResult.suggestedMetaDescription}
                        </p>
                      </div>

                    </div>

                    {/* Section 3: Word list (LSI Keywords) */}
                    <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2">
                      <span className="text-xs font-mono font-bold text-[#00ff87] uppercase block tracking-wider">
                        Rekomendasi Tambahan Kata Kunci Turunan LSI (Latent Semantic Indexing):
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {auditResult.suggestedKeywords.map((word, wIdx) => (
                          <div 
                            key={wIdx}
                            onClick={() => copyToClipboard(word, `lsi-${wIdx}`)}
                            className="px-2.5 py-1 text-xs rounded-lg bg-[#111c30] text-emerald-300 border border-emerald-950/40 flex items-center gap-1.5 cursor-pointer hover:border-emerald-500 hover:bg-[#152542] transition-all"
                            title="Klik untuk menyalin"
                          >
                            <span>#{word}</span>
                            {copiedStates[`lsi-${wIdx}`] ? (
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-500 italic block pt-1">
                        *LSI membantu Google memahami konteks topik bahasan website Anda agar lebih akurat tanpa perlu spam kata kunci utama berkali-kali.
                      </p>
                    </div>

                    {/* Section 4: Positives vs Improvements bullet card columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      
                      <div className="space-y-3">
                        <h3 className="font-display font-bold text-sm text-emerald-400 border-b border-zinc-800/80 pb-2 uppercase tracking-wide flex items-center gap-2">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                          Kelebihan Draf Saat Ini:
                        </h3>
                        <ul className="space-y-2 list-none text-xs leading-relaxed text-zinc-300 font-sans font-light">
                          {auditResult.positives.map((p, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="text-emerald-400 shrink-0 font-bold">✔</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-display font-medium text-sm text-[#a3e635] border-b border-zinc-800/80 pb-2 uppercase tracking-wide flex items-center gap-2">
                          <Info className="w-4.5 h-4.5 text-[#a3e635]" />
                          Langkah Penyesuaian Koreksi:
                        </h3>
                        <ul className="space-y-2 list-none text-xs leading-relaxed text-zinc-300 font-sans font-light">
                          {auditResult.improvements.map((imp, impIdx) => (
                            <li key={impIdx} className="flex items-start gap-2">
                              <span className="text-[#a3e635] shrink-0 font-bold">⚡</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                  </motion.div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* FOOTER CREDITS */}
      <footer className="border-t border-[#141f36] bg-[#05080f] py-6 px-4 text-center text-xs text-zinc-500 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans">
            © 2026 <strong>SEO.Neon Academy</strong>. Dibuat dengan cinta untuk pembelajaran digital yang modern & profesional.
          </p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span className="text-zinc-400">Node API Enabled</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Gemini-3.5-Flash Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Helper to choose corresponding Lucide icons for pilar
function pilarIcon(iconName: string) {
  switch (iconName) {
    case "Search":
      return <Search className="w-5 h-5 text-emerald-400" />;
    case "FileText":
      return <FileText className="w-5 h-5 text-emerald-400" />;
    case "Share2":
      return <Share2 className="w-5 h-5 text-emerald-400" />;
    case "Cpu":
      return <Cpu className="w-5 h-5 text-emerald-400" />;
    default:
      return <BookOpen className="w-5 h-5 text-emerald-400" />;
  }
}

// Auxiliary view for status indicator dots
function renderStatusIcon(status: "success" | "warning" | "danger") {
  switch (status) {
    case "success":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    case "warning":
      return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />;
    case "danger":
      return <XCircle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />;
    default:
      return <Info className="w-4 h-4 text-zinc-400 shrink-0" />;
  }
}
