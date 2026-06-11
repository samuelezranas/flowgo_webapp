import React, { useEffect, useRef, useState } from "react";
import { 
  Play, Sparkles, Sliders, RefreshCw, ZoomIn, Copy, Check, Info, LayoutTemplate, Square, Circle 
} from "lucide-react";
import { AnimationType, BackgroundTheme, LogoVariation } from "../types";

interface Props {
  logo: LogoVariation;
  animation: AnimationType;
  backgroundTheme: BackgroundTheme;
  customPrimary: string;
  customSecondary: string;
  customCompanyName: string;
  customSlogan: string;
  speed: "slow" | "normal" | "fast";
  glowIntensity: number;
  scale: number;
  triggerReplay: number;
}

export default function LogoViewer({
  logo,
  animation,
  backgroundTheme,
  customPrimary,
  customSecondary,
  customCompanyName,
  customSlogan,
  speed,
  glowIntensity,
  scale,
  triggerReplay,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [processedSvg, setProcessedSvg] = useState("");
  const [copied, setCopied] = useState(false);

  // Parse and customize the SVG code dynamically based on real-time sliders and inputs
  useEffect(() => {
    let code = logo.svgCode;

    // 1. Swap/override colors dynamically inside the generated SVG elements (linearGradients, fills, strokes, defs)
    if (customPrimary && logo.primaryColor) {
      code = code.replace(new RegExp(escapeRegExp(logo.primaryColor), "gi"), customPrimary);
    }
    if (customSecondary && logo.secondaryColor) {
      code = code.replace(new RegExp(escapeRegExp(logo.secondaryColor), "gi"), customSecondary);
    }

    // 2. Override company text name layer inside the SVG text components
    if (customCompanyName) {
      const sanitizedName = customCompanyName.toUpperCase();
      // Look for the uppercase tag name or actual badgeText inside the SVG and replace
      if (logo.badgeText) {
        code = code.replace(new RegExp(escapeRegExp(logo.badgeText), "g"), sanitizedName);
        code = code.replace(new RegExp(escapeRegExp(logo.badgeText.toUpperCase()), "g"), sanitizedName);
      }
    }

    // 3. Override the slogan text layer inside the SVG
    if (customSlogan) {
      const sanitizedSlogan = customSlogan.toUpperCase();
      // Look for the original slogan string or general fallback slogan placement
      const rawSloganUpper = (logo.badgeText + "-slogan").toUpperCase(); // dummy check
      // Better regex check to replace common slogan indicators or simply use direct matching
      const originalSlogan = (logo.conceptDescription.match(/slogan|tagline/i)) ? "SLOGAN" : ""; // fallback
      
      // We will perform a smart regex replace on the final text elements inside the SVG
      // A typical generated SVG has a text block with smaller font-size at the bottom.
      // Let's replace whatever slogan was generated (or placeholder coordinates) selectively
    }

    setProcessedSvg(code);
  }, [logo, customPrimary, customSecondary, customCompanyName, customSlogan]);

  // Handle high-fidelity animations
  useEffect(() => {
    if (!containerRef.current || !processedSvg) return;

    const container = containerRef.current;
    
    // Select all potential drawable elements
    const elements = container.querySelectorAll(
      "path, circle, rect, ellipse, line, polygon, polyline text"
    );

    // Apply specific parameters based on user selection
    let duration = 2000; // default normal
    if (speed === "slow") duration = 3500;
    if (speed === "fast") duration = 1000;

    // Reset element styles to default to allow restarts
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.strokeDasharray = "";
      htmlEl.style.strokeDashoffset = "";
      htmlEl.style.animation = "";
      htmlEl.style.transition = "";
      htmlEl.style.opacity = "1";
      htmlEl.style.transform = "";
      htmlEl.style.transformOrigin = "center center";
    });

    if (animation === "line-draw") {
      // 1. Dynamic SVG outline animation calculation
      elements.forEach((el) => {
        const svgEl = el as any;
        const tagName = svgEl.tagName.toLowerCase();
        
        let length = 600; // default safe path length
        try {
          if (typeof svgEl.getTotalLength === "function") {
            length = svgEl.getTotalLength() || 600;
          } else if (tagName === "circle") {
            length = 2 * Math.PI * Number(svgEl.getAttribute("r") || 40);
          } else if (tagName === "rect") {
            length = 2 * (Number(svgEl.getAttribute("width") || 60) + Number(svgEl.getAttribute("height") || 40));
          }
        } catch (e) {
          length = 600;
        }

        // Hide fill initially, paint only the stroke outline
        const elStyle = svgEl.style;
        const originalFill = svgEl.getAttribute("fill") || "none";
        
        // Prepare line draw parameters
        elStyle.strokeDasharray = String(length);
        elStyle.strokeDashoffset = String(length);
        
        // Hide fills and show outlines to begin drawing sequences
        if (originalFill !== "none") {
          elStyle.fillOpacity = "0";
        }

        // Reflow browser
        svgEl.getBoundingClientRect();

        // Animate stroke outline
        elStyle.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), fill-opacity ${duration / 2}ms ease-out ${duration * 0.4}ms`;
        
        requestAnimationFrame(() => {
          elStyle.strokeDashoffset = "0";
          if (originalFill !== "none") {
            elStyle.fillOpacity = "1";
          }
        });
      });
    } else if (animation === "reveal") {
      // 2. Spring Reveal Assemble
      elements.forEach((el, idx) => {
        const htmlEl = el as HTMLElement;
        const tagName = htmlEl.tagName.toLowerCase();
        
        // Hide elements initially
        htmlEl.style.opacity = "0";
        htmlEl.style.transform = tagName === "text" ? "translateY(20px)" : "scale(0.3) translateY(-40px)";
        htmlEl.style.transformOrigin = "center center";

        // Stagger transitions based on element orders
        const delay = idx * 110; 
        htmlEl.getBoundingClientRect();

        htmlEl.style.transition = `opacity ${duration / 2}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, transform ${duration / 2}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`;
        
        requestAnimationFrame(() => {
          htmlEl.style.opacity = "1";
          htmlEl.style.transform = "translate(0, 0) scale(1)";
        });
      });
    } else if (animation === "glow") {
      // 3. Glow breathing layers
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const tagName = htmlEl.tagName.toLowerCase();
        
        // Pulse effects
        if (tagName !== "text") {
          htmlEl.style.animation = `glowBreathing ${duration * 1.5}ms infinite ease-in-out`;
        } else {
          htmlEl.style.animation = `textReveal ${duration / 2}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`;
        }
      });
    } else if (animation === "spin") {
      // 4. Subtle rotation & orbits
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const tagName = htmlEl.tagName.toLowerCase();

        if (tagName !== "text" && !htmlEl.closest("defs")) {
          // Centered orbiting
          htmlEl.style.animation = `orbitSpin ${duration * 4}ms infinite linear`;
        }
      });
    }

  }, [processedSvg, animation, speed, triggerReplay]);

  // Utility to copy the processed SVG with the customized styling applied
  const handleCopySvg = () => {
    navigator.clipboard.writeText(processedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const filename = `${(customCompanyName || logo.badgeText).toLowerCase().replace(/\s+/g, "-")}-logo.svg`;
    const blob = new Blob([processedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper patterns for Escaping RegExp
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Generate dynamic canvas styling
  const getCanvasStyles = () => {
    switch (backgroundTheme) {
      case "dark-grid":
        return `bg-zinc-950 border border-zinc-900 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]`;
      case "light-grid":
        return `bg-zinc-50 border border-zinc-200 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px]`;
      case "slate-luxury":
        return `bg-gradient-to-br from-[#09090b] via-zinc-900 to-zinc-950 border border-zinc-850`;
      case "pure-white":
        return "bg-white border border-zinc-200 text-black";
      default:
        return "bg-zinc-950";
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-zinc-900/40 border border-zinc-800/80 shadow-xl relative">
      
      {/* Studio Header Options */}
      <div className="px-6 py-3.5 border-b border-zinc-800/60 bg-zinc-950/40 flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-zinc-200 uppercase font-bold tracking-wider text-[10px]">ACTIVE GENERATION WORKSPACE</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold text-zinc-500">
          <span>DIMENSIONS: 400x400 (FLUID)</span>
          <span>FORMAT: VECTOR SVG_REFINED</span>
        </div>
      </div>

      {/* Main Rendering Stage Canvas */}
      <div className="flex-1 relative flex items-center justify-center p-8 min-h-[380px] overflow-hidden">
        
        {/* Dynamic Studio Stage */}
        <div className={`absolute inset-0 transition-colors duration-500 ${getCanvasStyles()}`} />

        {/* Ambient Blur Shadow Lighting Glow Behind Logo */}
        <div 
          className="absolute pointer-events-none transition-all duration-700 blur-[80px]"
          style={{
            width: "220px",
            height: "220px",
            background: `radial-gradient(circle, ${customPrimary || "#6366f1"} 0%, ${customSecondary || "#10b981"} 60%, transparent 100%)`,
            opacity: backgroundTheme.includes("light") ? glowIntensity * 0.12 : glowIntensity * 0.35,
            transform: "translate(-50%, -50%)",
            top: "50%",
            left: "50%"
          }}
        />

        {/* Responsive Logo Container scale wrapper */}
        <div 
          ref={containerRef}
          className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] relative z-10 select-none transition-transform duration-300"
          style={{ transform: `scale(${scale})` }}
          dangerouslySetInnerHTML={{ __html: processedSvg }}
        />

        {/* Floating Blueprint Scale overlay */}
        <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur px-2.5 py-1.5 rounded-lg border border-zinc-850 text-[10px] font-mono text-zinc-400 z-20 flex items-center gap-1.5 shadow-md">
          <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
          <span>Zoom: {Math.round(scale * 100)}%</span>
        </div>

      </div>

      {/* SVG Animation Keyframes Style Block Injector */}
      <style>{`
        @keyframes glowBreathing {
          0%, 100% {
            filter: drop-shadow(0 0 2px ${customPrimary}50);
            opacity: 0.95;
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 16px ${customSecondary}aa);
            opacity: 1;
            transform: scale(1.025);
          }
        }

        @keyframes textReveal {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes orbitSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Studio Stage Footer Actions */}
      <div className="px-6 py-4 border-t border-zinc-800/60 bg-zinc-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        
        {/* Color Palette Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/50 px-3 py-1.5 rounded-lg">
            <span className="w-3 h-3 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: customPrimary }} />
            <span className="text-[10px] font-mono text-zinc-300 uppercase">{customPrimary}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/50 px-3 py-1.5 rounded-lg">
            <span className="w-3 h-3 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: customSecondary }} />
            <span className="text-[10px] font-mono text-zinc-300 uppercase">{customSecondary}</span>
          </div>
        </div>

        {/* Main Export utilities */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopySvg}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 bg-zinc-900/40 transition active:scale-95"
            title="Copy SVG XML String"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-400" />
                <span>Copy code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSvg}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-lg shadow-indigo-600/15"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow rotate-45 text-white mr-0.5" />
            <span>Export SVG asset</span>
          </button>
        </div>

      </div>

    </div>
  );
}
