import React from 'react';
import { format } from 'date-fns';

export default function SesionCard({ session, dayDate, onAddCalendar }) {
  const { time, title, speakers, entity, room, durationMinutes } = session;

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{time} — <span className="font-medium text-sky-600">{room}</span></div>
          <div className="mt-1 font-semibold text-gray-800">{title}</div>
          <div className="mt-2 text-sm text-gray-600"><strong>Ponentes:</strong> {speakers.join(', ')}</div>
          <div className="text-sm text-gray-500"><strong>Entidad:</strong> {entity}</div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={() => onAddCalendar(session, dayDate)}
            className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 text-sm"
          >
            Añadir al calendario
          </button>
        </div>
      </div>
    </div>
  );
}