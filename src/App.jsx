import React, { useState } from 'react';
import {
  ExternalLink,
  Terminal,
  Cpu,
  Layers,
  BookOpen,
  Mail,
  ArrowRight,
  Sparkles,
  Code,
  GraduationCap,
  ChevronRight,
  Database,
  Globe,
  Settings,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';

// Custom Brand Icons (since brand icons were deprecated in modern Lucide packages)
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Projects Data
const PROJECTS = [
  {
    id: 1,
    title: "Automated GST Billing & Management System",
    category: "Desktop Automation & Databases",
    description: "A production-ready standalone desktop invoicing application built for a manufacturing firm. Automates tax partitioning (CGST/SGST vs IGST), dynamic customer profiles, and professional invoice generation.",
    longDescription: "Developed for a real-world local business (Jai Mata Dhi Poly Packs) to digitize their accounting cycle. Built with an optimized SQLite storage engine that handles customer records via GSTIN lookups, real-time dynamic tax calculation modules, automated amount-to-words parsing, and instant multi-sheet Excel generation for tax reporting.",
    tags: ["Python", "CustomTkinter", "SQLite", "Pandas", "ReportLab", "Excel Automation"],
    githubUrl: "https://github.com/reddyjishnureddy005-source/billing-system",
    liveUrl: "https://github.com/reddyjishnureddy005-source/billing-system", // You can update this later if you add a video demo link!
    stats: { "Database": "SQLite3", "Invoices": "A4 PDF", "Reporting": "Excel (.xlsx)" },
    accentColor: "from-emerald-500 to-teal-500" // Custom green gradient matching standard finance/accounting app colors
  },
  {
    id: 2,
    title: "HelixVM: 16-Bit Virtual Machine & Custom Compiler",
    category: "Systems & Compilers",
    description: "A custom 16-bit register-based virtual machine, assembler, and bytecode compiler built from scratch. Features a custom instruction set and modular memory control.",
    longDescription: "A simulation of a 16-bit computer architecture. It includes a custom assembler that compiles mnemonic instructions into bytecode, a register-based CPU emulator, stack operations, and manual byte-level memory allocation routines.",
    tags: ["Python", "Systems", "Compilers", "Computer Architecture", "Bytecode"],
    githubUrl: "https://github.com",
    liveUrl: "https://github.com",
    stats: { "Registers": "8 GP", "Instruction Set": "32 Ops", "Memory": "Manual Alloc" },
    accentColor: "from-indigo-500 to-cyan-500"
  },
  {
    id: 3,
    title: "OmniGraph: Interactive Pathfinding Algorithm Suite",
    category: "Data Structures & Algorithms",
    description: "A real-time network and graph traversal visualization tool displaying Dijkstra, A*, and DFS/BFS algorithms. Features procedural maze generation.",
    longDescription: "An immersive simulation designed to visualize how pathfinding and search algorithms traverse graphs. Optimized to enable smooth rendering at 60 FPS, highlighting node expansions and path-backtracking heuristics.",
    tags: ["React", "JavaScript", "Algorithms", "Graph Theory", "Data Structures"],
    githubUrl: "https://github.com",
    liveUrl: "https://github.com",
    stats: { "Algorithms": "5 Supported", "Rendering": "Canvas 2D", "FPS": "60 Locked" },
    accentColor: "from-purple-500 to-indigo-500"
  }
];

export default function App() {
  const projects = PROJECTS;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative font-sans antialiased overflow-hidden noise-overlay">

      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-accent pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none z-0" />



      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-accent-sm group-hover:scale-105 transition-transform">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-mono font-bold tracking-tight text-slate-100 group-hover:text-accent-light transition-colors">
              jishnu<span className="text-accent">.dev</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#projects" className="nav-link">Projects</a>
            <a href="#about" className="nav-link">Technical Focus</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          {/* Right Action */}
          <div>
            <a
              href="#contact"
              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold hover:border-accent/40 hover:text-accent-light transition-all duration-200"
            >
              Let's Connect
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Hero Section */}
        <section className="pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">

          {/* Animated Tech Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-xs font-mono font-medium text-slate-400">
              Computer Science & Engineering Student
            </span>
          </div>

          {/* Big Hero Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl leading-[1.1] animate-fade-in-up animate-delay-100">
            Building the logic behind <span className="gradient-text bg-gradient-to-r from-accent to-purple-400">core computing.</span>
          </h1>

          {/* Intro Description */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10 animate-fade-in-up animate-delay-200">
            Hi, I'm <strong className="text-slate-200 font-semibold">Jishnu</strong>. A first-year CS student in VIT vellore,diving deep into low-level systems, algorithms, and interactive engineering tools.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto animate-fade-in-up animate-delay-300">
            <a href="#projects" className="btn-primary w-full sm:w-auto justify-center">
              Explore Projects
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#about" className="btn-outline w-full sm:w-auto justify-center">
              Academic Interests
            </a>
          </div>

          {/* Floating Features Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mt-24 border-t border-slate-900 pt-8 text-left animate-fade-in-up animate-delay-400">
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900/50 hover:border-slate-800 transition-colors">
              <Cpu className="w-5 h-5 text-accent mb-2" />
              <h3 className="text-sm font-semibold text-slate-200">Systems Level</h3>
              <p className="text-xs text-slate-500 mt-1">Diving into VM design, assemblers, and memory structures.</p>
            </div>
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900/50 hover:border-slate-800 transition-colors">
              <Layers className="w-5 h-5 text-purple-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-200">Data Structures</h3>
              <p className="text-xs text-slate-500 mt-1">Optimizing time and space complexity with efficient graphs/trees.</p>
            </div>
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900/50 hover:border-slate-800 transition-colors">
              <Code className="w-5 h-5 text-cyan-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-200">Modern Dev</h3>
              <p className="text-xs text-slate-500 mt-1">Writing responsive modular interfaces and reliable script servers.</p>
            </div>
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900/50 hover:border-slate-800 transition-colors">
              <BookOpen className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-200">Core Academics</h3>
              <p className="text-xs text-slate-500 mt-1">Consistently studying discrete structures and CPU logic gates.</p>
            </div>
          </div>
        </section>

        {/* Projects Showcase Section */}
        <section id="projects" className="py-20 border-t border-slate-900 scroll-mt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-xs font-semibold text-accent-light mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Project Showcase
              </div>
              <h2 className="section-heading">Selected Creations</h2>
              <p className="section-subheading">
                A selection of computer engineering applications built to cement fundamental programming models.
              </p>
            </div>

            {/* Micro Layout Status Indicator */}
            <div className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Layout Architecture: <strong className="text-white">{projects.length === 1 ? 'Featured Showcase' : 'Responsive Grid'}</strong>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CONDITIONAL RENDERING ARCHITECTURE (CORE REQUIREMENT) */}
          {/* ======================================================== */}
          {projects.length === 1 ? (
            /* CASE A: SINGLE FEATURED PROJECT LAYOUT (Massive, High-Impact) */
            <div className="animate-fade-in">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="card p-1 relative overflow-hidden group featured-border-animate"
                >
                  <div className="bg-slate-950/95 rounded-[15px] p-6 sm:p-10 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">

                    {/* Project Graphical Mockup Placeholder (Full CSS & SVG Vector representation - sleeker than generic static image) */}
                    <div className="lg:col-span-6 flex flex-col justify-between bg-slate-900 rounded-xl border border-slate-800/80 p-6 relative overflow-hidden h-[300px] sm:h-[350px] lg:h-full min-h-[300px] shadow-inner group-hover:border-accent/20 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-transparent pointer-events-none" />

                      {/* Top Bar with Dev styling */}
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 relative z-10">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 tracking-wider">compiler_vm_core.py</span>
                      </div>

                      {/* Vector Console Log Graphic representing Compiler operations */}
                      <div className="font-mono text-xs text-slate-400 space-y-2 relative z-10 flex-1 py-4 overflow-hidden">
                        <div className="text-accent-light font-semibold">&gt;&gt; python assembler.py -i main.asm -o main.bin</div>
                        <div className="text-slate-500">[INFO] Mapping system labels &amp; resolving jumps...</div>
                        <div className="text-emerald-400">[SUCCESS] Binary package compiled successfully. (184 Bytes)</div>
                        <div className="text-slate-300">&gt;&gt; python helix_vm.py --run main.bin</div>
                        <div className="text-slate-500">[VM] CPU Registers cleared. IP: 0x0000, SP: 0xFFFF</div>
                        <div className="text-indigo-400">[EXEC] R1: 0x0042, R2: 0x000A, FLAG_ZERO: 0</div>
                        <div className="text-slate-500">[VM] Core execution terminated with exit code 0.</div>
                      </div>

                      {/* SVG CPU Block Vector Graphic (bottom overlay) */}
                      <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-500">
                        <Cpu className="w-40 h-40 text-accent" />
                      </div>

                      {/* Tags inside graphic */}
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/60 relative z-10">
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Project Information */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="tag">{project.category}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-accent font-semibold tracking-wider uppercase font-mono">
                          ★ Star Featured
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 group-hover:text-accent-light transition-colors">
                        {project.title}
                      </h3>

                      <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                        {project.longDescription}
                      </p>

                      {/* Micro Specs Grid */}
                      <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-850/80 mb-8">
                        {Object.entries(project.stats).map(([key, val], idx) => (
                          <div key={idx} className="text-left">
                            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">{key}</span>
                            <span className="block text-sm font-semibold text-slate-300 font-mono mt-0.5">{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-wrap gap-4">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary flex-1 sm:flex-none justify-center group/btn"
                        >
                          <GithubIcon className="w-4 h-4" />
                          Source Code
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline flex-1 sm:flex-none justify-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Live Simulation
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* CASE B: MULTI-CARD UNIFORM RESPONSIVE GRID LAYOUT */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="card card-glow flex flex-col h-full group"
                >
                  {/* Decorative Gradient Top border */}
                  <div className={`h-1 bg-gradient-to-r ${project.accentColor}`} />

                  <div className="p-6 sm:p-8 flex flex-col flex-grow">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                        {project.category}
                      </span>
                      <div className="w-7 h-7 rounded-md bg-slate-800/80 border border-slate-700/50 flex items-center justify-center group-hover:border-accent/40 transition-colors">
                        {project.id === 1 ? <Cpu className="w-3.5 h-3.5 text-indigo-400" /> :
                          project.id === 2 ? <Globe className="w-3.5 h-3.5 text-purple-400" /> :
                            <Database className="w-3.5 h-3.5 text-pink-400" />}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-accent-light transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow line-clamp-4">
                      {project.description}
                    </p>

                    {/* Stats List */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-900 mb-6 font-mono text-[10px] text-slate-400">
                      {Object.entries(project.stats).slice(0, 2).map(([key, val], idx) => (
                        <div key={idx}>
                          <span className="text-slate-600 mr-1">{key}:</span>
                          <span className="text-slate-300 font-semibold">{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-850">
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost flex-1 justify-center gap-1.5 py-2 text-xs"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        Code
                      </a>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost flex-1 justify-center gap-1.5 py-2 text-xs text-accent-light"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Demo
                      </a>
                    </div>

                  </div>
                </article>
              ))}
            </div>
          )}



        </section>

        {/* About & Technical Interests Section */}
        <section id="about" className="py-20 border-t border-slate-900 scroll-mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Column 1: Info and Text */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-3">
                <GraduationCap className="w-3.5 h-3.5" /> Academic Focus
              </div>
              <h2 className="section-heading">About Me &amp; Technical Interests</h2>
              <p className="text-slate-400 mt-6 leading-relaxed">
                I am a first-year Computer Science Engineering student obsessed with understanding the underlying hardware-software interface. Rather than treating core computers as a black box, I aim to unravel the layers between code logic and physics.
              </p>
              <p className="text-slate-400 mt-4 leading-relaxed">
                Currently, my coursework covers Discrete Mathematics and Object-Oriented Principles, while my independent studies focus heavily on systems design, language compiler parsing, and efficient algorithms.
              </p>

              {/* Core technical stack tags */}
              <div className="mt-8">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 mb-4">Core Knowledge Domains</h3>
                <div className="flex flex-wrap gap-2.5">
                  {["Discrete Mathematics", "Data Structures", "Computer Architecture", "Algorithms Design", "Compilers", "Automata Theory", "P2P Computing", "Software Engineering"].map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:border-accent/40 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Sleek Grid of Focus Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-850 hover:border-accent/30 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25 mb-4 group-hover:scale-105 transition-transform">
                  <Terminal className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Systems &amp; Assemblers</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Building software emulators, binary compilers, and microprocessors instruction mappings.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-850 hover:border-purple-500/30 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/25 mb-4 group-hover:scale-105 transition-transform">
                  <Layers className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Optimal Algorithms</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Solving algorithmic challenges focusing heavily on complexity analysis and data mapping.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-850 hover:border-pink-500/30 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/25 mb-4 group-hover:scale-105 transition-transform">
                  <Database className="w-4.5 h-4.5 text-pink-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Database Models</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Understanding B-Trees, relational tables, and distributed data structures.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-850 hover:border-cyan-500/30 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/25 mb-4 group-hover:scale-105 transition-transform">
                  <Globe className="w-4.5 h-4.5 text-cyan-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Decentralized P2P</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Exploring decentralized hash lookup systems and resilient node architecture models.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* Contact Section / Footer */}
        <section id="contact" className="py-20 border-t border-slate-900 scroll-mt-16 text-center">
          <div className="max-w-2xl mx-auto">

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 mb-3 animate-pulse">
              <Mail className="w-3.5 h-3.5" /> Reach Out
            </div>

            <h2 className="section-heading mb-6">Let's build something significant together.</h2>

            <p className="text-slate-400 mb-10 leading-relaxed text-sm sm:text-base">
              I am open to research assignments, open-source programming opportunities, and systems development partnerships. Drop me an email or find me online!
            </p>

            {/* Premium Mail Button Card */}
            <div className="inline-flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full sm:w-auto">
              <a
                href="mailto:example@gmail.com"
                className="btn-primary w-full sm:w-auto justify-center px-8 py-4 glow-border text-white text-sm"
              >
                <Mail className="w-4.5 h-4.5" />
                Email Me Directly
              </a>
            </div>

            {/* Social Links */}
            <div className="flex justify-center items-center gap-8 mb-12 border-b border-slate-900 pb-12">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-full bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:border-accent hover:shadow-accent-sm transition-all"
                aria-label="GitHub"
              >
                <GithubIcon className="w-5.5 h-5.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-full bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:border-accent hover:shadow-accent-sm transition-all"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-5.5 h-5.5" />
              </a>
            </div>

            {/* Copyright & Technical Signature */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-mono">
              <p>© {new Date().getFullYear()} Jishnu. All rights reserved.</p>
              <p className="mt-2 sm:mt-0 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-accent" /> Designed with React &amp; Tailwind CSS
              </p>
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}
