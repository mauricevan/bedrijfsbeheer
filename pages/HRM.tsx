import React, { useState } from 'react';
import { Employee, EmployeeNote, EmployeeNoteType, Permission } from '../types';
import { getAllPermissions } from '../utils/permissions';

interface HRMProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  isAdmin: boolean;
}

export const HRM: React.FC<HRMProps> = ({ employees, setEmployees, isAdmin }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    password: '',
    isAdmin: false,
    permissions: [] as Permission[],
  });
  
  const [editEmployee, setEditEmployee] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    password: '',
    isAdmin: false,
    permissions: [] as Permission[],
  });

  const availablePermissions = getAllPermissions();
  
  const [newNote, setNewNote] = useState({
    type: 'general' as EmployeeNoteType,
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role || !newEmployee.email) {
      alert('Vul alle verplichte velden in!');
      return;
    }

    // Als full_admin is geselecteerd, zet dan alleen die permission
    const permissions: Permission[] = newEmployee.isAdmin 
      ? ['full_admin']
      : newEmployee.permissions || [];

    const employee: Employee = {
      id: `e${Date.now()}`,
      name: newEmployee.name,
      role: newEmployee.role,
      email: newEmployee.email,
      phone: newEmployee.phone,
      password: newEmployee.password || undefined,
      isAdmin: newEmployee.isAdmin || false,
      permissions: permissions.length > 0 ? permissions : undefined,
      hireDate: new Date().toISOString().split('T')[0],
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', role: '', email: '', phone: '', password: '', isAdmin: false, permissions: [] });
    setShowAddForm(false);
    alert(`✅ Medewerker ${employee.name} succesvol toegevoegd!`);
  };

  const handlePermissionToggle = (permission: Permission, isEdit: boolean = false) => {
    if (isEdit) {
      const currentPermissions = editEmployee.permissions || [];
      if (permission === 'full_admin') {
        // Als full_admin wordt aangezet, zet dan alleen die
        setEditEmployee({
          ...editEmployee,
          isAdmin: true,
          permissions: ['full_admin']
        });
      } else {
        // Verwijder full_admin als die was geselecteerd
        const filtered = currentPermissions.filter(p => p !== 'full_admin');
        setEditEmployee({
          ...editEmployee,
          isAdmin: false,
          permissions: currentPermissions.includes(permission)
            ? filtered.filter(p => p !== permission)
            : [...filtered, permission]
        });
      }
    } else {
      const currentPermissions = newEmployee.permissions || [];
      if (permission === 'full_admin') {
        // Als full_admin wordt aangezet, zet dan alleen die
        setNewEmployee({
          ...newEmployee,
          isAdmin: true,
          permissions: ['full_admin']
        });
      } else {
        // Verwijder full_admin als die was geselecteerd
        const filtered = currentPermissions.filter(p => p !== 'full_admin');
        setNewEmployee({
          ...newEmployee,
          isAdmin: false,
          permissions: currentPermissions.includes(permission)
            ? filtered.filter(p => p !== permission)
            : [...filtered, permission]
        });
      }
    }
  };

  const deleteEmployee = (id: string) => {
    if (confirm('Weet je zeker dat je deze medewerker wilt verwijderen?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };
  
  const openEmployeeDetail = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetail(true);
  };
  
  const startEditEmployee = (employee: Employee) => {
    const hasFullAdmin = employee.isAdmin || employee.permissions?.includes('full_admin');
    setEditEmployee({
      name: employee.name,
      role: employee.role,
      email: employee.email,
      phone: employee.phone,
      password: '',
      isAdmin: hasFullAdmin || false,
      permissions: employee.permissions || (hasFullAdmin ? ['full_admin'] : []),
    });
    setSelectedEmployee(employee);
    setShowEditForm(true);
  };
  
  const handleUpdateEmployee = () => {
    if (!selectedEmployee) return;
    if (!editEmployee.name || !editEmployee.role || !editEmployee.email) {
      alert('Vul alle verplichte velden in!');
      return;
    }
    
    // Als full_admin is geselecteerd, zet dan alleen die permission
    const permissions: Permission[] = editEmployee.isAdmin 
      ? ['full_admin']
      : editEmployee.permissions || [];

    const updatedEmployee: Employee = {
      ...selectedEmployee,
      name: editEmployee.name,
      role: editEmployee.role,
      email: editEmployee.email,
      phone: editEmployee.phone,
      password: editEmployee.password || selectedEmployee.password,
      isAdmin: editEmployee.isAdmin || false,
      permissions: permissions.length > 0 ? permissions : undefined,
    };
    
    setEmployees(employees.map(e => e.id === selectedEmployee.id ? updatedEmployee : e));
    setShowEditForm(false);
    setSelectedEmployee(updatedEmployee);
    setEditEmployee({ name: '', role: '', email: '', phone: '', password: '', isAdmin: false, permissions: [] });
    alert(`✅ Medewerker ${updatedEmployee.name} succesvol bijgewerkt!`);
  };
  
  const handleAddNote = () => {
    if (!selectedEmployee) return;
    if (!newNote.title || !newNote.description) {
      alert('Vul titel en beschrijving in!');
      return;
    }
    
    const note: EmployeeNote = {
      id: `note${Date.now()}`,
      type: newNote.type,
      title: newNote.title,
      description: newNote.description,
      date: newNote.date,
      createdAt: new Date().toISOString(),
    };
    
    const updatedEmployee: Employee = {
      ...selectedEmployee,
      notes: [...(selectedEmployee.notes || []), note],
    };
    
    setEmployees(employees.map(e => e.id === selectedEmployee.id ? updatedEmployee : e));
    setSelectedEmployee(updatedEmployee);
    setNewNote({
      type: 'general',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddNoteForm(false);
    alert('✅ Notitie succesvol toegevoegd!');
  };
  
  const deleteNote = (noteId: string) => {
    if (!selectedEmployee) return;
    if (!confirm('Weet je zeker dat je deze notitie wilt verwijderen?')) return;
    
    const updatedEmployee: Employee = {
      ...selectedEmployee,
      notes: (selectedEmployee.notes || []).filter(n => n.id !== noteId),
    };
    
    setEmployees(employees.map(e => e.id === selectedEmployee.id ? updatedEmployee : e));
    setSelectedEmployee(updatedEmployee);
  };
  
  const getNoteTypeIcon = (type: EmployeeNoteType) => {
    switch (type) {
      case 'late': return '⏰';
      case 'absence': return '❌';
      case 'milestone': return '🎯';
      case 'performance': return '📊';
      case 'warning': return '⚠️';
      case 'compliment': return '⭐';
      case 'attendance': return '✅';
      default: return '📝';
    }
  };
  
  const getNoteTypeColor = (type: EmployeeNoteType) => {
    switch (type) {
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'absence': return 'bg-red-100 text-red-800 border-red-300';
      case 'milestone': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'performance': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'compliment': return 'bg-green-100 text-green-800 border-green-300';
      case 'attendance': return 'bg-teal-100 text-teal-800 border-teal-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const calculateTenure = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    
    if (years === 0) {
      return `${months} maanden`;
    } else if (months < 0) {
      return `${years - 1} jaar ${12 + months} maanden`;
    } else {
      return `${years} jaar ${months} maanden`;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral">Personeelsbeheer (HRM)</h1>
          <p className="text-gray-600 mt-1">Beheer medewerkers, roosters en loonadministratie</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            + Nieuwe Medewerker
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral mb-4">Nieuwe Medewerker Toevoegen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Naam *"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Functie *"
              value={newEmployee.role}
              onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="email"
              placeholder="Email *"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="tel"
              placeholder="Telefoon"
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="password"
              placeholder="Wachtwoord"
              value={newEmployee.password}
              onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {/* Admin Rechten Sectie */}
            <div className="col-span-2 border border-gray-300 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Admin Rechten</h3>
              <div className="space-y-2">
                {/* Volledige Admin Optie */}
                <div className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
                  <input
                    type="checkbox"
                    id="fullAdmin"
                    checked={newEmployee.isAdmin || (newEmployee.permissions?.includes('full_admin') ?? false)}
                    onChange={() => handlePermissionToggle('full_admin', false)}
                    className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex-1">
                    <label htmlFor="fullAdmin" className="text-sm font-medium text-gray-700 cursor-pointer">
                      ✅ Volledige Admin Rechten
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Alle rechten - geeft automatisch toegang tot alle functionaliteiten
                    </p>
                  </div>
                </div>

                {/* Per-stuk Rechten (alleen tonen als full_admin NIET geselecteerd is) */}
                {!newEmployee.isAdmin && !newEmployee.permissions?.includes('full_admin') && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Of selecteer specifieke rechten:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {availablePermissions.filter(p => p.value !== 'full_admin').map((permission) => (
                        <div key={permission.value} className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
                          <input
                            type="checkbox"
                            id={`perm-${permission.value}`}
                            checked={newEmployee.permissions?.includes(permission.value) || false}
                            onChange={() => handlePermissionToggle(permission.value, false)}
                            className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={`perm-${permission.value}`} 
                              className="text-xs font-medium text-gray-700 cursor-pointer"
                            >
                              {permission.label}
                            </label>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddEmployee}
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

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totaal Medewerkers</p>
              <p className="text-2xl font-bold text-neutral mt-1">{employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Functies</p>
              <p className="text-2xl font-bold text-neutral mt-1">
                {new Set(employees.map(e => e.role)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gemiddelde Diensttijd</p>
              <p className="text-2xl font-bold text-neutral mt-1">
                {employees.length > 0
                  ? Math.round(
                      employees.reduce((sum, emp) => {
                        const years = new Date().getFullYear() - new Date(emp.hireDate).getFullYear();
                        return sum + years;
                      }, 0) / employees.length
                    )
                  : 0}{' '}
                jaar
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => (
          <div key={employee.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral text-lg">{employee.name}</h3>
                    {employee.isAdmin && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                        👑 Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{employee.role}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">{employee.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">{employee.phone}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">In dienst sinds:</span>
                <span className="text-sm font-semibold text-neutral">{employee.hireDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Diensttijd:</span>
                <span className="text-sm font-semibold text-primary">{calculateTenure(employee.hireDate)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEmployeeDetail(employee)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                📋 Dossier
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => startEditEmployee(employee)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteEmployee(employee.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Geen medewerkers gevonden</p>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditForm && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-2xl sm:w-full h-full sm:h-auto p-4 sm:p-6 sm:my-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral">✏️ Medewerker Bewerken</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedEmployee(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Naam *"
                value={editEmployee.name}
                onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Functie *"
                value={editEmployee.role}
                onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Email *"
                value={editEmployee.email}
                onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel"
                placeholder="Telefoon"
                value={editEmployee.phone}
                onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="password"
                placeholder="Nieuw wachtwoord (leeg laten om te behouden)"
                value={editEmployee.password}
                onChange={(e) => setEditEmployee({ ...editEmployee, password: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {/* Admin Rechten Sectie */}
              <div className="col-span-2 border border-gray-300 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Admin Rechten</h3>
                <div className="space-y-2">
                  {/* Volledige Admin Optie */}
                  <div className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
                    <input
                      type="checkbox"
                      id="editFullAdmin"
                      checked={editEmployee.isAdmin || (editEmployee.permissions?.includes('full_admin') ?? false)}
                      onChange={() => handlePermissionToggle('full_admin', true)}
                      className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex-1">
                      <label htmlFor="editFullAdmin" className="text-sm font-medium text-gray-700 cursor-pointer">
                        ✅ Volledige Admin Rechten
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Alle rechten - geeft automatisch toegang tot alle functionaliteiten
                      </p>
                    </div>
                  </div>

                  {/* Per-stuk Rechten (alleen tonen als full_admin NIET geselecteerd is) */}
                  {!editEmployee.isAdmin && !editEmployee.permissions?.includes('full_admin') && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">Of selecteer specifieke rechten:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {availablePermissions.filter(p => p.value !== 'full_admin').map((permission) => (
                          <div key={permission.value} className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
                            <input
                              type="checkbox"
                              id={`edit-perm-${permission.value}`}
                              checked={editEmployee.permissions?.includes(permission.value) || false}
                              onChange={() => handlePermissionToggle(permission.value, true)}
                              className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`edit-perm-${permission.value}`} 
                                className="text-xs font-medium text-gray-700 cursor-pointer"
                              >
                                {permission.label}
                              </label>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateEmployee}
                className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                Opslaan
              </button>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedEmployee(null);
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail / Dossier Modal */}
      {showEmployeeDetail && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto sm:my-8 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral">📋 Persoonlijk Dossier</h2>
                  <p className="text-gray-600 mt-1">{selectedEmployee.name} - {selectedEmployee.role}</p>
                </div>
                <button
                  onClick={() => {
                    setShowEmployeeDetail(false);
                    setSelectedEmployee(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Employee Info */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-neutral">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefoon</p>
                  <p className="font-semibold text-neutral">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">In dienst sinds</p>
                  <p className="font-semibold text-neutral">{selectedEmployee.hireDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Diensttijd</p>
                  <p className="font-semibold text-primary">{calculateTenure(selectedEmployee.hireDate)}</p>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-neutral">📝 Notities</h3>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddNoteForm(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm"
                    >
                      + Notitie Toevoegen
                    </button>
                  )}
                </div>

                {/* Add Note Form */}
                {showAddNoteForm && isAdmin && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-neutral mb-3">Nieuwe Notitie</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={newNote.type}
                          onChange={(e) => setNewNote({ ...newNote, type: e.target.value as EmployeeNoteType })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="general">Algemeen</option>
                          <option value="late">Te laat</option>
                          <option value="absence">Afwezig</option>
                          <option value="milestone">Milestone</option>
                          <option value="performance">Prestatie</option>
                          <option value="warning">Waarschuwing</option>
                          <option value="compliment">Compliment</option>
                          <option value="attendance">Aanwezigheid</option>
                        </select>
                        <input
                          type="date"
                          value={newNote.date}
                          onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Titel *"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <textarea
                        placeholder="Beschrijving *"
                        value={newNote.description}
                        onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddNote}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          Toevoegen
                        </button>
                        <button
                          onClick={() => {
                            setShowAddNoteForm(false);
                            setNewNote({
                              type: 'general',
                              title: '',
                              description: '',
                              date: new Date().toISOString().split('T')[0],
                            });
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                        >
                          Annuleren
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes List */}
                <div className="space-y-3">
                  {selectedEmployee.notes && selectedEmployee.notes.length > 0 ? (
                    [...selectedEmployee.notes]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((note) => (
                        <div
                          key={note.id}
                          className={`border-2 rounded-lg p-4 ${getNoteTypeColor(note.type)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getNoteTypeIcon(note.type)}</span>
                              <div>
                                <h4 className="font-semibold text-lg">{note.title}</h4>
                                <p className="text-xs opacity-75">{note.date}</p>
                              </div>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="text-red-500 hover:text-red-700 text-xl"
                                title="Verwijderen"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          <p className="text-sm mt-2">{note.description}</p>
                          {note.createdAt && (
                            <p className="text-xs opacity-60 mt-2">
                              Aangemaakt: {new Date(note.createdAt).toLocaleString('nl-NL')}
                            </p>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nog geen notities toegevoegd</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};