import React, { useState, useEffect } from 'react';
import DayCell from './DayCell';
import dayjs, { Dayjs } from 'dayjs';

const API_URL = import.meta.env.VITE_API_URL;

type Trabajador = {
  id: number;
  nombre: string;
  puesto: string;
};

type Turno = {
  fecha: string;
  [casilla: string]: number | string | null;
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [turnosMes, setTurnosMes] = useState<Turno[]>([]);

  useEffect(() => {
    fetch(`${API_URL}trabajadores`)
      .then(res => res.json())
      .then(data => setTrabajadores(data));
  }, []);

  useEffect(() => {
    const startDate = startOfMonth.format('YYYY-MM-DD');
    const endDate = endOfMonth.format('YYYY-MM-DD');

    fetch(`${API_URL}turnos_rango?desde=${startDate}&hasta=${endDate}`)
      .then(res => res.json())
      .then(data => setTurnosMes(data));
  }, [currentDate]);

  const startOfMonth = currentDate.startOf('month').startOf('week');
  const endOfMonth = currentDate.endOf('month').endOf('week');

  const days: Dayjs[] = [];
  let day = startOfMonth;

  while (day.isBefore(endOfMonth)) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  const handleAsignar = (fecha: string, casilla: string, trabajador_id: number | null) => {
    const payload = { fecha, casilla, trabajador_id };

    console.log('Asignando turno...', payload);

    fetch(`${API_URL}asignar/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json()) // Aseguramos que la respuesta se convierte en JSON
      .then((data) => {
        console.log('Respuesta del servidor al asignar:', data);
        
        if (data.success) {

          const trabajador_id_real = trabajador_id === 0 ? null : trabajador_id;
          
          setTurnosMes((prevTurnos) => {
            const updatedTurnos = prevTurnos.map((turno) => {
              if (turno.fecha === fecha) {
                return { ...turno, [casilla]: trabajador_id_real };
              }
              return turno;
            });

            if (!prevTurnos.some((turno) => turno.fecha === fecha)) {
              return [...updatedTurnos, { fecha, [casilla]: trabajador_id_real }];
            }
            return updatedTurnos;
          });

          // Comprobar el estado después de la actualización
          console.log('Después de actualizar turnosMes:', turnosMes);
        } else {
          console.error('Error al asignar el turno: No se pudo completar la asignación.');
        }
      })
      .catch((error) => {
        console.error("Error al asignar el turno", error);
      });
  };

  return (
    <div className="flex flex-col bg-purple-100 bg-opacity-30 min-h-screen p-4 h-screen">
      <div className="flex justify-between items-center p-4">
        <button
          onClick={prevMonth}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded"
        >
          {"<"}
        </button>
        <h1 className="text-xl font-bold">{currentDate.format('MMMM YYYY')}</h1>
        <button
          onClick={nextMonth}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded"
        >
          {">"}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 p-2 flex-1">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
          <div key={d} className="text-center font-bold">{d}</div>
        ))}
        {days.map((day) => {
          const fechaStr = day.format('YYYY-MM-DD');
          const asignaciones = turnosMes.find(t => t.fecha === fechaStr) || {};

          return (
            <DayCell
              key={fechaStr}
              date={day.toDate()}
              trabajadores={trabajadores}
              onAsignar={handleAsignar}
              asignaciones={asignaciones}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;