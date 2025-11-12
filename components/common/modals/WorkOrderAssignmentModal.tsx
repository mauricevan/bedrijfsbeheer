import React, { useState, useEffect } from 'react';
import { Employee } from '../../../types';

export interface WorkOrderAssignmentData {
  assigneeId: string;
  scheduledDate?: string;
  location?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

interface WorkOrderAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignmentData: WorkOrderAssignmentData) => void;
  employees: Employee[];
  prefillData: {
    customerName: string;
    estimatedHours?: number;
    estimatedCost?: number;
  };
}

export const WorkOrderAssignmentModal: React.FC<WorkOrderAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  employees,
  prefillData,
}) => {
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Set default scheduled date (today + 7 days)
  useEffect(() => {
    if (isOpen && !scheduledDate) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setScheduledDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const validateAssignment = (): { isValid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];

    if (!selectedAssignee) {
      validationErrors.push('Selecteer een medewerker');
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    };
  };

  const handleAssign = () => {
    const validation = validateAssignment();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const assignmentData: WorkOrderAssignmentData = {
      assigneeId: selectedAssignee,
      scheduledDate: scheduledDate || undefined,
      location: location || undefined,
      priority,
      notes: notes || undefined,
    };

    onAssign(assignmentData);
    handleReset();
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedAssignee('');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setScheduledDate(defaultDate.toISOString().split('T')[0]);
    setLocation('');
    setPriority('normal');
    setNotes('');
    setErrors([]);
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-neutral flex items-center gap-2">
            <span>🔧</span>
            <span>Werkorder Toewijzen</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Wijs een medewerker toe aan deze werkorder
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Context Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>💼</span>
              <span>Werkorder Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">🏢</span>
                <div>
                  <p className="text-xs text-blue-700 font-medium">Klant</p>
                  <p className="text-blue-900">{prefillData.customerName}</p>
                </div>
              </div>
              {prefillData.estimatedHours !== undefined && prefillData.estimatedHours > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">⏱️</span>
                  <div>
                    <p className="text-xs text-blue-700 font-medium">Geschatte uren</p>
                    <p className="text-blue-900">{prefillData.estimatedHours}u</p>
                  </div>
                </div>
              )}
              {prefillData.estimatedCost !== undefined && prefillData.estimatedCost > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">💰</span>
                  <div>
                    <p className="text-xs text-blue-700 font-medium">Waarde</p>
                    <p className="text-blue-900">€{prefillData.estimatedCost.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-red-600">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    Corrigeer de volgende fouten:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Medewerker Dropdown (VERPLICHT) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medewerker * <span className="text-red-600">verplicht</span>
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => {
                setSelectedAssignee(e.target.value);
                setErrors([]);
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.length > 0 && !selectedAssignee
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            >
              <option value="">-- Kies een medewerker --</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.role}
                </option>
              ))}
            </select>
            {errors.length > 0 && !selectedAssignee && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Je moet een medewerker selecteren
              </p>
            )}
          </div>

          {/* Geplande Datum (Optioneel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geplande Datum
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              Standaard: 7 dagen vanaf vandaag
            </p>
          </div>

          {/* Locatie (Optioneel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locatie
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="bijv. Hoofdkantoor, Werkplaats, Klantenlocatie"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Prioriteit (Optioneel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioriteit
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    priority === p
                      ? p === 'low'
                        ? 'border-gray-400 bg-gray-100 text-gray-800'
                        : p === 'normal'
                        ? 'border-blue-400 bg-blue-100 text-blue-800'
                        : p === 'high'
                        ? 'border-orange-400 bg-orange-100 text-orange-800'
                        : 'border-red-400 bg-red-100 text-red-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {p === 'low' && '⬇️ Laag'}
                  {p === 'normal' && '➡️ Normaal'}
                  {p === 'high' && '⬆️ Hoog'}
                  {p === 'urgent' && '🔥 Urgent'}
                </button>
              ))}
            </div>
          </div>

          {/* Notities (Optioneel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notities
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra instructies voor de medewerker..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/500 karakters
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleAssign}
            disabled={!selectedAssignee}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedAssignee
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            ✓ Toewijzen & Aanmaken
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
};
