import React, { useEffect, useState, useMemo } from 'react';
import SesionCard from './components/SesionCard';
import Auth from "./components/Auth";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import programaData from './data/programa.json';
import { parseISO, setHours, setMinutes, formatISO } from 'date-fns';

function App() {
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(programaData.days[0].label);
  const [roomFilter, setRoomFilter] = useState('Todos');
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Listener de autenticación y carga de favoritos de Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, "favorites", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setFavorites(docSnap.data().sessions || []);
      } else {
        setFavorites([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Función optimizada para descargar archivo de calendario (.ics)
  const addToCalendar = (session, dayDate) => {
    try {
      const [hh, mm] = session.time.split(':').map(Number);
      let start = parseISO(dayDate + 'T00:00:00');
      start = setHours(setMinutes(start, mm), hh);
      const duration = session.durationMinutes || 60;
      const end = new Date(start.getTime() + duration * 60000);
      const toICSDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const cleanTitle = session.title.replace(/,/g, '\\,');
      const cleanRoom = session.room.replace(/,/g, '\\,');
      const speakers = (session.speakers || []).join(', ').replace(/,/g, '\\,');

      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `SUMMARY:${cleanTitle}`,
        `DTSTART:${toICSDate(start)}`,
        `DTEND:${toICSDate(end)}`,
        `LOCATION:${cleanRoom}`,
        `DESCRIPTION:Ponentes: ${speakers}\\nEntidad: ${session.entity || 'N/A'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${session.title.substring(0, 20).replace(/\s+/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error al crear el evento:", error);
    }
  };

  // Función para añadir/quitar de favoritos en Firebase
  const toggleFavorite = async (session) => {
    if (!user) return alert("Inicia sesión para guardar favoritos");
    const isFav = favorites.some(f => f.title === session.title && f.time === session.time);
    const updated = isFav 
      ? favorites.filter(f => !(f.title === session.title && f.time === session.time))
      : [...favorites, { ...session, day: programaData.days.find(d => d.label === selectedDay).date }];
    
    setFavorites(updated);
    await setDoc(doc(db, "favorites", user.uid), { sessions: updated });
  };

  // Lógica de filtrado de sesiones
  const displayedSessions = useMemo(() => {
    if (showFavorites) return favorites;
    const day = programaData.days.find(d => d.label === selectedDay);
    return (day?.sessions || []).filter(s => {
      const matchRoom = roomFilter === 'Todos' || s.room === roomFilter;
      const matchQuery = !query || s.title.toLowerCase().includes(query.toLowerCase()) || 
                         s.speakers?.some(sp => sp.toLowerCase().includes(query.toLowerCase()));
      return matchRoom && matchQuery;
    });
  }, [selectedDay, roomFilter, query, showFavorites, favorites]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-sky-700">Cargando programa...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <header className="bg-white border-b sticky top-0 z-20 p-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="bg-sky-600 text-white p-2 rounded-lg font-black italic shadow-sm">CEI</div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">LII Simposium Nacional de Alumbrado</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Lleida, 20–22 de mayo de 2026</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <Auth user={user} />

        {/* SELECTOR DE DÍAS Y FAVORITOS */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {programaData.days.map(d => (
            <button key={d.label} onClick={() => { setSelectedDay(d.label); setShowFavorites(false); }}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedDay === d.label && !showFavorites ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-600 border'}`}>
              {d.label}
            </button>
          ))}
          <button onClick={() => setShowFavorites(true)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${showFavorites ? 'bg-yellow-400 text-white shadow-md' : 'bg-white text-slate-600 border'}`}>
            ⭐ Mis Favoritos
          </button>
        </div>

        {/* FILTROS DE BÚSQUEDA (Ocultos en favoritos) */}
        {!showFavorites && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="Todos">Todas las salas</option>
              <option value="Auditorio">Auditorio</option>
              <option value="Polivalente">Polivalente</option>
              <option value="General">General / Pausas</option>
            </select>
            <input 
              placeholder="Buscar por título o ponente..." 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none" 
            />
          </div>
        )}

        {/* LISTADO DE SESIONES ORGANIZADO */}
        <div className="space-y-6">
          {displayedSessions.length === 0 && (
            <p className="text-center text-slate-400 py-12 font-medium">No se han encontrado sesiones.</p>
          )}

          {showFavorites ? (
            // VISTA AGRUPADA POR DÍAS EN FAVORITOS
            programaData.days.map(day => {
              const dayFavs = favorites.filter(f => f.day === day.date);
              if (dayFavs.length === 0) return null;
              return (
                <div key={day.date} className="space-y-3">
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {day.label}
                    </span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>
                  {dayFavs.map((s, i) => (
                    <SesionCard 
                      key={`${s.time}-${i}`} 
                      session={s} 
                      dayDate={s.day} 
                      onAddCalendar={addToCalendar} 
                      onToggleFavorite={toggleFavorite} 
                      isFavorite={true} 
                    />
                  ))}
                </div>
              );
            })
          ) : (
            // VISTA NORMAL POR DÍA SELECCIONADO
            <div className="space-y-3">
              {displayedSessions.map((s, i) => (
                <SesionCard 
                  key={`${s.time}-${i}`} 
                  session={s} 
                  dayDate={programaData.days.find(d => d.label === selectedDay).date} 
                  onAddCalendar={addToCalendar} 
                  onToggleFavorite={toggleFavorite} 
                  isFavorite={favorites.some(f => f.title === s.title && f.time === s.time)} 
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-slate-900 text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center z-30"
      >
        ↑
      </button>
    </div>
  );
}

export default App;