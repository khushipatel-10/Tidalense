import Link from "next/link";
import { ArrowRight, Waves, Microscope, Map, ShieldAlert } from "lucide-react";
import CyberGrid from "@/components/ui/CyberGrid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col selection:bg-cyan-500/30">
      {/* Hero Section */}
      <section className="relative w-full py-24 lg:py-32 xl:py-48 text-white overflow-hidden">
        {/* Background Grid */}
        <CyberGrid />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-300 border border-cyan-500/20 w-fit backdrop-blur-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                SYSTEM ONLINE // WATER QUALITY CORE
              </div>
              <h1 className="text-5xl font-black tracking-tighter sm:text-7xl xl:text-9xl/none bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400 pb-4 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Tidalense
              </h1>
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl text-cyan-200 mb-4">
                Global Tides. Personal Lens.
              </h2>
              <p className="max-w-[600px] text-cyan-100/80 md:text-xl font-medium leading-relaxed">
                Navigate global waters with satellite precision, then turn the lens inward to ensure your personal hydration is safe.
              </p>
              <div className="flex flex-col gap-3 min-[400px]:flex-row pt-6">
                <Link
                  href="/map"
                  className="inline-flex h-12 items-center justify-center rounded-none border border-cyan-400 bg-cyan-500/10 px-8 text-sm font-bold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 uppercase tracking-wider relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    Open Global Map
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
                <Link
                  href="/scan"
                  className="inline-flex h-12 items-center justify-center rounded-none border border-white/20 bg-black/50 px-8 text-sm font-bold text-white shadow-sm transition-all hover:bg-white/10 hover:border-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white uppercase tracking-wider backdrop-blur-sm"
                >
                  Launch Scanner
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:mr-0 rounded-none overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(8,145,178,0.2)] bg-black/40 backdrop-blur-sm relative group">
              {/* Decoration corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

              {/* Visual Enhancement - Grid Overlay */}
              <div className="w-full aspect-video bg-gradient-to-br from-slate-950/80 via-cyan-950/20 to-slate-950/80 flex items-center justify-center relative p-8">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                {/* Floating Card */}
                <div className="text-center p-8 bg-black/60 backdrop-blur-xl border border-cyan-500/30 relative z-10 shadow-2xl">
                  <div className="absolute -top-1 -right-1 w-20 h-20 bg-cyan-500/20 blur-3xl rounded-full"></div>
                  <p className="font-mono text-xs font-bold text-cyan-400 mb-2 tracking-widest uppercase">Region Analysis</p>
                  <div className="text-6xl font-black text-white mb-2 tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200">🤔<span className="text-3xl text-cyan-500/50">/100</span></div>
                  <div className="flex items-center justify-center gap-2 text-xs text-cyan-200 font-mono">
                    <span className="w-2 h-2 bg-red-500 animate-[pulse_0.5s_infinite]"></span>
                    CONTAMINATION_DETECTED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="w-full py-20 md:py-32 bg-slate-950 relative border-t border-cyan-900/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <h2 className="text-3xl font-black tracking-tighter sm:text-5xl uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Sense the Sea. Scan the Source.
            </h2>
            <p className="max-w-[700px] text-cyan-100/60 md:text-lg/relaxed leading-relaxed font-mono">
              From tracking vast ocean currents to verifying your water bottle, Tidalense provides clarity at every scale.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            <div className="group p-6 bg-cyan-950/10 border border-cyan-500/10 hover:border-cyan-400/50 hover:bg-cyan-900/10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform border border-cyan-500/20">
                <Map className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase">Global Water Map</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Crowdsourced data on hazardous water bodies. Helping communities stay safe from pollution.
              </p>
            </div>

            <div className="group p-6 bg-cyan-950/10 border border-cyan-500/10 hover:border-cyan-400/50 hover:bg-cyan-900/10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform border border-cyan-500/20">
                <Microscope className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase">Multi-Factor Analysis</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Evaluating turbidity, color, and surface debris to detect algae, sediment, and chemical runoff.
              </p>
            </div>

            <div className="group p-6 bg-cyan-950/10 border border-cyan-500/10 hover:border-cyan-400/50 hover:bg-cyan-900/10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform border border-cyan-500/20">
                <Waves className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase">Potability Check</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scan water bottles and containers for hygiene issues, seal integrity, and signs of material degradation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ethics/Disclaimer Section */}
      <section className="w-full py-20 bg-black border-t border-cyan-900/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="bg-slate-900/50 border border-dashed border-slate-700 p-8 md:p-12 relative overflow-hidden">

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="bg-slate-800 p-4 border border-slate-700">
                <ShieldAlert className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white font-mono uppercase">System Limitations</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  This is a <strong>screening tool</strong> built for a hackathon. We're detecting *risk*, not counting particles.
                </p>
                <div className="pt-2 font-mono text-xs text-yellow-500/80 bg-yellow-950/10 p-4 border-l-2 border-yellow-500 inline-block">
                  &gt; WARNING: Does not replace lab testing. Indicates probability only.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-800 bg-black text-slate-500 text-xs font-mono">
        <p>
          [SYSTEM] © 2026 Tidalense. TIDALHACK:26 BUILD.
        </p>
        <nav className="sm:ml-auto flex gap-6">
          <Link className="hover:text-cyan-400 transition-colors uppercase" href="#">
            Source Code
          </Link>
          <Link className="hover:text-cyan-400 transition-colors uppercase" href="#">
            Privacy
          </Link>
          <Link className="hover:text-cyan-400 transition-colors uppercase" href="#">
            Terms
          </Link>
        </nav>
      </footer>
    </main>
  );
}
