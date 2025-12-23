import React from 'react';

export default function SesionCard({ session, dayDate, onAddCalendar, onToggleFavorite, isFavorite }) {
  const { time, title, speakers, entity, room } = session;

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">
            {time} — <span className="font-medium text-sky-600">{room}</span>
          </div>
          <div className="mt-1 font-semibold text-gray-800">{title}</div>
          {speakers && speakers.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Ponentes:</strong> {speakers.join(', ')}
            </div>
          )}
          {entity && (
            <div className="text-sm text-gray-500">
              <strong>Entidad:</strong> {entity}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={() => onAddCalendar(session, dayDate)}
            className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 text-sm"
          >
            Añadir al calendario
          </button>
          <button
            onClick={() => onToggleFavorite(session)}
            className={`px-3 py-1 rounded text-sm ${
              isFavorite ? 'bg-yellow-400 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            ★
          </button>
        </div>
      </div>
    </div>
  );
}
