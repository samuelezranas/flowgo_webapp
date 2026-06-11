import React from "react";
import { X, Copy, Check, Download, Layers, ShieldCheck, Type, Sparkles, ExternalLink } from "lucide-react";
import { LogoVariation } from "../types";

interface Props {
  logo: LogoVariation;
  customPrimary: string;
  customSecondary: string;
  onClose: () => void;
  onCopyCode: () => void;
}

export default function BrandingManualModal({
  logo,
  customPrimary,
  customSecondary,
  onClose,
  onCopyCode,
}: Props) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPalette = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadBrandSpecs = () => {
    const textContent = `BRAND IDENTITY SPECS - ${logo.badgeText.toUpperCase()}
======================================================
Vibe Concept: ${logo.vibeTitle}
Original Rating index: ${logo.ratingScore}/100

BRAND COLOR SCHEME
------------------------------------------------------
Primary Hex Color: ${customPrimary}
Secondary Hex Color: ${customSecondary}

DESIGN PHILOSOPHY & CONCEPTUAL DESCRIPTION
------------------------------------------------------
${logo.conceptDescription}

TYPOGRAPHY SYSTEM SUGGESTIONS
------------------------------------------------------
Title Component: UPPERCASE, heavy geometric weighting. Prefer 'Inter Bold' or heavy-sans.
Slogan Component: Sub-spaced track elements. Prefer 'Inter Regular' tracking=4.

EXPORT PROTOCOL & USAGE GUIDELINES
------------------------------------------------------
- High contrast environments: Display on Slate Navy or Carbon Obsidian background.
- Dark Theme: Maintain high luminous factor of gradients.
- Scalability: Fully fluid vector format. Ready for high-resolution standard print.
======================================================
Generated at Custom Animated Logo Designer Studio.
`;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${logo.badgeText.toLowerCase()}-brand-manual.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-550/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider">Brand Identity Specs Booklet</h3>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold mt-0.5">Asset guidelines and details for {logo.badgeText}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg text-zinc-450 hover:text-white hover:bg-zinc-900 border border-zinc-850/40 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-zinc-200">
          
          {/* Cover Header */}
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 rounded-xl border border-zinc-850 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="space-y-2.5 w-full md:w-auto">
              <span className="text-[8px] uppercase tracking-widest font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                Official Release Guidelines
              </span>
              <h4 className="text-2xl font-black font-mono text-white select-all uppercase tracking-tight mt-1">{logo.badgeText.toUpperCase()}</h4>
              <p className="text-[11px] text-zinc-450">"{logo.vibeTitle}" proposal is evaluated at Quality Index <strong className="text-indigo-400 bg-zinc-950 px-2 py-0.5 rounded font-mono border border-zinc-850">{logo.ratingScore}%</strong></p>
            </div>
            <div className="h-28 w-28 bg-zinc-950 rounded-xl p-2 border border-zinc-850 flex items-center justify-center relative overflow-hidden shrink-0">
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle, ${customPrimary} 1.5px, transparent 1.5px)`,
                  backgroundSize: "8px 8px"
                }}
              />
              <div 
                className="w-full h-full text-center"
                dangerouslySetInnerHTML={{ __html: logo.svgCode }}
              />
            </div>
          </div>

          {/* Design Philosophy */}
          <div className="space-y-3">
            <h5 className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest font-mono">
              <Layers className="w-4 h-4 text-indigo-400" />
              Design Philosophy & Rationale
            </h5>
            <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-850">
              <p>{logo.conceptDescription}</p>
            </div>
          </div>

          {/* Color Palettes Grid */}
          <div className="space-y-4">
            <h5 className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest font-mono">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Digital Coordinates & Color Systems
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Primary Color Card */}
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl border border-white/10 shadow-inner" 
                    style={{ backgroundColor: customPrimary }} 
                  />
                  <div>
                    <p className="text-[10px] text-zinc-500 font-mono font-bold tracking-wide">PRIMARY CORE COLOR</p>
                    <p className="text-sm font-black text-white font-mono uppercase mt-0.5">{customPrimary}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopyPalette(customPrimary)}
                  className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition border border-transparent hover:border-zinc-800"
                  title="Copy Hex Color"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Secondary Color Card */}
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl border border-white/10 shadow-inner" 
                    style={{ backgroundColor: customSecondary }} 
                  />
                  <div>
                    <p className="text-[10px] text-zinc-500 font-mono font-bold tracking-wide">SECONDARY ACCENT COLOR</p>
                    <p className="text-sm font-black text-white font-mono uppercase mt-0.5">{customSecondary}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopyPalette(customSecondary)}
                  className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition border border-transparent hover:border-zinc-800"
                  title="Copy Hex Color"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Typographic suggestions */}
          <div className="bg-zinc-950/60 p-5 rounded-xl border border-zinc-850 space-y-4">
            <h5 className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest font-mono">
              <Type className="w-4 h-4 text-indigo-400" />
              Brand Typography Hierarchy
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono leading-relaxed">
              <div className="space-y-1">
                <p className="text-zinc-500 font-bold uppercase">WORDMARK FONT RECOMMENDATION</p>
                <p className="text-xs font-bold text-white">Inter Display, Heavy Sans, System Grotesk</p>
                <p className="text-zinc-500">Specs: font-weight="800" text-transform="uppercase" letter-spacing="1px"</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 font-bold uppercase">SLOGAN FONT RECOMMENDATION</p>
                <p className="text-xs font-bold text-white">Inter Regular, Fira Mono, Mono-spaced System</p>
                <p className="text-zinc-500">Specs: font-weight="400" text-transform="uppercase" letter-spacing="4px"</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            {copied && (
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Copied color code
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCopyCode}
              className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-900 rounded-xl text-xs font-bold text-zinc-300 hover:text-white border border-zinc-800 transition active:scale-95"
            >
              <Copy className="w-4 h-4 text-zinc-400" />
              Copy SVG code
            </button>
            <button
              onClick={downloadBrandSpecs}
              className="flex items-center gap-2 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white transition active:scale-95 shadow-lg shadow-indigo-600/15 uppercase tracking-widest"
            >
              <Download className="w-4 h-4 text-indigo-200" />
              Export Guidelines
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
