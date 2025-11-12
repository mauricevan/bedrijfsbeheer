import React, { useState } from 'react';
import { CalendarEvent, Employee, Customer, WorkOrder } from '../types';

interface PlanningProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  employees: Employee[];
  customers: Customer[];
  workOrders: WorkOrder[];
  isAdmin: boolean;
}

const PlanningComponent: React.FC<PlanningProps> = ({
  events,
  setEvents,
  employees,
  customers,
  workOrders,
  isAdmin,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'other' as 'workorder' | 'meeting' | 'vacation' | 'other',
    employeeId: '',
  });

  const getEventsForDate = (date: string) => {
    return events.filter(event => {
      const eventDate = event.start.split('T')[0];
      return eventDate === date;
    });
  };

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Niet toegewezen';
    return employees.find(e => e.id === employeeId)?.name || 'Onbekend';
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'workorder': return 'bg-blue-100 border-blue-500 text-blue-900';
      case 'meeting': return 'bg-purple-100 border-purple-500 text-purple-900';
      case 'vacation': return 'bg-green-100 border-green-500 text-green-900';
      default: return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      alert('Vul alle verplichte velden in!');
      return;
    }

    const event: CalendarEvent = {
      id: `cal${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      start: newEvent.start,
      end: newEvent.end,
      type: newEvent.type,
      employeeId: newEvent.employeeId || undefined,
    };

    setEvents([...events, event]);
    setNewEvent({
      title: '',
      description: '',
      start: '',
      end: '',
      type: 'other',
      employeeId: '',
    });
    setShowAddForm(false);
  };

  const deleteEvent = (id: string) => {
    if (confirm('Weet je zeker dat je dit evenement wilt verwijderen?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  // Generate week days
  const getWeekDays = () => {
    const date = new Date(selectedDate);
    const week = [];
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Start van de week (maandag)
    
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date);
      newDate.setDate(diff + i);
      week.push(newDate.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral">Planning & Agenda</h1>
          <p className="text-gray-600 mt-1">Plan werkzaamheden, afspraken en monitor deadlines</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            + Nieuw Evenement
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral mb-4">Nieuw Evenement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Titel *"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="other">Overig</option>
              <option value="workorder">Werkorder</option>
              <option value="meeting">Meeting</option>
              <option value="vacation">Vakantie</option>
            </select>
            <input
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={newEvent.employeeId}
              onChange={(e) => setNewEvent({ ...newEvent, employeeId: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Geen medewerker</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.role}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Beschrijving (optioneel)"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={2}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddEvent}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              Toevoegen
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* View Controls */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'day' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Dag
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'week' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'month' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Maand
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() - 7);
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
            className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ←
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() + 7);
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
            className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            →
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
          >
            Vandaag
          </button>
        </div>
      </div>

      {/* Week View */}
      {view === 'week' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((date, index) => {
              const isToday = date === new Date().toISOString().split('T')[0];
              return (
                <div
                  key={date}
                  className={`p-4 text-center border-r last:border-r-0 ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-semibold text-neutral">{dayNames[index]}</div>
                  <div className={`text-sm ${isToday ? 'text-primary font-bold' : 'text-gray-600'}`}>
                    {new Date(date).getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7">
            {weekDays.map((date) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div key={date} className="min-h-[200px] p-2 border-r last:border-r-0 border-b">
                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`p-2 rounded border-l-4 text-xs ${getEventColor(event.type)}`}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {new Date(event.start).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {getEmployeeName(event.employeeId)}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="text-red-600 hover:text-red-800 mt-1 text-xs"
                          >
                            Verwijder
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-neutral mb-4">
            {new Date(selectedDate).toLocaleDateString('nl-NL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <div className="space-y-3">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-center py-8">Geen evenementen gepland</p>
            ) : (
              getEventsForDate(selectedDate).map(event => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border-l-4 ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm mt-1 opacity-75">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>
                          {new Date(event.start).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(event.end).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span>{getEmployeeName(event.employeeId)}</span>
                        <span>•</span>
                        <span className="capitalize">{event.type}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Verwijder
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Month View - Simple List */}
      {view === 'month' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-neutral mb-4">Alle Evenementen</h2>
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Geen evenementen</p>
            ) : (
              events
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                .map(event => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border-l-4 ${getEventColor(event.type)} flex items-center justify-between`}
                  >
                    <div>
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-sm opacity-75">
                        {new Date(event.start).toLocaleDateString('nl-NL')} - {getEmployeeName(event.employeeId)}
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Verwijder
                      </button>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Planning = React.memo(PlanningComponent);