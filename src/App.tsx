import React, { useState, useEffect } from "react";
import { 
  Sparkles, Sliders, PlayCircle, Layers, Settings, History, 
  Trash2, AlertCircle, RefreshCw, BookOpen, Smile, Info, Landmark, Compass, 
  Paintbrush, Palette, HelpCircle, ChevronRight, Check, Heart, ExternalLink
} from "lucide-react";

import { LogoVariation, AnimationType, BackgroundTheme, ColorPreset, DesignHistoryItem } from "./types";
import { COLOR_PRESETS, STYLE_PREFERENCES, INDUSTRIES, SAMPLE_PROMPTS } from "./constants";
import LogoViewer from "./components/LogoViewer";
import WorkspaceLoader from "./components/WorkspaceLoader";
import BrandingManualModal from "./components/BrandingManualModal";

export default function App() {
  // Brand Configuration Form States
  const [companyName, setCompanyName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [selectedPreset, setSelectedPreset] = useState<ColorPreset>(COLOR_PRESETS[0]);
  const [stylePreference, setStylePreference] = useState(STYLE_PREFERENCES[0].name);
  const [customDescription, setCustomDescription] = useState("");

  // Creative Sandbox Status States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [designedVariations, setDesignedVariations] = useState<LogoVariation[]>([]);
  const [activeVariationIdx, setActiveVariationIdx] = useState(0);

  // Live Fine-Tuning & Customizer States
  const [customPrimaryColor, setCustomPrimaryColor] = useState("");
  const [customSecondaryColor, setCustomSecondaryColor] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editSlogan, setEditSlogan] = useState("");

  // Interactive Stage State
  const [animationStyle, setAnimationStyle] = useState<AnimationType>("line-draw");
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [scale, setScale] = useState(1);
  const [backgroundTheme, setBackgroundTheme] = useState<BackgroundTheme>("slate-luxury");
  const [replayTrigger, setReplayTrigger] = useState(0);

  // Refinement Instructions Side state
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Historical States
  const [history, setHistory] = useState<DesignHistoryItem[]>([]);
  const [showManualModal, setShowManualModal] = useState(false);

  // Load and Save local storage profiles for persistence
  useEffect(() => {
    const saved = localStorage.getItem("animated_logo_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse logo history:", e);
      }
    }
  }, []);

  const saveToHistory = (company: string, logo: LogoVariation) => {
    const newItem: DesignHistoryItem = {
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      companyName: company,
      logo,
    };
    const updated = [newItem, ...history].slice(0, 10); // Keep last 10 entries
    setHistory(updated);
    localStorage.setItem("animated_logo_history", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("animated_logo_history");
  };

  const loadHistoryItem = (item: DesignHistoryItem) => {
    setDesignedVariations([item.logo]);
    setActiveVariationIdx(0);
    setCompanyName(item.companyName);
    setEditCompanyName(item.logo.badgeText);
    setCustomPrimaryColor(item.logo.primaryColor);
    setCustomSecondaryColor(item.logo.secondaryColor);
    setSlogan("");
  };

  // Pre-populate with beautiful sample templates to quickly evaluate the app
  const handleLoadSample = (sample: typeof SAMPLE_PROMPTS[number]) => {
    setCompanyName(sample.company);
    setSlogan(sample.slogan);
    setIndustry(sample.industry);
    setStylePreference(sample.style);
    setSelectedPreset(sample.preset);
    setCustomDescription(sample.desc);
    
    // Auto clear error if present
    setGenerationError(null);
  };

  // Primary design pipeline caller
  const handleTriggerDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setGenerationError("Please enter your company or project name.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          slogan: slogan.trim(),
          industry,
          colorPreset: `${selectedPreset.name} (${selectedPreset.primary} and ${selectedPreset.secondary})`,
          stylePreference,
          description: customDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate designs. API error occur.");
      }

      if (data.variations && data.variations.length > 0) {
        setDesignedVariations(data.variations);
        setActiveVariationIdx(0);

        // Sync local tweak properties
        const first = data.variations[0];
        setCustomPrimaryColor(first.primaryColor);
        setCustomSecondaryColor(first.secondaryColor);
        setEditCompanyName(first.badgeText);
        setEditSlogan(slogan);

        // Save first designed variation to local storage logs
        saveToHistory(companyName, first);
        
        // Auto trigger write animation
        setAnimationStyle("line-draw");
        setReplayTrigger(prev => prev + 1);
      } else {
        throw new Error("Returned format was invalid, please try generating again.");
      }

    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "An unexpected error occurred during design. Make sure your API key is configured.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Refinement modifier pipeline
  const handleTriggerRefine = async () => {
    if (!refinementPrompt.trim()) return;

    const currentLogo = designedVariations[activeVariationIdx];
    if (!currentLogo) return;

    setIsRefining(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName || editCompanyName,
          slogan: slogan || editSlogan,
          originalLogo: currentLogo,
          refinementInstructions: refinementPrompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Refinement processing failed.");
      }

      if (data.svgCode) {
        // Embed the refined proposal next to the active variation array!
        // This lets users compare the new refined version easily.
        const refinedVariation: LogoVariation = {
          ...data,
          id: `refined-${Date.now()}`,
          vibeTitle: `Refined: ${data.vibeTitle || "Updated concept"}`,
        };

        const updatedVariations = [...designedVariations];
        // Insert right after active item
        updatedVariations.splice(activeVariationIdx + 1, 0, refinedVariation);
        
        setDesignedVariations(updatedVariations);
        setActiveVariationIdx(activeVariationIdx + 1);

        // Refresh customized properties
        setCustomPrimaryColor(refinedVariation.primaryColor);
        setCustomSecondaryColor(refinedVariation.secondaryColor);
        setEditCompanyName(refinedVariation.badgeText);
        setRefinementPrompt(""); // reset instruction box
        
        // Save to log
        saveToHistory(companyName || editCompanyName, refinedVariation);
        
        // Quick replay trigger
        setReplayTrigger(prev => prev + 1);
      } else {
        throw new Error("Invalid response schema generated on refinement iteration.");
      }

    } catch (err: any) {
      console.error(err);
      setGenerationError(`Refinement failed: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  const handleTabChange = (idx: number) => {
    setActiveVariationIdx(idx);
    const selected = designedVariations[idx];
    if (selected) {
      setCustomPrimaryColor(selected.primaryColor);
      setCustomSecondaryColor(selected.secondaryColor);
      setEditCompanyName(selected.badgeText);
      setReplayTrigger((prev) => prev + 1);
    }
  };

  // Switch tabs
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans p-6 gap-6 overflow-x-hidden">
      
      {/* Header Section styled after Bento theme */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-black/35">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/35 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-indigo-700 opacity-80" />
            <PlayCircle className="w-5 h-5 text-white animate-spin-slow rotate-45 relative z-10" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              FLOwGO
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] rounded border border-indigo-500/25 uppercase font-mono tracking-widest">GEMINI 3.5</span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-mono">Let FLow Your Logo</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {designedVariations.length > 0 && (
            <button
              onClick={() => setShowManualModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-705 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Identity Specs Booklet</span>
            </button>
          )}
          <span className="hidden lg:flex items-center gap-2 text-[10px] bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-850 font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            COORDINATES SYNC: ON
          </span>
        </div>
      </header>

      {/* Bento Grid Main Content Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column Profile & Design Input Panel (lg:span-4) - Styled as Bento Prompt Brief Card */}
        <section className="lg:col-span-4 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-6 shadow-md shadow-black/20">
          
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                Design Brief
              </h2>
              <p className="text-[10px] text-zinc-500">Configure parameters or pick quick start templates.</p>
            </div>
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] rounded border border-indigo-500/20 font-mono uppercase tracking-widest">AI ACTIVE</span>
          </div>

          {/* Quick-Starter templates block */}
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 space-y-3">
            <span className="text-[10px] uppercase font-black tracking-widest font-mono text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Quick Design Templates
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PROMPTS.map((sample) => (
                <button
                  key={sample.company}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="p-2.5 text-left bg-zinc-900/40 hover:bg-zinc-900/80 text-[11px] rounded-lg border border-zinc-850 hover:border-zinc-700 transition group"
                >
                  <p className="font-bold text-zinc-200 group-hover:text-indigo-400 transition truncate">{sample.company}</p>
                  <p className="text-zinc-500 text-[9px] uppercase tracking-wider truncate mt-0.5">{sample.industry}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Builder Form */}
          <form onSubmit={handleTriggerDesign} className="space-y-5 flex-1 flex flex-col justify-between">
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-wider block">Company / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., AURA or ZENITH TECH"
                  className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 tracking-wide transition outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-wider block">Tagline / Slogan (Optional)</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="e.g., Intelligence Redefined"
                  className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 tracking-wide transition outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-wider block">Industry Sector</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-[11px] text-zinc-300 focus:border-indigo-500 transition outline-none font-medium"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-zinc-950 text-zinc-350">{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-wider block">Style Vibe</label>
                  <select
                    value={stylePreference}
                    onChange={(e) => setStylePreference(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-[11px] text-zinc-300 focus:border-indigo-500 transition outline-none font-medium"
                  >
                    {STYLE_PREFERENCES.map((sty) => (
                      <option key={sty.name} value={sty.name}>{sty.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Color Palette Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-wider block">Color Vibe Coordinates</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setSelectedPreset(preset)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] transition-all ${
                        selectedPreset.name === preset.name
                          ? "bg-zinc-900 border-indigo-500/80 text-white shadow-inner"
                          : "bg-zinc-950/40 border-zinc-850/80 text-zinc-400 hover:border-zinc-800"
                      }`}
                    >
                      <span className="font-semibold tracking-wide text-zinc-300">{preset.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: preset.primary }} />
                        <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: preset.secondary }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-wider block">Symbol concept guidelines</label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your logo (e.g. minimalist flow, geometric shapes, ethereal line structures...)"
                  className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-700 transition outline-none resize-none leading-relaxed"
                />
              </div>

              {generationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold uppercase text-[9px] tracking-wider">Generation Stopped</p>
                    <p className="leading-relaxed text-[11px]">{generationError}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black tracking-widest uppercase transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/15"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Iterating Graphic Nodes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>GENERATE ASSETS</span>
                </>
              )}
            </button>

          </form>

          {/* Local Storage Records Tray */}
          {history.length > 0 && (
            <div className="mt-2 border-t border-zinc-800/60 pt-4 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="uppercase font-bold tracking-widest flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-zinc-400" /> Recent Generations</span>
                <button 
                  onClick={handleClearHistory}
                  className="hover:text-red-400 transition ml-2"
                  title="Wipe Logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {history.map((item, idx) => (
                  <button
                    key={`${item.logo.id}-${idx}`}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full p-2.5 bg-zinc-950/40 hover:bg-zinc-900/60 rounded-xl border border-zinc-850 text-left text-xs transition flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-zinc-300 group-hover:text-indigo-400 transition">{item.companyName}</p>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">{item.logo.vibeTitle}</p>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-650 shrink-0 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">{item.timestamp}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* Right Column Studio Stage / Creative Sandbox Workspace (lg:span-8) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {isGenerating ? (
            <div className="flex-1 flex items-center justify-center p-6 bg-zinc-900/35 border border-zinc-800/80 rounded-2xl min-h-[500px]">
              <WorkspaceLoader companyName={companyName} />
            </div>
          ) : designedVariations.length > 0 ? (
            <div className="flex flex-col gap-6 h-full">

              {/* Proposal Tab Selectors styled as a clean Bento header block */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800/80">
                <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
                  {designedVariations.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => handleTabChange(idx)}
                      className={`text-xs px-4 py-2 font-bold rounded-xl transition-all ${
                        activeVariationIdx === idx
                          ? "bg-zinc-800/90 border border-zinc-700/80 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/40"
                      }`}
                    >
                      Proposal {String.fromCharCode(65 + idx)}: {v.vibeTitle.replace(/^refined:\s*/i, "Refined: ")}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-850 text-[10px] font-bold font-mono text-zinc-400 self-end sm:self-auto uppercase tracking-wider">
                  <span>Rating score:</span>
                  <span className="text-indigo-400 font-black">{designedVariations[activeVariationIdx].ratingScore}%</span>
                </div>
              </div>

              {/* Grid Workspace containing Logo rendering display area + micro-tuning sidebar controls */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
                
                {/* SVG Visualizer Canvas Frame - styled with beautiful glass backdrop-blur and radial glow overlay */}
                <div className="xl:col-span-2 relative flex flex-col min-h-[460px]">
                  <LogoViewer
                    logo={designedVariations[activeVariationIdx]}
                    animation={animationStyle}
                    backgroundTheme={backgroundTheme}
                    customPrimary={customPrimaryColor}
                    customSecondary={customSecondaryColor}
                    customCompanyName={editCompanyName}
                    customSlogan={editSlogan}
                    speed={speed}
                    glowIntensity={glowIntensity}
                    scale={scale}
                    triggerReplay={replayTrigger}
                  />
                </div>

                {/* Micro-Tuning Sidebar Controls - styled as tight elegant Bento block */}
                <div className="space-y-6 flex flex-col justify-between">
                  
                  {/* Animation Control Block */}
                  <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/85 space-y-4 shadow-sm">
                    <h3 className="text-xs uppercase tracking-widest font-black font-mono text-zinc-400 flex items-center justify-between border-b border-zinc-800/60 pb-3">
                      <span className="flex items-center gap-2 text-indigo-400"><PlayCircle className="w-4 h-4" /> Motion Presets</span>
                      <button
                        onClick={() => setReplayTrigger((prev) => prev + 1)}
                        className="text-[10px] font-bold font-mono text-zinc-400 hover:text-white transition flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800"
                      >
                        <RefreshCw className="w-3 h-3 text-indigo-400" /> Replay
                      </button>
                    </h3>

                    {/* Selector triggers */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                      {[
                        { id: "line-draw", label: "Line Drawing Draft", desc: "First traces paths outlines, then blooms solid colors" },
                        { id: "reveal", label: "Structural Spring Stagger", desc: "Elements slide in and bounce on spring axis sequentially" },
                        { id: "glow", label: "Neon Pulse Glow", desc: "Applies soft light intensity loops to gradient shapes" },
                        { id: "spin", label: "Orbital Galaxy Spin", desc: "Gently rotates surrounding graphical components" },
                        { id: "none", label: "Static Vector State", desc: "Displays crisp static curves with low overhead" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setAnimationStyle(item.id as AnimationType)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                            animationStyle === item.id
                              ? "bg-indigo-650/15 border-indigo-500/40 text-indigo-300"
                              : "bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                          }`}
                        >
                          <p className="font-bold flex items-center gap-1.5 uppercase tracking-wide text-zinc-250">
                            {animationStyle === item.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                            {item.label}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{item.desc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Speed selection */}
                    <div className="space-y-2.5 pt-3 border-t border-zinc-800/60">
                      <div className="flex justify-between text-[10px] font-black font-mono text-zinc-400 uppercase mb-1">
                        <span>Motion Speed</span>
                        <span className="text-indigo-400 uppercase">{speed}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {["slow", "normal", "fast"].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSpeed(s as any)}
                            className={`py-1.5 rounded-lg font-mono text-[10px] uppercase border transition font-bold ${
                              speed === s
                                ? "bg-zinc-800 border-zinc-700 text-white"
                                : "bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Stage styling options */}
                  <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/85 space-y-4 shadow-sm flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-black font-mono text-zinc-400 flex items-center gap-2 border-b border-zinc-800/60 pb-3">
                        <Sliders className="w-4 h-4 text-indigo-400" /> Stage Configurations
                      </h3>

                      <div className="space-y-4 mt-4">
                        {/* Grid / Environment selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold font-mono text-zinc-400 block tracking-wider">Backbone Canvas Backdrop</label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                              { id: "dark-grid", label: "Carbon Grid" },
                              { id: "light-grid", label: "Blueprint Grid" },
                              { id: "slate-luxury", label: "Aura Atmosphere" },
                              { id: "pure-white", label: "Pure White" },
                            ].map((theme) => (
                              <button
                                key={theme.id}
                                onClick={() => setBackgroundTheme(theme.id as BackgroundTheme)}
                                className={`py-2 px-2.5 text-center text-[10px] font-bold rounded-lg border transition ${
                                  backgroundTheme === theme.id
                                    ? "bg-zinc-800 border-zinc-700 text-white"
                                    : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-zinc-350"
                                }`}
                              >
                                {theme.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Lighting Glow intensity */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold font-mono text-zinc-400 mb-1">
                            <span>AMBIENT GLOW</span>
                            <span className="text-indigo-400 font-bold">{Math.round(glowIntensity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1.5"
                            step="0.1"
                            value={glowIntensity}
                            onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-zinc-950 rounded-lg cursor-pointer"
                          />
                        </div>

                        {/* Frame scale */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold font-mono text-zinc-400 mb-1">
                            <span>STAGE SCALE</span>
                            <span className="text-indigo-400 font-bold">{Math.round(scale * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="1.6"
                            step="0.05"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-zinc-950 rounded-lg cursor-pointer"
                          />
                        </div>

                      </div>
                    </div>

                    {/* Motion Engine Waveform Timeline decoration inside Bento stage configurations context */}
                    <div className="pt-4 border-t border-zinc-800/50 flex flex-col justify-end">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-wider">Motion Engine Timeline</span>
                        <span className="text-[10px] font-mono text-red-400 animate-pulse">RENDER: F-48</span>
                      </div>
                      <div className="relative h-10 bg-zinc-950 rounded border border-zinc-850 overflow-hidden mb-2">
                        <div className="absolute left-[40%] top-0 bottom-0 w-0.5 bg-indigo-500 z-20" />
                        <div className="absolute bottom-0 left-0 w-full flex items-end gap-0.5 px-2">
                          <div className="w-full h-7 bg-indigo-500/10 rounded-t-sm flex items-end gap-0.5">
                            <div className="flex-1 h-3 bg-indigo-500/30"></div>
                            <div className="flex-1 h-5 bg-indigo-500/40"></div>
                            <div className="flex-1 h-2 bg-indigo-550/30"></div>
                            <div className="flex-1 h-6 bg-indigo-500/50"></div>
                            <div className="flex-1 h-7 bg-indigo-500"></div>
                            <div className="flex-1 h-4 bg-indigo-500/40"></div>
                            <div className="flex-1 h-2 bg-indigo-500/20"></div>
                            <div className="flex-1 h-6 bg-indigo-505/60"></div>
                            <div className="flex-1 h-4 bg-indigo-500/30"></div>
                            <div className="flex-1 h-3 bg-indigo-500/20"></div>
                            <div className="flex-1 h-1 bg-indigo-500/10"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-650">
                        <span>00:00:00</span>
                        <span>00:00:04</span>
                        <span>00:00:08</span>
                        <span>00:00:12</span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Dynamic Vector Adjustments & Color overrides - styled as sibling Bento Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* On the fly Customizer */}
                <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/80 space-y-4 shadow-md">
                  <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
                    <Paintbrush className="w-4 h-4 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">Instant Override Tweak Sandbox</h4>
                      <p className="text-[10px] text-zinc-500">Override vector properties immediately in real-time.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Interactive Color pickers */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block tracking-wider">Override Primary</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customPrimaryColor}
                            onChange={(e) => setCustomPrimaryColor(e.target.value)}
                            className="bg-transparent border border-zinc-800 hover:border-zinc-700 rounded cursor-pointer w-9 h-9"
                          />
                          <input
                            type="text"
                            value={customPrimaryColor}
                            onChange={(e) => setCustomPrimaryColor(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs font-mono text-zinc-200 select-all uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block tracking-wider">Override Secondary</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customSecondaryColor}
                            onChange={(e) => setCustomSecondaryColor(e.target.value)}
                            className="bg-transparent border border-zinc-800 hover:border-zinc-700 rounded cursor-pointer w-9 h-9"
                          />
                          <input
                            type="text"
                            value={customSecondaryColor}
                            onChange={(e) => setCustomSecondaryColor(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs font-mono text-zinc-200 select-all uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Text tweak */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block tracking-wider">Edit Wordmark Text</label>
                      <input
                        type="text"
                        value={editCompanyName}
                        onChange={(e) => setEditCompanyName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white font-semibold font-mono"
                      />
                    </div>

                  </div>
                </div>

                {/* Gemini Collaboration Box - Iterative tweaks */}
                <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/80 space-y-4 shadow-md">
                  <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">Ask Gemini to Modify Vector</h4>
                      <p className="text-[10px] text-zinc-500">Instruct of any structural revision to rebuild paths.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <textarea
                      value={refinementPrompt}
                      onChange={(e) => setRefinementPrompt(e.target.value)}
                      placeholder="e.g., 'make the symbol rounded and double the line curves', 'embed a small polygon at the top center'..."
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-700 outline-none resize-none transition"
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleTriggerRefine}
                        disabled={isRefining || !refinementPrompt.trim()}
                        className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-xl transition flex items-center gap-1.5 text-white disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        {isRefining ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Transforming paths...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                            <span>Apply Refinement</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Standby mockup empty state view styled as large preview Bento grid card */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[500px] border border-zinc-800 border-dashed rounded-3xl bg-zinc-900/10 max-w-3xl mx-auto space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.06)_0%,transparent_70%)]" />
              
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/10 blur-2xl animate-pulse rounded-full" />
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shadow-xl relative z-10">
                  <Sparkles className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-2 max-w-md relative z-10">
                <h3 className="text-xl font-bold font-mono uppercase tracking-wider text-white">Dynamic Brand Laboratory</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Design bespoke vector layouts and instantly calibrate them with adjustable entry strokes, rotation physics guidelines and custom overrides.
                </p>
              </div>

              {/* Sample presets guide with stylish blocks */}
              <div className="w-full max-w-lg pt-4 border-t border-zinc-805 space-y-3 relative z-10">
                <p className="text-[10px] uppercase font-black tracking-widest font-mono text-zinc-500">Pick any quick starter brief to begin</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {SAMPLE_PROMPTS.map((sample) => (
                    <button
                      key={sample.company}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="p-3.5 bg-zinc-950/50 hover:bg-zinc-900/80 rounded-xl text-left border border-zinc-850 hover:border-zinc-700 transition"
                    >
                      <span className="font-bold text-zinc-200 block truncate mb-1">{sample.company}</span>
                      <span className="text-[10px] text-zinc-500 block truncate leading-tight mt-0.5 italic">"{sample.desc}"</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </section>

      </main>

      {/* Brand Identity specs modal booklet */}
      {showManualModal && designedVariations.length > 0 && (
        <BrandingManualModal
          logo={designedVariations[activeVariationIdx]}
          customPrimary={customPrimaryColor}
          customSecondary={customSecondaryColor}
          onClose={() => setShowManualModal(false)}
          onCopyCode={() => {
            navigator.clipboard.writeText(designedVariations[activeVariationIdx].svgCode);
            alert("SVG Code copied successfully to clipboard!");
          }}
        />
      )}

      {/* Bento Bottom Info Rail */}
      <footer className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 px-6 shadow-md">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">GPU ACCELERATION: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest font-semibold text-zinc-300">Project:</span>
            <span className="text-[10px] text-zinc-500 font-mono uppercase">LOGOFLOW_STUDIO_MAIN_ROOT</span>
          </div>
        </div>
        <div className="text-[10px] tracking-wider text-zinc-400 uppercase font-mono flex items-center gap-5">
          <span className="hover:text-indigo-400 transition cursor-pointer">Help</span>
          <span className="hover:text-indigo-400 transition cursor-pointer">Settings</span>
          <span className="hover:text-indigo-400 transition cursor-pointer font-bold text-indigo-400">v2.4.0</span>
        </div>
      </footer>

    </div>
  );
}
