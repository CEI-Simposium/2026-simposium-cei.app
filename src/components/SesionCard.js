import React from 'react';

const SesionCard = React.memo(({ session, dayDate, onAddCalendar, onToggleFavorite, isFavorite }) => {
  const { time, title, speakers, entity, room } = session;

  // 1. Definición de estilos por tipo de sala
  const isGeneral = room === 'General';
  
  const getRoomStyle = (r) => {
    switch (r) {
      case 'Auditorio':
        return 'border-l-amber-500 bg-amber-50/30 text-amber-700 border-amber-200';
      case 'Polivalente':
        return 'border-l-emerald-500 bg-emerald-50/30 text-emerald-700 border-emerald-200';
      default:
        return 'border-l-slate-300 bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const roomClasses = getRoomStyle(room);

  // 2. Formato para eventos GENERALES (Pausas, Acreditaciones, Comidas)
  if (isGeneral) {
    return (
      <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-3 flex items-center justify-between opacity-80">
        <div className="flex items-center gap-4">
          <span className="text-sm font-black text-slate-500 w-12">{time}</span>
          <div>
            <h4 className="text-sm font-bold text-slate-600">{title}</h4>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">☕ Evento General</span>
          </div>
        </div>
        <button 
          onClick={() => onAddCalendar(session, dayDate)}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          title="Añadir al calendario"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        </button>
      </div>
    );
  }

  // 3. Formato para PONENCIAS (Auditorio y Polivalente)
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 border-l-4 transition-all ${roomClasses}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-slate-900 text-lg">{time}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-tight ${roomClasses}`}>
              {room}
            </span>
          </div>
          
          <h4 className="font-bold text-slate-800 leading-tight text-base mb-2 italic md:not-italic">
            {title}
          </h4>

          {speakers && (
            <div className="text-sm text-slate-600 flex items-start gap-1.5 mt-2">
              <span className="mt-0.5">👤</span>
              <span className="font-medium">{speakers.join(', ')}</span>
            </div>
          )}
          
          {entity && (
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span>🏢</span>
              <span className="truncate">{entity}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => onToggleFavorite(session)} 
            className={`p-3 rounded-xl transition-all active:scale-90 ${isFavorite ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'bg-slate-50 text-slate-300'}`}
          >
            <svg width="20" height="20" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </button>
          
          <button 
            onClick={() => onAddCalendar(session, dayDate)} 
            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all active:scale-90"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default SesionCard;