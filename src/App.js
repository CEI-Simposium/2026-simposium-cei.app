import React, { useEffect, useState } from 'react';
import SesionCard from './components/SesionCard';
import Auth from "./components/Auth";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import programaData from './data/programa.json';
import { parseISO, setHours, setMinutes, formatISO } from 'date-fns';

function App() {
  const [program, setProgram] = useState(programaData);
  const [selectedDay, setSelectedDay] = useState(programaData.days[0].label);
  const [roomFilter, setRoomFilter] = useState('Todos');
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const days = program.days;

  // Firebase Auth listener
  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, "favorites", u.uid);
        const docSnap = await getDoc(docRef);
        setFavorites(docSnap.exists() ? docSnap.data().sessions || [] : []);
      } else {
        setFavorites([]);
      }
    });
  }, []);

  // Add to Calendar
  const addToCalendar = (session, dayDate) => {
    const [hh, mm] = session.time.split(':').map(Number);
    let start = parseISO(dayDate + 'T00:00:00');
    start = setHours(setMinutes(start, mm), hh);
    const end = new Date(start.getTime() + (session.durationMinutes || 60) * 60000);

    const toICSDate = (d) => formatISO(d).replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:' + session.title,
      'DTSTART:' + toICSDate(start),
      'DTEND:' + toICSDate(end),
      'DESCRIPTION:Ponentes: ' + (session.speakers || []).join(', ') + ' \nEntidad: ' + session.entity + ' \nSala: ' + session.room,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = session.title.replace(/[^a-z0-9]/gi, '_') + '.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Toggle favorite
  const toggleFavorite = async (session) => {
    if (!user) return alert("Debes iniciar sesión para guardar favoritos");
    let updated;
    if (favorites.some(f => f.title === session.title && f.time === session.time)) {
      updated = favorites.filter(f => !(f.title === session.title && f.time === session.time));
    } else {
      updated = [...favorites, session];
    }
    setFavorites(updated);
    await setDoc(doc(db, "favorites", user.uid), { sessions: updated });
  }

  // Filtered sessions
  const currentDaySessions = days.find(d => d.label === selectedDay)?.sessions || [];
  const filtered = currentDaySessions.filter(s => {
    if (roomFilter !== 'Todos' && s.room !== roomFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return s.title?.toLowerCase().includes(q)
      || s.speakers?.join(' ').toLowerCase().includes(q)
      || s.entity?.toLowerCase().includes(q);
  });

  const displayedSessions = showFavorites ? favorites : filtered;

  // Favorites grouped by day and ordered
  const favoritesByDay = favorites.reduce((acc, session) => {
    if (!acc[session.day]) acc[session.day] = [];
    acc[session.day].push(session);
    return acc;
  }, {});

  const orderedFavoritesByDay = days
    .map(d => [d.date, favoritesByDay[d.date] || []])
    .filter(([_, sessions]) => sessions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <img src="/assets/logo.png" alt="CEI logo" className="h-12" />
          <div>
            <h1 className="text-xl font-bold text-sky-700">LII Simposium Nacional de Alumbrado</h1>
            <div className="text-sm text-gray-600">Lleida, 20–22 de mayo de 2026</div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Auth />

        <section className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              {days.map(d => (
                <button
                  key={d.label}
                  onClick={() => { setSelectedDay(d.label); setQuery(''); setRoomFilter('Todos'); setShowFavorites(false); }}
                  className={'px-3 py-1 rounded ' + (selectedDay === d.label ? 'bg-sky-600 text-white' : 'bg-white border')}
                >
                  {d.label}
                </button>
              ))}
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={'px-3 py-1 rounded ' + (showFavorites ? 'bg-yellow-400 text-white' : 'bg-white border')}
              >
                Favoritos
              </button>
            </div>

            {!showFavorites && (
              <div className="flex items-center gap-2">
                <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="px-2 py-1 border rounded">
                  <option>Todos</option>
                  <option>Auditorio</option>
                  <option>Polivalente</option>
                </select>

                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar por título, ponente o entidad..."
                  className="px-3 py-1 border rounded w-64"
                />
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          {!showFavorites && displayedSessions.length === 0 && <div className="text-gray-500">No hay ponencias que coincidan.</div>}

          {!showFavorites && displayedSessions.map((s, idx) => (
            <SesionCard
              key={idx}
              session={s}
              dayDate={days.find(d => d.label === selectedDay)?.date}
              onAddCalendar={addToCalendar}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.some(f => f.title === s.title && f.time === s.time)}
            />
          ))}

          {showFavorites && orderedFavoritesByDay.map(([day, sessions]) => (
            <div key={day}>
              <h3 className="mt-4 mb-2 font-bold text-sky-700">
                {days.find(d => d.date === day)?.label || day}
              </h3>

              <div className="space-y-3">
                {sessions.map((s, idx) => (
                  <SesionCard
                    key={idx}
                    session={s}
                    dayDate={day}
                    onAddCalendar={addToCalendar}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-sky-600 text-white p-3 rounded-full shadow-lg"
        aria-label="Volver arriba"
      >
        ↑
      </button>
    </div>
  );
}

export default App;
