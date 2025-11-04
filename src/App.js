import React, { useEffect, useState } from 'react';
import SesionCard from './components/SesionCard';
import programaData from './data/programa.json';
import { parseISO, setHours, setMinutes, formatISO } from 'date-fns';

function App() {
  const [program, setProgram] = useState(programaData);
  const [selectedDay, setSelectedDay] = useState(programaData.days[0].label);
  const [roomFilter, setRoomFilter] = useState('Todos');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setProgram(programaData);
  }, []);

  const days = program.days;

  const addToCalendar = (session, dayDate) => {
    // build start and end datetime in local time and generate ICS
    // session.time is like "16:15"; dayDate is "2026-05-20"
    const [hh, mm] = session.time.split(':').map(Number);
    let start = parseISO(dayDate + 'T00:00:00');
    start = setHours(setMinutes(start, mm), hh);
    const end = new Date(start.getTime() + (session.durationMinutes || 60) * 60000);

    const toICSDate = (d) => {
      // YYYYMMDDTHHMMSSZ (use UTC)
      return formatISO(d).replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:' + session.title,
      'DTSTART:' + toICSDate(start),
      'DTEND:' + toICSDate(end),
      'DESCRIPTION:Ponentes: ' + session.speakers.join(', ') + ' \nEntidad: ' + session.entity + ' \nSala: ' + session.room,
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

  const filtered = days.find(d => d.label === selectedDay).sessions.filter(s => {
    if (roomFilter !== 'Todos' && s.room !== roomFilter) return false;
    if (query.trim() === '') return true;
    const q = query.toLowerCase();
    if (s.title.toLowerCase().includes(q)) return true;
    if (s.speakers.join(' ').toLowerCase().includes(q)) return true;
    return false;
  });

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
        <section className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              {days.map(d => (
                <button
                  key={d.label}
                  onClick={() => { setSelectedDay(d.label); setQuery(''); setRoomFilter('Todos'); }}
                  className={'px-3 py-1 rounded ' + (selectedDay === d.label ? 'bg-sky-600 text-white' : 'bg-white border')}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="px-2 py-1 border rounded">
                <option>Todos</option>
                <option>Auditorio</option>
                <option>Sala Polivalente</option>
              </select>

              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar por título o ponente..."
                className="px-3 py-1 border rounded w-56"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {filtered.length === 0 && <div className="text-gray-500">No hay ponencias que coincidan.</div>}
          {filtered.map((s, idx) => (
            <SesionCard key={idx} session={s} dayDate={days.find(d => d.label === selectedDay).date} onAddCalendar={addToCalendar} />
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