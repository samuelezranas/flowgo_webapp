import { useEffect, useState } from "react";
import { Sparkles, Compass, Cpu, Palette, Sliders, Type } from "lucide-react";

interface Props {
  companyName: string;
}

const STEPS = [
  {
    icon: Compass,
    title: "Deconstructing Brief",
    desc: "Ingesting brand identity values, industry guidelines, and context prompts into design canvas",
    color: "text-blue-400",
  },
  {
    icon: Palette,
    title: "Synthesizing Color Coordinates",
    desc: "Generating radiant multi-stop gradients from the requested palette selection",
    color: "text-purple-400",
  },
  {
    icon: Cpu,
    title: "Formulating SVG Bezier Paths",
    desc: "Generating premium bezier vectors with exact mathematically-balanced anchor parameters",
    color: "text-cyan-400",
  },
  {
    icon: Type,
    title: "Aligning Typography Systems",
    desc: "Matching and positioning centered name wordmark and tagline layers on the 400x400 grid",
    color: "text-emerald-400",
  },
  {
    icon: Sliders,
    title: "Structuring Animatable Nodes",
    desc: "Structuring clean stroke-dash and group layers with descriptive classes for dynamic movement",
    color: "text-amber-400",
  },
];

export default function WorkspaceLoader({ companyName }: Props) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle steps
    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);

    // Dynamic progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 98) {
          const increment = Math.max(1, Math.floor((100 - prev) / 10)); // slow down near 100%
          return prev + increment;
        }
        return prev;
      });
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentIcon = STEPS[currentStepIdx].icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] p-8 text-center bg-zinc-950 border border-zinc-850 rounded-2xl relative overflow-hidden max-w-2xl mx-auto shadow-2xl animate-fade-in w-full">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_70%)]" />
      <div 
        className="absolute w-64 h-64 blur-3xl opacity-20 hover:opacity-30 transition pointer-events-none rounded-full"
        style={{
          background: `radial-gradient(circle, ${
            currentStepIdx === 0 ? "#6366f1" : 
            currentStepIdx === 1 ? "#a855f7" : 
            currentStepIdx === 2 ? "#06b6d4" : 
            currentStepIdx === 3 ? "#10b981" : "#f59e0b"
          } 0%, transparent 70%)`
        }}
      />

      {/* Center Icon Ring wrapper */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
        <div className="w-20 h-20 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900/80 animate-spin-slow">
          <div className="w-16 h-16 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
            {/* Spinning orbit */}
            <div className="absolute w-3 h-3 bg-indigo-500 rounded-full offset-x-10 animate-bounce" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <CurrentIcon className={`w-8 h-8 ${STEPS[currentStepIdx].color} transition-all duration-500 transform scale-110`} />
        </div>
      </div>

      {/* Text Info */}
      <div className="space-y-2 relative z-10 max-w-md">
        <h4 className="text-sm font-black font-mono tracking-wider uppercase text-white flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          Creative Engine Active
        </h4>
        <p className="text-xs text-zinc-400 font-medium font-mono">
          Designing brand identity for <span className="text-indigo-400 font-black">"{companyName.toUpperCase()}"</span>
        </p>
        
        {/* Step Transition Frame */}
        <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-850 min-h-[96px] flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-indigo-400 mb-1">
            Stage {currentStepIdx + 1} of {STEPS.length}: {STEPS[currentStepIdx].title}
          </span>
          <p className="text-xs text-zinc-350 leading-relaxed font-sans">
            {STEPS[currentStepIdx].desc}
          </p>
        </div>
      </div>

      {/* Progress metrics */}
      <div className="w-full max-w-sm mt-8 space-y-2 relative z-10">
        <div className="flex justify-between text-[10px] font-mono text-zinc-500">
          <span>VECTOR DRAFT MATRIX</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
    </div>
  );
}
