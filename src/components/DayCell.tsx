import React from 'react';
import dayjs from 'dayjs';

type Trabajador = {
  id: number;
  nombre: string;
  puesto: string;
};

type Props = {
  date: Date;
  trabajadores: Trabajador[];
  onAsignar: (fecha: string, casilla: string, trabajador_id: number | null) => void;
  asignaciones: { [casilla: string]: number | null };
};

const DayCell: React.FC<Props> = ({ date, trabajadores, onAsignar, asignaciones }) => {
  const campos = [
    { id: 'manana_id', label: 'Gua' },
    { id: 'sc_manana_id', label: 'SCm' },
    { id: 'int_manana_id', label: 'InM' },
    { id: 'tarde_id', label: 'MtQ' },
    { id: 'sc_tarde_id', label: 'SCt' },
    { id: 'int_tarde_id', label: 'InMQ' },
  ];

  return (
    <div className="border h-96 p-2 flex flex-col max-h-96 rounded-lg bg-purple-300 bg-opacity-30 shadow-sm">
      {/* Número del día con tamaño grande, centrado y verde */}
      <div className="text-4xl font-bold text-center text-green-600 mb-2">{date.getDate()}</div>
      
      <div className="flex-1 grid grid-cols-1 gap-1 p-1 overflow-auto">
        {campos.map(({ id, label }) => {
          const value = asignaciones?.[id];
          const esInterventor = id.includes('int_');
          const trabajadoresFiltrados = trabajadores.filter(t =>
            esInterventor ? t.puesto === 'Interventor' : t.puesto === 'Maquinista'
          );

          return (
            <div key={id} className="flex items-center gap-2">
              <label className="text-xs w-6">{label}</label>
              
              {/* Aquí cambiaremos los colores dependiendo de si es mañana o tarde */}
              <select
                value={value != null ? String(value) : ''}
                className={`text-xs w-full h-8 border rounded-md ${id.includes('manana') ? 'bg-red-300' : 'bg-blue-300'}`}
                onChange={(e) => {
                  const val = e.target.value;
                  const trabajador_id = val ? parseInt(val) : null;
                  const fechaStr = dayjs(date).format('YYYY-MM-DD');
                  onAsignar(fechaStr, id, trabajador_id);
                }}
              >
                <option key="0" value="0">--</option>
                {trabajadoresFiltrados.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayCell;