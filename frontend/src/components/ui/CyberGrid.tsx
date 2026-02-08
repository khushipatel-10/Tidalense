'use client';

export default function CyberGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none perspective-[1000px]">
            {/* Main Moving Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b2_1px,transparent_1px),linear-gradient(to_bottom,#0891b2_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 transform-gpu rotate-x-60 origin-top animate-grid-move"></div>

            {/* Secondary Fainter Grid for Depth */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:1rem_1rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 transform-gpu rotate-x-60 origin-top"></div>

            {/* Subtle Aqua Waves Overlay */}
            <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none mix-blend-screen">
                <svg className="absolute bottom-0 left-0 w-full h-[40vh]" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path fill="rgba(6, 182, 212, 0.2)" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
                        <animate attributeName="d" dur="10s" repeatCount="indefinite" values="
                            M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                            M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                            M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                        "/>
                    </path>
                </svg>
            </div>

            {/* Glowing Horizon Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-cyan-500 shadow-[0_0_20px_2px_rgba(6,182,212,0.5)]"></div>

            {/* Vignette to fade out edges */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20"></div>

            <style jsx>{`
                @keyframes grid-move {
                    0% { transform: perspective(1000px) rotateX(60deg) translateY(0); }
                    100% { transform: perspective(1000px) rotateX(60deg) translateY(4rem); }
                }
                .animate-grid-move {
                    animation: grid-move 2s linear infinite;
                }
            `}</style>
        </div>
    );
}
