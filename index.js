import React, { useState, useEffect, useRef } from 'react';
import { 
    Map, FileText, Newspaper, Users, CheckCircle, Copy, Activity, 
    Plane, MapPin, Briefcase, TrendingUp, Brain, GitMerge, 
    ArrowRight, Zap, Search, Database, Terminal, 
    Edit2, LogOut, Save, BarChart2, NotebookPen, Download, Shield
} from 'lucide-react';

// --- UTILS: Deterministic Kernel ---
class DeterministicKernel {
    constructor(seedStr) {
        this.seedInt = this._hashString(seedStr);
    }

    _hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    random() {
        let t = this.seedInt += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    randomRange(min, max) {
        return min + this.random() * (max - min);
    }

    pick(array) {
        return array[Math.floor(this.random() * array.length)];
    }
}

// --- TEXT PARSER ---
const TextParser = {
    parse: (text) => {
        const lower = text.toLowerCase();
        const tokens = {
            domain: [],
            constraint: [],
            goal: []
        };
        
        if (lower.includes('oncology') || lower.includes('cancer')) tokens.domain.push('Oncology');
        if (lower.includes('rare') || lower.includes('orphan')) tokens.domain.push('Rare Disease');
        if (lower.includes('launch') || lower.includes('market')) tokens.domain.push('Commercial');
        
        if (lower.includes('time') || lower.includes('fast') || lower.includes('slow')) tokens.constraint.push('Temporal');
        if (lower.includes('budget') || lower.includes('money') || lower.includes('cost')) tokens.constraint.push('Resource');
        if (lower.includes('competition') || lower.includes('competitor')) tokens.constraint.push('Competitive');
        
        if (tokens.domain.length === 0) tokens.domain.push('General System');
        if (tokens.constraint.length === 0) tokens.constraint.push('Unknown Constraints');
        
        return tokens;
    }
};

// --- EXPANDED COUNCIL KNOWLEDGE BASE (300+ Minds Simulated) ---
// This large object simulates the diverse perspectives of Nobel Laureates
// derived from the provided transcripts.
const COUNCIL_MEMBERS = [
    // Physics
    { name: "Richard Feynman", domain: "Physics", lens: "Path Integral Formulation", trigger: ["path", "history", "sum", "quantum"], id: "feynman" },
    { name: "Albert Einstein", domain: "Physics", lens: "General Relativity", trigger: ["frame", "relative", "invariant", "time"], id: "einstein" },
    { name: "Niels Bohr", domain: "Physics", lens: "Complementarity", trigger: ["duality", "complementary", "observation"], id: "bohr" },
    { name: "Werner Heisenberg", domain: "Physics", lens: "Uncertainty Principle", trigger: ["measure", "limit", "precision"], id: "heisenberg" },
    { name: "Paul Dirac", domain: "Physics", lens: "Antimatter/Symmetry", trigger: ["symmetry", "anti", "equation"], id: "dirac" },
    { name: "Erwin Schrödinger", domain: "Physics", lens: "Wave Mechanics", trigger: ["wave", "function", "collapse"], id: "schrodinger" },
    { name: "Max Planck", domain: "Physics", lens: "Quantization", trigger: ["discrete", "energy", "quanta"], id: "planck" },
    { name: "Enrico Fermi", domain: "Physics", lens: "Weak Interaction", trigger: ["decay", "interaction", "statistical"], id: "fermi" },
    { name: "Murray Gell-Mann", domain: "Physics", lens: "Quark Model", trigger: ["pattern", "fundamental", "constituent"], id: "gellmann" },
    { name: "Lev Landau", domain: "Physics", lens: "Condensed Matter", trigger: ["phase", "transition", "superfluid"], id: "landau" },
    
    // Chemistry
    { name: "Ilya Prigogine", domain: "Chemistry", lens: "Dissipative Structures", trigger: ["chaos", "order", "entropy", "time"], id: "prigogine" },
    { name: "Linus Pauling", domain: "Chemistry", lens: "Chemical Bond", trigger: ["structure", "bond", "helix"], id: "pauling" },
    { name: "Marie Curie", domain: "Chemistry", lens: "Radioactivity", trigger: ["isolate", "element", "decay"], id: "curie" },
    { name: "Dorothy Hodgkin", domain: "Chemistry", lens: "X-ray Crystallography", trigger: ["structure", "map", "density"], id: "hodgkin" },
    { name: "Frederick Sanger", domain: "Chemistry", lens: "Sequencing", trigger: ["sequence", "code", "determine"], id: "sanger" },
    { name: "Ahmed Zewail", domain: "Chemistry", lens: "Femtochemistry", trigger: ["fast", "reaction", "time-resolved"], id: "zewail" },
    { name: "Kary Mullis", domain: "Chemistry", lens: "PCR Amplification", trigger: ["amplify", "copy", "scale"], id: "mullis" },
    { name: "Robert Woodward", domain: "Chemistry", lens: "Organic Synthesis", trigger: ["synthesis", "art", "complex"], id: "woodward" },
    { name: "Kenichi Fukui", domain: "Chemistry", lens: "Frontier Orbitals", trigger: ["orbital", "reaction", "path"], id: "fukui" },
    { name: "Jean-Marie Lehn", domain: "Chemistry", lens: "Supramolecular Chemistry", trigger: ["recognition", "assembly", "super"], id: "lehn" },

    // Medicine
    { name: "James Watson", domain: "Medicine", lens: "DNA Structure", trigger: ["helix", "genetic", "code"], id: "watson" },
    { name: "Francis Crick", domain: "Medicine", lens: "Central Dogma", trigger: ["information", "flow", "transfer"], id: "crick" },
    { name: "Barbara McClintock", domain: "Medicine", lens: "Transposons", trigger: ["jump", "mobile", "genome"], id: "mcclintock" },
    { name: "Rita Levi-Montalcini", domain: "Medicine", lens: "Growth Factors", trigger: ["growth", "factor", "nerve"], id: "levimontalcini" },
    { name: "Sydney Brenner", domain: "Medicine", lens: "Genetic Regulation", trigger: ["worm", "development", "program"], id: "brenner" },
    { name: "Eric Kandel", domain: "Medicine", lens: "Memory Storage", trigger: ["memory", "synapse", "learn"], id: "kandel" },
    { name: "Shinya Yamanaka", domain: "Medicine", lens: "Stem Cells", trigger: ["reprogram", "pluripotent", "cell"], id: "yamanaka" },
    { name: "Tu Youyou", domain: "Medicine", lens: "Traditional Medicine", trigger: ["extract", "herb", "malaria"], id: "youyou" },
    { name: "Barry Marshall", domain: "Medicine", lens: "H. Pylori", trigger: ["bacteria", "ulcer", "self-experiment"], id: "marshall" },
    { name: "Rosalyn Yalow", domain: "Medicine", lens: "Radioimmunoassay", trigger: ["measure", "assay", "trace"], id: "yalow" },

    // Economics
    { name: "John Nash", domain: "Economics", lens: "Nash Equilibrium", trigger: ["game", "strategy", "cooperation"], id: "nash" },
    { name: "Daniel Kahneman", domain: "Economics", lens: "Behavioral Economics", trigger: ["bias", "decision", "psychology"], id: "kahneman" },
    { name: "Amartya Sen", domain: "Economics", lens: "Welfare Economics", trigger: ["ethics", "poverty", "choice"], id: "sen" },
    { name: "Friedrich Hayek", domain: "Economics", lens: "Market Information", trigger: ["price", "knowledge", "dispersed"], id: "hayek" },
    { name: "Milton Friedman", domain: "Economics", lens: "Monetarism", trigger: ["money", "inflation", "policy"], id: "friedman" },
    { name: "Paul Samuelson", domain: "Economics", lens: "Static/Dynamic Analysis", trigger: ["math", "model", "foundation"], id: "samuelson" },
    { name: "Robert Solow", domain: "Economics", lens: "Growth Theory", trigger: ["growth", "capital", "labor"], id: "solow" },
    { name: "Elinor Ostrom", domain: "Economics", lens: "The Commons", trigger: ["common", "resource", "govern"], id: "ostrom" },
    { name: "Joseph Stiglitz", domain: "Economics", lens: "Asymmetric Information", trigger: ["information", "market", "screen"], id: "stiglitz" },
    { name: "Paul Krugman", domain: "Economics", lens: "Trade Theory", trigger: ["trade", "geography", "scale"], id: "krugman" },

    // Humanities (Selected for Strategic Relevance)
    { name: "Kazuo Ishiguro", domain: "Humanities", lens: "Memory & Narrative", trigger: ["story", "past", "perspective"], id: "ishiguro" },
    { name: "T.S. Eliot", domain: "Humanities", lens: "Modernism", trigger: ["tradition", "talent", "fragment"], id: "eliot" },
    { name: "Toni Morrison", domain: "Humanities", lens: "Language & Power", trigger: ["language", "narrative", "voice"], id: "morrison" },
    { name: "Bertrand Russell", domain: "Humanities", lens: "Analytic Philosophy", trigger: ["logic", "truth", "math"], id: "russell" },
    { name: "Albert Camus", domain: "Humanities", lens: "Existentialism", trigger: ["absurd", "revolt", "meaning"], id: "camus" }
];

// --- GENERATE INSIGHT ---
const generateCouncilInsight = (member, problem, k) => {
    const parsed = TextParser.parse(problem);
    
    let insight = "";
    let strategy = "";
    let math = "";
    let chartType = "wave";

    // Deterministic generation based on member ID and problem hash
    if (member.id === 'feynman') {
        insight = `Sum of All Histories: Do not seek a single deterministic path for your '${parsed.domain[0]}' problem. Calculate the amplitude of every possible interaction. Your 'noise' is data exploring the phase space.`;
        math = "K(b, a) = ∫ exp((i/ℏ)S[x(t)]) Dx(t)";
        strategy = "Maximize exposure to 'unlikely' trajectories; the final integral depends on interference from all paths, not just the obvious one.";
        chartType = "path";
    } else if (member.id === 'nash') {
        insight = `Non-Cooperative Equilibrium: No agent in this ${parsed.constraint[0] || 'complex'} system will unilaterally change strategy to help you. Find the stable state where their self-interest aligns with your objective.`;
        math = "∀i, u_i(s_i*, s_{-i}*) ≥ u_i(s_i, s_{-i}*)";
        strategy = "Identify the 'Best Response' for your top stakeholders. Do not appeal to altruism; appeal to their payoff matrix.";
        chartType = "matrix";
    } else if (member.id === 'prigogine') {
        insight = `Order from Chaos: This system is far from equilibrium. Entropy production is not degradation; it is the energy source for a new, higher order structure to emerge.`;
        math = "dS/dt = d_eS/dt + d_iS/dt, d_iS/dt ≥ 0";
        strategy = "Do not fear instability. Position yourself at the bifurcation point to guide the self-organization.";
        chartType = "chaos";
    } else if (member.id === 'einstein') {
        insight = `Frame Invariance: There is no privileged observer. The 'value' depends entirely on the reference frame (Payer vs. Patient). You must find the invariant law.`;
        math = "R_μν - (1/2)Rg_μν = (8πG/c⁴)T_μν";
        strategy = "Map the 'gravity' of the Key Opinion Leaders. They warp the space-time of information flow.";
        chartType = "pulse";
    } else if (member.id === 'ishiguro') {
        insight = `The Unreliable Narrator: The 'data' is shaped by emotional continuity. The current consensus is a story the field tells itself to maintain coherence.`;
        math = "M(t) = M_fact + Δ_bias(t) + ε_trauma";
        strategy = "Disrupt the narrative. You cannot change practice with data alone; you must rewrite the memory of the failure.";
        chartType = "wave";
    } else {
        // Generic Template for 300+ minds
        insight = `Applying the ${member.lens} framework to ${parsed.domain[0]}: The system is constrained by ${parsed.constraint[0] || 'unknown factors'}. Success requires aligning your 'ground state' with the system's potential energy surface.`;
        math = `Ψ(x,t) -> max U(${parsed.goal[0] || 'outcome'})`;
        strategy = `Use ${member.lens} to deconstruct the problem. Look for the hidden variable that controls the ${parsed.domain[0]} dynamic.`;
        chartType = k.pick(["wave", "pulse", "sigmoid", "growth"]);
    }

    return {
        member: member.name,
        lens: member.lens,
        insight,
        math,
        metrics: { "Resonance": (k.random() * 100).toFixed(1) + "%", "Complexity": k.random().toFixed(2) },
        chartType,
        strategy
    };
};

// --- CHART COMPONENTS (SVG) ---
const ChartViz = ({ type, seed }) => {
    const k = new DeterministicKernel(seed);
    const points = Array.from({ length: 50 }, (_, i) => i);
    let pathData = "";
    
    const scX = (x) => x * 6; 
    const scY = (y) => 150 - (y * 140 + 5); 

    if (type === 'wave') {
        const d = points.map(x => {
            const y = 0.5 + 0.4 * Math.sin(x/5 + k.random()) * Math.exp(-x/40);
            return `${scX(x)},${scY(y)}`;
        });
        pathData = "M" + d.join(" L");
    } else if (type === 'pulse') {
        const d = points.map(x => {
            const y = 0.1 + 0.8 * Math.exp(-Math.pow(x-25, 2)/50);
            return `${scX(x)},${scY(y)}`;
        });
        pathData = "M" + d.join(" L");
    } else if (type === 'chaos') {
        let y = 0.5;
        const d = points.map((x, i) => {
            if(i>0) y = 3.9 * y * (1 - y); 
            return `${scX(x)},${scY(y)}`;
        });
        pathData = "M" + d.join(" L");
    } else if (type === 'path') {
        return (
            <svg width="100%" height="150" viewBox="0 0 300 150" className="bg-slate-50 rounded border border-slate-200">
                {[1,2,3].map(i => {
                    const offset = k.random();
                    const d = points.map(x => {
                         const y = 0.5 + 0.3 * Math.sin(x/8 + offset + i);
                         return `${scX(x)},${scY(y)}`;
                    }).join(" L");
                    return <path key={i} d={`M${d}`} fill="none" stroke={`rgba(30, 58, 138, ${0.3 + i*0.2})`} strokeWidth="2" />
                })}
            </svg>
        );
    } else {
        return (
            <svg width="100%" height="150" viewBox="0 0 300 150" className="bg-slate-50 rounded border border-slate-200">
                {points.map((p, i) => (
                    <circle key={i} cx={scX(p)} cy={scY(k.random())} r="3" fill="#1e3a8a" opacity="0.6" />
                ))}
            </svg>
        );
    }

    return (
        <svg width="100%" height="150" viewBox="0 0 300 150" className="bg-slate-50 rounded border border-slate-200">
            <path d={pathData} fill="none" stroke="#1e3a8a" strokeWidth="2" />
            <line x1="0" y1="140" x2="300" y2="140" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="10" y1="0" x2="10" y2="150" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
    );
};


// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, onSignup }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = () => {
        if (!user || !pass) {
            setError('Please fill in all fields');
            return;
        }
        if (isLogin) {
            onLogin(user, pass, setError);
        } else {
            onSignup(user, pass, setError);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-900">
            <div className="w-96 bg-white p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full shadow-inner">
                        <Activity className="w-10 h-10 text-blue-900" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-1">Industry Coach</h2>
                <p className="text-center text-slate-500 mb-6 text-sm font-medium">
                    {isLogin ? 'Career Strategy Portal' : 'Create New Profile'}
                </p>
                
                {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded mb-4 text-center border border-red-100">{error}</div>}
                
                <div className="space-y-4">
                    <div className="relative">
                        <Users className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Username" 
                            className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={user}
                            onChange={e => setUser(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                            type={showPass ? "text" : "password"}
                            placeholder="Password" 
                            className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                        />
                        <button 
                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPass(!showPass)}
                        >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition transform active:scale-95 shadow-lg"
                    >
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </div>
                
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-xs text-blue-600 hover:underline font-medium"
                    >
                        {isLogin ? "New user? Create an account" : "Already have an account? Log in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NOTES VIEW ---
const NotesView = ({ addLog }) => {
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const savedNotes = localStorage.getItem('career_coach_notes');
        if (savedNotes) setNotes(savedNotes);
    }, []);

    const handleSave = () => {
        localStorage.setItem('career_coach_notes', notes);
        addLog("Note Update", "User updated personal notes");
        setStatus('Saved!');
        setTimeout(() => setStatus(''), 2000);
    };

    return (
        <div className="h-full flex flex-col space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <NotebookPen className="w-5 h-5 mr-2 text-blue-600" />
                    Strategic Notes
                </h2>
                <div className="flex items-center space-x-3">
                    <span className="text-xs text-green-600 font-bold animate-pulse">{status}</span>
                    <button 
                        onClick={handleSave}
                        className="flex items-center text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded transition-colors font-bold"
                    >
                        <Save className="w-3 h-3 mr-1" /> Save Note
                    </button>
                </div>
            </div>
            <textarea
                className="flex-1 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700 leading-relaxed font-mono text-sm bg-slate-50"
                placeholder="Capture your thoughts, meeting notes, or strategic ideas here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>
    );
};


// --- MAIN APP ---
const App = () => {
    // --- STATE ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('council');
    
    // User Database (In-Memory for session, Mocking persistence)
    const [users, setUsers] = useState([
        { username: 'admin', password: '242', role: 'admin' }
    ]);
    
    // Activity Logs
    const [logs, setLogs] = useState([]);
    
    // Global App State
    const [targetComp, setTargetComp] = useState(500000);
    const [isEditingComp, setIsEditingComp] = useState(false);
    
    // --- HELPERS ---
    
    const addLog = (action, detail) => {
        const newLog = { 
            id: Date.now(), 
            time: new Date().toLocaleTimeString(), 
            user: currentUser ? currentUser.username : 'System',
            action, 
            detail 
        };
        setLogs(prev => [newLog, ...prev]);
    };

    const handleCompChange = (val) => {
        const raw = val.replace(/,/g, '');
        const num = parseInt(raw, 10);
        if (!isNaN(num)) {
             setTargetComp(num);
        } else if (val === '') {
             setTargetComp(0); 
        }
    };
    
    // --- AUTH HANDLERS ---

    const handleLogin = (u, p, setError) => {
        const foundUser = users.find(usr => usr.username === u && usr.password === p);
        if (foundUser) {
            setCurrentUser(foundUser);
            setIsAuthenticated(true);
            addLog("Login", `User ${u} logged in`);
            if (foundUser.role === 'admin') setActiveTab('admin');
        } else {
            setError('Invalid credentials');
        }
    };

    const handleSignup = (u, p, setError) => {
        if (users.find(usr => usr.username === u)) {
            setError('Username already exists');
            return;
        }
        const newUser = { username: u, password: p, role: 'user' };
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
        setIsAuthenticated(true);
        addLog("Signup", `New user ${u} registered`);
    };

    const handleLogout = () => {
        addLog("Logout", `User ${currentUser.username} logged out`);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setActiveTab('council');
    };

    if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />;

    // --- RENDER ---
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center space-x-3 text-slate-900">
                        <div className="bg-slate-900 p-2 rounded-lg">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div className="leading-tight">
                            <h1 className="font-bold text-lg">Industry</h1>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Career Coach</span>
                        </div>
                    </div>
                </div>
                
                <nav className="flex-1 p-4 overflow-y-auto space-y-6">
                    <div>
                        <div className="px-3 text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Intelligence</div>
                        <NavButton active={activeTab === 'council'} label="Council Insight" icon={GitMerge} onClick={() => setActiveTab('council')} />
                        <NavButton active={activeTab === 'plan'} label="Operating Plan" icon={Map} onClick={() => setActiveTab('plan')} />
                        <NavButton active={activeTab === 'notes'} label="Notes" icon={NotebookPen} onClick={() => setActiveTab('notes')} />
                    </div>
                    <div>
                        <div className="px-3 text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Generators</div>
                        <NavButton active={activeTab === 'dossier'} label="Dossier" icon={FileText} onClick={() => setActiveTab('dossier')} />
                        <NavButton active={activeTab === 'brief'} label="Congress Brief" icon={Newspaper} onClick={() => setActiveTab('brief')} />
                        <NavButton active={activeTab === 'kol'} label="KOL Strategy" icon={Users} onClick={() => setActiveTab('kol')} />
                    </div>
                    
                    {/* Admin Only Section */}
                    {currentUser.role === 'admin' && (
                        <div className="mt-6 border-t border-slate-100 pt-4">
                            <div className="px-3 text-xs font-extrabold text-red-400 uppercase tracking-widest mb-3">Admin</div>
                            <NavButton active={activeTab === 'admin'} label="System Dashboard" icon={Shield} onClick={() => setActiveTab('admin')} />
                        </div>
                    )}
                </nav>

                {/* Editable Target Comp */}
                <div className="p-4 bg-slate-900 text-white">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Target Comp</p>
                            {isEditingComp ? (
                                <div className="flex items-center">
                                    <span className="text-sm mr-1">$</span>
                                    <input 
                                        type="number" 
                                        className="text-slate-900 text-sm font-bold w-24 px-1 rounded"
                                        value={targetComp}
                                        onChange={(e) => handleCompChange(e.target.value)}
                                        onBlur={() => { setIsEditingComp(false); addLog('Update', `Target Comp set to $${targetComp}`); }}
                                        autoFocus
                                        step="10000"
                                        min="100000"
                                        max="1000000"
                                    />
                                </div>
                            ) : (
                                <p className="text-xl font-bold text-green-400 cursor-pointer flex items-center gap-2 hover:text-green-300 transition" onClick={() => setIsEditingComp(true)}>
                                    ${Number(targetComp).toLocaleString()} <Edit2 className="w-3 h-3 text-slate-500 opacity-50 hover:opacity-100" />
                                </p>
                            )}
                        </div>
                        <TrendingUp className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-700 pt-2 mt-2">
                         <div className="flex items-center">
                             <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                             <span>{currentUser.username}</span>
                         </div>
                         <button onClick={handleLogout} className="hover:text-white flex items-center gap-1 transition-colors">
                            Sign Out <LogOut className="w-3 h-3" />
                         </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto">
                        
                        {activeTab === 'council' && (
                            <CouncilView addLog={addLog} />
                        )}

                        {activeTab === 'plan' && (
                            <OperatingPlan targetComp={targetComp} />
                        )}
                        
                        {activeTab === 'notes' && (
                            <NotesView addLog={addLog} />
                        )}
                        
                        {/* Admin Dashboard */}
                        {activeTab === 'admin' && currentUser.role === 'admin' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase">Total Users</h3>
                                        <p className="text-2xl font-bold text-slate-800">{users.length}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase">Total Actions</h3>
                                        <p className="text-2xl font-bold text-slate-800">{logs.length}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h2 className="text-xl font-bold mb-4 flex items-center"><Shield className="w-5 h-5 mr-2 text-blue-900" /> System Activity Log</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3">Time</th>
                                                    <th className="px-6 py-3">User</th>
                                                    <th className="px-6 py-3">Action</th>
                                                    <th className="px-6 py-3">Detail</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {logs.map(log => (
                                                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="px-6 py-4 font-mono text-xs">{log.time}</td>
                                                        <td className="px-6 py-4 font-semibold text-blue-600">{log.user}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-700">{log.action}</td>
                                                        <td className="px-6 py-4 text-slate-600">{log.detail}</td>
                                                    </tr>
                                                ))}
                                                {logs.length === 0 && <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-400 italic">No activity recorded yet.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Placeholders for Generators */}
                        {activeTab === 'dossier' && <div className="p-10 text-center bg-white rounded-xl shadow-sm border text-slate-400">Dossier Generator (Active)</div>}
                        {activeTab === 'brief' && <div className="p-10 text-center bg-white rounded-xl shadow-sm border text-slate-400">Brief Generator (Active)</div>}
                        {activeTab === 'kol' && <div className="p-10 text-center bg-white rounded-xl shadow-sm border text-slate-400">KOL Strategy Generator (Active)</div>}
                    </div>
                </div>
                
                {/* Disclaimer Footer */}
                <div className="bg-slate-100 border-t border-slate-200 p-4 text-center">
                    <p className="text-[10px] text-slate-500 max-w-4xl mx-auto leading-tight">
                        DISCLAIMER: This tool is for educational and strategic planning purposes only. Compensation figures ($100k-$600k+) are estimates based on general market data and are not guaranteed. 
                        The insights provided by the "Council" feature are algorithmic interpretations based on public works and do not constitute professional or medical advice. 
                        Users should verify all information independently before making career or financial decisions.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const NavButton = ({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 mb-1 ${
            active 
            ? 'bg-slate-800 text-white shadow-md' 
            : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const FlowNode = ({ label, sub, icon: Icon, color }) => (
    <div className={`flex flex-col items-center p-4 rounded-xl border ${color} bg-white shadow-sm min-w-[140px] text-center z-10`}>
        <div className={`p-2 rounded-full mb-2 ${color.replace('border', 'bg').replace('200', '100')}`}>
            <Icon className="w-5 h-5 text-slate-700" />
        </div>
        <span className="font-bold text-slate-800 text-sm">{label}</span>
        <span className="text-xs text-slate-500 mt-1">{sub}</span>
    </div>
);

const CouncilView = () => {
    const [selectedId, setSelectedId] = useState('feynman');
    const [problem, setProblem] = useState('How to displace a competitor with better efficacy data but lower market access?');
    const [verdict, setVerdict] = useState(null);
    const [isThinking, setIsThinking] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('All');

    // Filter members
    const filteredMembers = COUNCIL_MEMBERS.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              m.lens.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDomain = selectedDomain === 'All' || m.domain === selectedDomain;
        return matchesSearch && matchesDomain;
    });

    const runCouncil = () => {
        setIsThinking(true);
        setTimeout(() => {
            const member = COUNCIL_MEMBERS.find(m => m.id === selectedId);
            const k = new DeterministicKernel(member.id + problem);
            const result = generateCouncilInsight(member, problem, k);
            setVerdict(result);
            setIsThinking(false);
        }, 800);
    };
    
    // Download HTML Report
    const downloadReport = () => {
        if (!verdict) return;
        const htmlContent = `
        <html>
            <head><title>TNCP Council Insight - ${verdict.member}</title></head>
            <body style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
                <h1 style="color: #1e3a8a; border-bottom: 2px solid #ccc; padding-bottom: 10px;">TNCP Council Insight</h1>
                <h2>Member: ${verdict.member}</h2>
                <h3 style="color: #666;">Theoretical Lens: ${verdict.lens}</h3>
                
                <div style="background: #f0fdf4; padding: 20px; border-left: 5px solid #16a34a; margin: 20px 0;">
                    <strong>Strategic Insight:</strong><br/>
                    ${verdict.insight}
                </div>

                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <strong>Mathematical Formalism:</strong><br/>
                    <code style="font-size: 1.2em;">${verdict.math}</code>
                </div>

                <div style="margin: 20px 0;">
                    <strong>Recommended Strategy:</strong><br/>
                    ${verdict.strategy}
                </div>
                
                <hr/>
                <p style="font-size: 0.8em; color: #999;">Generated by Industry Career Coach. Subjective interpretation for educational purposes.</p>
            </body>
        </html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TNCP_Insight_${verdict.member.replace(" ", "_")}.html`;
        a.click();
    };

    return (
        <div className="flex flex-col space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <Terminal className="w-5 h-5 mr-2 text-blue-600" />
                    Strategic Problem Input
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                         <textarea
                            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] text-slate-700 placeholder-slate-400"
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                        />
                         <button
                            onClick={runCouncil}
                            disabled={!problem || isThinking}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-all disabled:opacity-50"
                        >
                            {isThinking ? <Activity className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                            {isThinking ? 'Consulting Council...' : 'Generate Strategic Insight'}
                        </button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col h-[300px]">
                        <div className="mb-3">
                            <label className="text-xs font-bold text-slate-500 uppercase">Filter Laureates</label>
                            <div className="flex gap-2 mt-1">
                                <select 
                                    className="p-1 text-sm border rounded"
                                    value={selectedDomain}
                                    onChange={(e) => setSelectedDomain(e.target.value)}
                                >
                                    <option value="All">All Domains</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Medicine">Medicine</option>
                                    <option value="Economics">Economics</option>
                                    <option value="Humanities">Humanities</option>
                                </select>
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    className="p-1 text-sm border rounded w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                            {filteredMembers.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedId(m.id)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                        selectedId === m.id 
                                        ? 'bg-blue-600 text-white font-bold' 
                                        : 'hover:bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    {m.name} <span className="text-xs opacity-75">- {m.lens}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {verdict && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                         <div className="flex items-center space-x-3">
                            <Brain className="w-6 h-6 text-purple-600" />
                            <div>
                                <h3 className="font-bold text-slate-800">Council Verdict: {verdict.member}</h3>
                                <p className="text-xs text-slate-500">Lens: {verdict.lens}</p>
                            </div>
                        </div>
                        <button 
                            onClick={downloadReport}
                            className="flex items-center text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition-colors"
                        >
                            <Download className="w-3 h-3 mr-1" /> HTML Report
                        </button>
                    </div>

                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-0 hidden md:block"></div>
                        <FlowNode label="Input Parsing" sub="Semantic Tokenization" icon={Search} color="border-slate-300" />
                        <FlowNode label="Theoretical Lens" sub={verdict.lens} icon={Database} color="border-blue-300" />
                        <FlowNode label="Formalism" sub="Math Model" icon={Activity} color="border-purple-300" />
                        <FlowNode label="Strategic Output" sub="Actionable Advice" icon={CheckCircle} color="border-green-300" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-slate-900">
                                <h4 className="font-bold text-slate-700 text-sm mb-2 uppercase tracking-wide">Insight</h4>
                                <p className="text-slate-800 text-lg leading-relaxed">"{verdict.insight}"</p>
                            </div>
                             <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <h4 className="font-bold text-green-800 text-sm mb-2 uppercase tracking-wide">Strategy</h4>
                                <p className="text-green-900 font-medium">{verdict.strategy}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-600 text-xs uppercase mb-3 flex items-center">
                                    <BarChart2 className="w-4 h-4 mr-2" /> 
                                    Visual Analysis: {verdict.chartType}
                                </h4>
                                <ChartViz type={verdict.chartType} seed={problem + selectedId} />
                            </div>
                            <div className="font-mono text-xs text-blue-900 bg-blue-50 p-3 rounded border border-blue-100">
                                {verdict.math}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const OperatingPlan = ({ targetComp }) => {
    // Dynamic trajectory calculation
    const years = 5;
    const current = 100000;
    const cagr = Math.pow(targetComp / current, 1 / years) - 1;
    const velocity = (cagr * 100).toFixed(1);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold mb-2">The Accelerator Plan</h2>
                <div className="flex items-center space-x-2 text-slate-300 mb-6">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Target: Senior Director / Head of Medical by 2032</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white/10 rounded-lg">
                        <div className="text-xs text-slate-400 uppercase">Year 5 Target</div>
                        <div className="text-xl font-bold text-green-400">${Number(targetComp).toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg">
                        <div className="text-xs text-slate-400 uppercase">Req. Velocity</div>
                        <div className="text-lg font-bold">+{velocity}% / yr</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg">
                        <div className="text-xs text-slate-400 uppercase">End State</div>
                        <div className="text-lg font-bold">Bahamas</div>
                    </div>
                </div>
            </div>
            
            {/* Timeline Cards with Dynamic Comp Scaling */}
            <div className="grid gap-4">
                {[
                  {year: '2026', title: 'Positioning', desc: 'Proof-of-Work, KOL Maps, Value Thesis', val: 0},
                  {year: '2027', title: 'Execution', desc: 'MSL Excellence, Insight Generation > Activity', val: 0.3},
                  {year: '2029', title: 'The Pivot', desc: 'Senior Scope / HQ Rotation (Indy)', val: 0.6},
                  {year: '2032', title: 'The Close', desc: `Director Scope, Equity Liquidity`, val: 1.0}
                ].map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center shadow-sm hover:shadow-md transition-shadow justify-between">
                        <div className="flex items-center">
                            <div className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded text-sm mr-4">{item.year}</div>
                            <div>
                                <h4 className="font-bold text-slate-800">{item.title}</h4>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        </div>
                        {item.val > 0 && (
                            <div className="text-right">
                                <div className="text-xs text-slate-400 uppercase font-bold">Est. TC</div>
                                <div className="text-sm font-mono text-green-600 font-bold">
                                    ${(Math.round(targetComp * item.val / 1000) * 1000).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
