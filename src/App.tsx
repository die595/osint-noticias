/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Map as MapIcon, 
  Newspaper, 
  Filter, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Globe, 
  Send, 
  Facebook,
  Database,
  Search,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Info,
  Brain,
  Zap,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReChartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { News, Typology, TYPOLOGY_LABELS, TYPOLOGY_COLORS } from './types';
import { MUNICIPALITIES } from './data/municipalities';
import { KEYWORDS_MAP } from './constants';

const SOURCES_INTEL = [
  { name: "La Razon", url: "https://larazon.co/category/cordoba/", dep: "CORDOBA" },
  { name: "Rionoticias", url: "https://rionoticias.co/category/monteria/", dep: "CORDOBA" },
  { name: "El Meridiano", url: "https://elmeridiano.co/cordoba/municipio", dep: "CORDOBA" },
  { name: "Chica noticias", url: "https://www.chicanoticias.com/seccion/cordoba/", dep: "CORDOBA" },
  { name: "GS noticias", url: "https://gsnoticias.com/category/monteria/", dep: "CORDOBA" },
  { name: "El Colombiano", url: "https://www.elcolombiano.com/antioquia", dep: "ANTIOQUIA" },
  { name: "Alerta", url: "https://www.alerta.com.co/temas/caucasia-antioquia", dep: "ANTIOQUIA" },
  { name: "Minuto30", url: "https://www.minuto30.com/area-metropolitana/", dep: "ANTIOQUIA" },
  { name: "Caracol radio", url: "https://caracol.com.co/emissora/medellin/", dep: "ANTIOQUIA" },
  { name: "Organis Noticias", url: "https://www.facebook.com/organisnoticiasss", dep: "GENERAL" },
  { name: "Felix TV", url: "https://www.facebook.com/felixtv15", dep: "GENERAL" },
  { name: "Mi Region 360", url: "https://www.facebook.com/MiRegion360", dep: "GENERAL" },
  { name: "Panorama del San Jorge", url: "https://www.facebook.com/panoramadelsanjorge", dep: "CORDOBA" },
  { name: "Cauca Noticias", url: "https://www.facebook.com/CaucaNoticias.co", dep: "NACIONAL" },
  { name: "La Otra Verdad", url: "https://www.facebook.com/LaOtraVerdadCol", dep: "NACIONAL" },
  { name: "Monteria en Linea", url: "https://www.facebook.com/monteriaenlinea", dep: "CORDOBA" },
  { name: "Bajo Cauca en Linea", url: "https://www.facebook.com/Npnoticiasbajocauca/", dep: "CORDOBA" },
  { name: "Puerto Libertador X", url: "https://x.com/ultimahoracol_?s=20", dep: "CORDOBA" },
  { name: "Puerto Libertador en Linea", url: "https://www.facebook.com/p/puerto-libertador-en-linea-61555934436441/", dep: "CORDOBA" }
];

// Mock news generator for initial display
const generateMockNews = (): News[] => {
  const result: News[] = [];
  const now = new Date();
  
  for (let i = 0; i < 60; i++) {
    const muni = MUNICIPALITIES[Math.floor(Math.random() * MUNICIPALITIES.length)];
    const typologies = Object.keys(TYPOLOGY_LABELS) as Typology[];
    const typology = typologies[Math.floor(Math.random() * typologies.length)];
    const source = SOURCES_INTEL[Math.floor(Math.random() * SOURCES_INTEL.length)];
    
    result.push({
      id: `news-${i}`,
      title: `${TYPOLOGY_LABELS[typology].toUpperCase()}: ${muni.name}`,
      content: `Reporte de ${source.name} sobre situación de ${TYPOLOGY_LABELS[typology]} en zona urbana de ${muni.name}. Personal en terreno confirma hallazgos relevantes para la seguridad regional.`,
      url: source.url,
      source: source.url.includes('facebook') ? 'facebook' : 'telegram',
      sourceName: source.name,
      department: muni.department,
      municipalityId: muni.id,
      typology: typology,
      timestamp: subDays(now, Math.floor(Math.random() * 7)).toISOString(),
      keywords: KEYWORDS_MAP[typology].slice(0, 3)
    });
  }
  
  // Diversified International news
  const intTopics = [
    { title: 'Ataque terrorista en zona minera internacional', content: 'Bombardeo reportado en instalaciones de extracción de oro por grupos insurgentes.', typology: 'orden_publico' as Typology, tags: ['terrorismo', 'bombardeo', 'minería'] },
    { title: 'Secuestro masivo en complejo hidroeléctrico', content: 'Reportes indican una incursión armada en la frontera con toma de rehenes.', typology: 'orden_publico' as Typology, tags: ['secuestro', 'armados'] },
    { title: 'Crisis de refugiados por enfrentamientos', content: 'Miles de personas desplazadas tras bombardeos en centros urbanos.', typology: 'emergencias' as Typology, tags: ['desplazamiento', 'crisis'] },
    { title: 'Minería ilegal a gran escala detectada por satélite', content: 'Operaciones clandestinas destruyen miles de hectáreas de selva tropical.', typology: 'medio_ambiente' as Typology, tags: ['minería', 'deforestación'] }
  ];

  for (let i = 0; i < 10; i++) {
    const topic = intTopics[i % intTopics.length];
    result.push({
      id: `int-${i}`,
      title: topic.title,
      content: topic.content,
      url: 'https://google.com/search?q=noticias+internacionales',
      source: 'international',
      sourceName: 'Global Intelligence Scraper',
      department: 'Internacional',
      typology: topic.typology,
      timestamp: subDays(now, Math.floor(Math.random() * 3)).toISOString(),
      keywords: topic.tags
    });
  }
  
  return result;
};

export default function App() {
  const [news, setNews] = useState<News[]>([]);
  const [selectedDept, setSelectedDept] = useState<'Antioquia' | 'Córdoba' | 'todos'>('todos');
  const [selectedMuni, setSelectedMuni] = useState<string>('todos');
  const [selectedTypology, setSelectedTypology] = useState<Typology | 'todas'>('todas');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isTelegramView, setIsTelegramView] = useState(false);
  const [isInternationalView, setIsInternationalView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrapers, setScrapers] = useState<{ telegram: any[], facebook: any[] }>({ telegram: [], facebook: [] });
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Initial load
    setNews(generateMockNews());
    
    // Fetch scrapers status
    fetch('/api/scrapers')
      .then(res => res.json())
      .then(data => setScrapers(data))
      .catch(err => console.error("Failed to fetch scrapers:", err));
  }, []);

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      if (isInternationalView) return item.department === 'Internacional';
      if (item.department === 'Internacional') return false;
      
      const deptMatch = selectedDept === 'todos' || item.department === selectedDept;
      const muniMatch = selectedMuni === 'todos' || item.municipalityId === selectedMuni;
      const typoMatch = selectedTypology === 'todas' || item.typology === selectedTypology;
      const searchMatch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const newsDate = format(parseISO(item.timestamp), 'yyyy-MM-dd');
      const dateMatch = newsDate === selectedDate;

      return deptMatch && muniMatch && typoMatch && searchMatch && dateMatch;
    });
  }, [news, selectedDept, selectedMuni, selectedTypology, selectedDate, searchQuery, isInternationalView]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredNews.forEach(n => {
      counts[n.typology] = (counts[n.typology] || 0) + 1;
    });
    return Object.entries(TYPOLOGY_LABELS).map(([key, label]) => ({
      name: label,
      count: counts[key] || 0,
      color: TYPOLOGY_COLORS[key as Typology]
    }));
  }, [filteredNews]);

  const muniStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredNews.forEach(n => {
      if (n.municipalityId) {
        counts[n.municipalityId] = (counts[n.municipalityId] || 0) + 1;
      }
    });
    return counts;
  }, [filteredNews]);

  const timelineData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayNews = news.filter(n => format(parseISO(n.timestamp), 'yyyy-MM-dd') === dayStr);
      const counts: any = { date: format(day, 'dd MMM', { locale: es }) };
      Object.keys(TYPOLOGY_LABELS).forEach(t => {
        counts[t] = dayNews.filter(n => n.typology === t).length;
      });
      return counts;
    });
  }, [news]);

  const handleScanIA = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const topTypologies = stats.slice(0, 3).filter(s => s.count > 0).map(s => s.name);
      const res = await fetch('/api/strategic-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: selectedDept,
          municipality: selectedMuni === 'todos' ? 'todos' : MUNICIPALITIES.find(m => m.id === selectedMuni)?.name,
          newsCount: filteredNews.length,
          topTypologies: topTypologies.length > 0 ? topTypologies : ['Información general']
        })
      });
      const data = await res.json();
      if (data.analysis) setAiAnalysis(data.analysis);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b] text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-[#111113] z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
            Noticia<span className="text-red-600">Hub</span> 
            <span className="text-xs font-normal not-italic tracking-widest text-zinc-500 ml-4 hidden md:inline">ANTIOQUIA / CÓRDOBA</span>
          </h1>
          
          <div className="flex gap-2 ml-8">
            <button 
              onClick={() => { setIsTelegramView(false); setIsInternationalView(false); }}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all ${!isInternationalView && !isTelegramView ? 'bg-zinc-800 border-b-2 border-red-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              Monitor Local
            </button>
            <button 
              onClick={() => { setIsTelegramView(false); setIsInternationalView(true); }}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all ${isInternationalView ? 'bg-zinc-800 border-b-2 border-red-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              Internacional (Crisis)
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Scraper Status</span>
            <div className="flex gap-2">
              <span className="text-[10px] text-green-500 flex items-center gap-1">● Telegram Active</span>
              <span className="text-[10px] text-blue-400 flex items-center gap-1">● Meta Feed Monitor</span>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input 
              type="text" 
              placeholder="BUSCAR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-8 py-1.5 text-xs focus:outline-none focus:border-red-600 w-48 uppercase font-mono"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-zinc-800 bg-[#0c0c0e] flex flex-col overflow-y-auto">
          <div className="p-4 flex-1">
            <label className="sidebar-label mb-4 block">Tipologías de Análisis</label>
            <div className="space-y-1.5 mb-8">
              <button
                onClick={() => setSelectedTypology('todas')}
                className={`w-full flex items-center justify-between p-2 rounded-r border-l-4 transition-all ${selectedTypology === 'todas' ? 'bg-zinc-800 border-red-600' : 'bg-zinc-800/20 border-zinc-600 hover:bg-zinc-800/40'}`}
              >
                <span className="text-xs font-bold uppercase">TODAS LAS CATEGORÍAS</span>
              </button>
              
              {Object.entries(TYPOLOGY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTypology(key as Typology)}
                  className={`w-full flex items-center justify-between p-2 rounded-r border-l-4 transition-all ${selectedTypology === key ? 'bg-red-900/20 border-red-600' : 'bg-zinc-800/40 border-zinc-700 hover:bg-zinc-800/60'}`}
                >
                  <span className={`text-xs font-bold uppercase ${selectedTypology === key ? 'text-white' : 'text-zinc-400'}`}>
                    {label}
                  </span>
                  <span className="text-[10px] font-mono opacity-40">
                    {news.filter(n => n.typology === key).length}
                  </span>
                </button>
              ))}
            </div>

            <label className="sidebar-label mb-4 block">Filtro Geográfico</label>
            <div className="space-y-4">
              <select 
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value as any); setSelectedMuni('todos'); }}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs p-2 rounded text-white font-bold uppercase"
              >
                <option value="todos">AMBOS DEPARTAMENTOS</option>
                <option value="Antioquia">ANTIOQUIA</option>
                <option value="Córdoba">CÓRDOBA</option>
              </select>

              <select 
                value={selectedMuni}
                onChange={(e) => setSelectedMuni(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs p-2 rounded text-white font-mono"
              >
                <option value="todos">MUNICIPIDIO: TODOS</option>
                {MUNICIPALITIES
                  .filter(m => selectedDept === 'todos' || m.department === selectedDept)
                  .map(m => (
                    <option key={m.id} value={m.id} className="text-black">
                      {m.name.toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800 mt-auto">
            <label className="sidebar-label mb-3 block">Rango Temporal</label>
            <div className="bg-zinc-900 p-2 rounded border border-zinc-800 flex items-center justify-between mb-4">
               <CalendarIcon size={14} className="text-zinc-500" />
               <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-mono focus:outline-none"
               />
            </div>

            <button 
              onClick={handleScanIA}
              disabled={isAnalyzing}
              className="w-full bg-[#ff4400] hover:bg-[#ff5511] p-3 rounded text-[11px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all mb-2 disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />} 
              ESCANER IA ESTRATÉGICO
            </button>
            
            <button 
              onClick={() => setIsTelegramView(!isTelegramView)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 p-2 rounded text-[10px] font-black uppercase tracking-widest text-[#229ED9] flex items-center justify-center gap-2 transition-all"
            >
              <Send size={12} /> Telegram Pipeline
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#080808]">
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isTelegramView ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8"
                >
                  <div className="bg-[#111113] border border-zinc-800 p-8 rounded shadow-2xl">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 italic flex items-center gap-4">
                      <Send className="text-[#229ED9]" /> SCARPER <span className="text-[#229ED9]">PIPELINE</span>
                    </h2>
                    
                    <div className="space-y-12">
                      <div>
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 px-1 border-l-2 border-[#229ED9]">Telegram Nodes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {scrapers.telegram.map(c => (
                            <ChannelCard key={c.link} name={c.name} link={c.link} status={c.status} type="telegram" />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 px-1 border-l-2 border-[#1877F2]">Meta Nodes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {scrapers.facebook.map(c => (
                            <ChannelCard key={c.link} name={c.name} link={c.link} status={c.status} type="facebook" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                          <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-2">AUTH_CONFIG</h4>
                          <pre className="bg-black/50 p-3 rounded text-[10px] font-mono text-zinc-400">
                            TELEGRAM_ID: 2904138{"\n"}
                            HASH_KEY: d180...b823{"\n"}
                            STATUS: ACTIVE_LISTENING
                          </pre>
                       </div>
                       <div className="flex flex-col justify-end gap-3">
                          <button className="bg-red-600 text-black px-6 py-2 rounded font-black uppercase text-xs tracking-widest hover:bg-red-500 transition-all">DESTRUCTIVE_RESET</button>
                          <button 
                            onClick={() => setIsTelegramView(false)}
                            className="bg-zinc-800 text-white px-6 py-2 rounded font-black uppercase text-xs tracking-widest hover:bg-zinc-700 transition-all"
                          >
                            EXIT_PIPELINE
                          </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col">
                  {/* Top Map & Charts Row */}
                  <div className="grid grid-cols-12 border-b border-zinc-800 h-[400px]">
                    <div className="col-span-8 relative group">
                      <div className="absolute top-4 left-6 z-10 select-none">
                        <h2 className="text-7xl font-black text-white/5 uppercase leading-none italic">Operativo</h2>
                      </div>
                      <MapInstance muniStats={muniStats} selectedDept={selectedDept} />
                      
                      <div className="absolute bottom-6 left-6 z-10 bg-black/80 backdrop-blur-sm p-4 border border-zinc-800 rounded">
                        <div className="text-[10px] uppercase font-black text-zinc-500 mb-2 tracking-widest italic">Intensidad de Eventos</div>
                        <div className="w-48 h-2 bg-gradient-to-r from-zinc-800 to-red-600 rounded-full"></div>
                        <div className="flex justify-between text-[8px] font-mono mt-1 text-zinc-600">
                          <span>BAJO</span><span>CRÍTICO</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-4 border-l border-zinc-800 p-6 flex flex-col bg-[#0c0c0e]">
                       <h3 className="sidebar-label mb-8">Volumen por Tipología</h3>
                       <div className="flex-1">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={stats} layout="vertical" margin={{ left: 0, right: 20 }}>
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9, fill: '#52525b', fontWeight: 900 }} />
                             <ReChartsTooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                                contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #27272a', fontSize: '10px' }}
                             />
                             <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                               {stats.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                             </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                       </div>
                       
                       <div className="mt-6 pt-6 border-t border-zinc-800">
                          <div className="bg-red-600/10 border-l-2 border-red-600 p-3">
                             <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 italic">ALERTA_PRIORIDAD_CRÍTICA</div>
                             <div className="text-xs font-bold leading-tight">Actividad de grupos armados detectada en nudo de paramillo.</div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Timeline Row */}
                  <div className="bg-[#0f0f11] border-b border-zinc-800 py-3 px-6 flex items-center">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mr-8 italic">Tendencia 7D</span>
                    <div className="flex-1 h-8">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={timelineData}>
                            <Bar dataKey="orden_publico" stackId="a" fill="#8b0000" />
                            <Bar dataKey="sistema_judicial" stackId="a" fill="#ff0000" />
                            <Bar dataKey="emergencias" stackId="a" fill="#ff8c00" />
                            <Bar key="all_other" dataKey="general" stackId="a" fill="#3f3f46" />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  {/* News Stream Feed */}
                  <div className="p-0 grid grid-cols-1 md:grid-cols-2">
                    {filteredNews.map((item, idx) => (
                      <NewsCard key={item.id} item={item} index={idx} />
                    ))}
                    {filteredNews.length === 0 && (
                      <div className="col-span-full py-32 text-center">
                        <Database size={64} className="mx-auto mb-6 text-zinc-900" />
                        <h3 className="text-xl font-black text-zinc-800 uppercase italic">Sin Resultados en Memoria</h3>
                        <p className="text-xs text-zinc-600 mt-2 font-mono">CODE: E_EMPTY_FEED_BUFFER</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Red Status Footer */}
      <footer className="bg-red-600 text-black px-6 py-2 flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center gap-6 overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Feed Activo:</span>
          <div className="flex items-center gap-4 animate-pulse">
             <span className="text-[10px] font-bold italic underline">LA CHIVA DE URABA</span>
             <span className="text-[10px] font-bold italic underline">MI REGION 360</span>
             <span className="text-[10px] font-bold italic underline">ORGANIS NOTICIAS</span>
             <span className="text-[10px] font-bold italic underline">PANORAMA SAN JORGE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-black"></div>
            EN LINEA: SCANNER_60S
          </div>
          <span className="hidden sm:inline opacity-60">| v2.4.0-STABLE</span>
        </div>
      </footer>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0c0c0e] border border-zinc-800 w-full max-w-4xl h-[80vh] flex flex-col rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-red-600 text-black">
                <div className="flex items-center gap-3">
                  <Zap size={24} className="fill-current" />
                  <h2 className="text-xl font-black uppercase italic tracking-tighter">Reporte Estratégico de Inteligencia IA</h2>
                </div>
                <button 
                  onClick={() => setAiAnalysis(null)}
                  className="p-2 hover:bg-black/10 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 prose prose-invert prose-red max-w-none prose-sm">
                <div className="bg-red-600/10 border-l-4 border-red-600 p-4 mb-6 italic text-red-500">
                  Este análisis ha sido generado mediante algoritmos de inteligencia artificial procesando {filteredNews.length} vectores de información detectados en ${selectedDept}.
                </div>
                <Markdown>{aiAnalysis}</Markdown>
              </div>

              <div className="p-6 border-t border-zinc-800 bg-[#111113] flex justify-between items-center text-[10px] font-mono text-zinc-500">
                <span>ID_OPERACIÓN: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                <span className="uppercase">Clasificación: RESERVADO / USO ESTRATÉGICO</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChannelCard({ name, link, status, type }: { name: string, link: string, status: 'online' | 'offline', type: 'telegram' | 'facebook' }) {
  const isTelegram = type === 'telegram';
  const colorClass = isTelegram ? 'text-[#229ED9]' : 'text-[#1877F2]';
  const bgClass = isTelegram ? 'bg-[#229ED9]/10' : 'bg-[#1877F2]/10';
  const bgHoverClass = isTelegram ? 'group-hover:bg-[#229ED9]/20' : 'group-hover:bg-[#1877F2]/20';
  const borderHoverClass = isTelegram ? 'hover:border-[#229ED9]/50' : 'hover:border-[#1877F2]/50';

  return (
    <div className={`bg-white/5 border border-white/10 p-5 rounded-xl ${borderHoverClass} transition-all group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 ${bgClass} rounded-lg ${bgHoverClass} transition-all`}>
          {isTelegram ? <Send size={20} className={colorClass} /> : <Facebook size={20} className={colorClass} />}
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          {status.toUpperCase()}
        </div>
      </div>
      <h4 className="font-bold mb-1">{name}</h4>
      <p className="text-xs text-white/40 mb-4 line-clamp-1">{link}</p>
      <a href={isTelegram ? `https://${link}` : link} target="_blank" rel="noopener noreferrer" className={`${colorClass} text-xs font-medium flex items-center gap-1 hover:underline`}>
        Ver {isTelegram ? 'canal' : 'página'} <ChevronRight size={14} />
      </a>
    </div>
  );
}

function NewsCard({ item, index }: { item: News, index: number }) {
  const isAntioquia = item.department === 'Antioquia';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => window.open(item.url, '_blank')}
      className="border-r border-b border-zinc-800 p-4 hover:bg-zinc-900/50 cursor-pointer group transition-colors relative"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[9px] font-black px-1.5 py-0.5 uppercase ${item.department === 'Internacional' ? 'bg-zinc-700' : isAntioquia ? 'bg-red-600' : 'bg-red-800'}`}>
          {item.department.toUpperCase()} - {item.municipalityId ? MUNICIPALITIES.find(m => m.id === item.municipalityId)?.name.toUpperCase() : 'INT'}
        </span>
        <span className="text-[9px] text-zinc-500 font-mono uppercase">
          {item.source.toUpperCase()} • {format(parseISO(item.timestamp), 'HH:mm', { locale: es })}
        </span>
      </div>
      
      <h4 className="text-sm font-bold leading-tight group-hover:text-red-500 transition-colors uppercase tracking-tight">
        {item.title}
      </h4>
      
      <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
        {item.content}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          {item.keywords.slice(0, 2).map(k => (
            <span key={k} className="text-[9px] text-zinc-600 uppercase font-bold tracking-tighter">#{k}</span>
          ))}
        </div>
        <div className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={14} />
        </div>
      </div>
    </motion.div>
  );
}

function MapInstance({ muniStats, selectedDept }: { muniStats: Record<string, number>, selectedDept: string }) {
  useEffect(() => {
    const container = document.getElementById('map-container');
    if (!container) return;

    // Remove existing map if any (important for re-renders)
    const existingMap = (container as any)._leaflet_map;
    if (existingMap) existingMap.remove();

    const map = L.map(container, {
      center: [7.5, -75.5],
      zoom: 7,
      zoomControl: false,
      attributionControl: false
    });
    
    (container as any)._leaflet_map = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    MUNICIPALITIES.forEach(m => {
      const count = muniStats[m.id] || 0;
      if (count === 0 && selectedDept !== 'todos' && m.department !== selectedDept) return;

      const markerColor = count > 0 ? '#ff4400' : '#444';
      const marker = L.circleMarker([m.lat, m.lng], {
        radius: count > 0 ? 5 + Math.min(count * 2, 15) : 3,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: count > 0 ? 0.6 : 0.3,
        weight: count > 0 ? 2 : 1
      }).addTo(map);

      marker.bindPopup(`
        <div style="background: #111; color: white; padding: 4px;">
          <b style="font-size: 14px;">${m.name}</b><br/>
          <span style="font-size: 12px; opacity: 0.6;">${count} noticias reportadas</span>
        </div>
      `);
    });

    return () => {
      map.remove();
      (container as any)._leaflet_map = null;
    };
  }, [muniStats, selectedDept]);

  return <div id="map-container" className="w-full h-full" />;
}
