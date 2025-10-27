import React, { useState, useMemo } from 'react';
import { Customer, Sale, Task, Lead, Interaction, Employee, User, LeadStatus, InteractionType } from '../types';
import { LEAD_SOURCES, INTERACTION_TYPES } from '../data/mockData';

interface CRMProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  sales: Sale[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  interactions: Interaction[];
  setInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>;
  employees: Employee[];
  currentUser: User;
  isAdmin: boolean;
}

type TabType = 'dashboard' | 'leads' | 'customers' | 'interactions' | 'tasks';

export const CRM: React.FC<CRMProps> = ({ 
  customers, 
  setCustomers, 
  sales,
  tasks,
  setTasks,
  leads,
  setLeads,
  interactions,
  setInteractions,
  employees,
  currentUser,
  isAdmin 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Forms state
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [showAddInteractionForm, setShowAddInteractionForm] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  
  // New forms data
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'business' as 'business' | 'private',
    address: '',
    source: 'website',
    company: '',
  });

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    estimatedValue: 0,
    notes: '',
  });

  const [newInteraction, setNewInteraction] = useState({
    type: 'call' as InteractionType,
    subject: '',
    description: '',
    relatedTo: '',
    relatedType: 'lead' as 'lead' | 'customer',
    followUpRequired: false,
    followUpDate: '',
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    customerId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status)).length;
    const wonLeads = leads.filter(l => l.status === 'won').length;
    const lostLeads = leads.filter(l => l.status === 'lost').length;
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';
    
    const totalCustomers = customers.length;
    const businessCustomers = customers.filter(c => c.type === 'business').length;
    const privateCustomers = customers.filter(c => c.type === 'private').length;
    
    const totalValue = leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
    const wonValue = leads.filter(l => l.status === 'won').reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
    
    const totalInteractions = interactions.length;
    const thisMonthInteractions = interactions.filter(i => {
      const interactionDate = new Date(i.date);
      const now = new Date();
      return interactionDate.getMonth() === now.getMonth() && interactionDate.getFullYear() === now.getFullYear();
    }).length;
    
    const pendingFollowUps = interactions.filter(i => i.followUpRequired && i.followUpDate).length;
    
    const activeTasks = tasks.filter(t => t.status !== 'done').length;
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'done') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return {
      totalLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      totalCustomers,
      businessCustomers,
      privateCustomers,
      totalValue,
      wonValue,
      totalInteractions,
      thisMonthInteractions,
      pendingFollowUps,
      activeTasks,
      overdueTasks,
    };
  }, [leads, customers, interactions, tasks]);

  // CRUD Operations
  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert('Vul naam en email in!');
      return;
    }

    const customer: Customer = {
      id: `c${Date.now()}`,
      ...newCustomer,
      since: new Date().toISOString().split('T')[0],
    };

    setCustomers([...customers, customer]);
    setNewCustomer({ name: '', email: '', phone: '', type: 'business', address: '', source: 'website', company: '' });
    setShowAddCustomerForm(false);
  };

  const handleAddLead = () => {
    if (!newLead.name || !newLead.email) {
      alert('Vul naam en email in!');
      return;
    }

    const lead: Lead = {
      id: `l${Date.now()}`,
      ...newLead,
      status: 'new',
      createdDate: new Date().toISOString().split('T')[0],
    };

    setLeads([...leads, lead]);
    setNewLead({ name: '', email: '', phone: '', company: '', source: 'website', estimatedValue: 0, notes: '' });
    setShowAddLeadForm(false);
  };

  const handleAddInteraction = () => {
    if (!newInteraction.subject || !newInteraction.relatedTo) {
      alert('Vul onderwerp en gekoppelde entiteit in!');
      return;
    }

    const interaction: Interaction = {
      id: `int${Date.now()}`,
      type: newInteraction.type,
      subject: newInteraction.subject,
      description: newInteraction.description,
      date: new Date().toISOString(),
      employeeId: currentUser.employeeId,
      followUpRequired: newInteraction.followUpRequired,
      followUpDate: newInteraction.followUpDate || undefined,
      [newInteraction.relatedType === 'lead' ? 'leadId' : 'customerId']: newInteraction.relatedTo,
    };

    setInteractions([...interactions, interaction]);
    setNewInteraction({ 
      type: 'call', 
      subject: '', 
      description: '', 
      relatedTo: '', 
      relatedType: 'lead',
      followUpRequired: false,
      followUpDate: '',
    });
    setShowAddInteractionForm(false);
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      alert('Vul titel en deadline in!');
      return;
    }

    const task: Task = {
      id: `task${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      customerId: newTask.customerId || undefined,
      priority: newTask.priority,
      status: 'todo',
      dueDate: newTask.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', customerId: '', priority: 'medium', dueDate: '' });
    setShowAddTaskForm(false);
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const updates: Partial<Lead> = { status: newStatus };
        if (newStatus === 'won' || newStatus === 'lost') {
          updates.lastContactDate = new Date().toISOString().split('T')[0];
        }
        return { ...lead, ...updates };
      }
      return lead;
    }));
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const convertLeadToCustomer = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const customer: Customer = {
      id: `c${Date.now()}`,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      type: lead.company ? 'business' : 'private',
      company: lead.company,
      address: '',
      source: lead.source,
      since: new Date().toISOString().split('T')[0],
      notes: lead.notes,
    };

    setCustomers([...customers, customer]);
    updateLeadStatus(leadId, 'won');
    
    // Transfer lead interactions to customer
    setInteractions(interactions.map(int => {
      if (int.leadId === leadId) {
        return { ...int, customerId: customer.id, leadId: undefined };
      }
      return int;
    }));

    alert(`Lead "${lead.name}" succesvol geconverteerd naar klant!`);
  };

  const deleteCustomer = (id: string) => {
    if (confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const deleteLead = (id: string) => {
    if (confirm('Weet je zeker dat je deze lead wilt verwijderen?')) {
      setLeads(leads.filter(l => l.id !== id));
    }
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const getCustomerSales = (customerId: string) => {
    return sales.filter(s => s.customerId === customerId);
  };

  const getCustomerTotal = (customerId: string) => {
    return getCustomerSales(customerId).reduce((sum, sale) => sum + sale.total, 0);
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'Algemeen';
    return customers.find(c => c.id === customerId)?.name || 'Onbekend';
  };

  const getLeadName = (leadId?: string) => {
    if (!leadId) return 'Onbekend';
    return leads.find(l => l.id === leadId)?.name || 'Onbekend';
  };

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Onbekend';
    return employees.find(e => e.id === employeeId)?.name || 'Onbekend';
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800 border-gray-400';
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'qualified': return 'bg-indigo-100 text-indigo-800 border-indigo-400';
      case 'proposal': return 'bg-purple-100 text-purple-800 border-purple-400';
      case 'negotiation': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'won': return 'bg-green-100 text-green-800 border-green-400';
      case 'lost': return 'bg-red-100 text-red-800 border-red-400';
    }
  };

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'Nieuw';
      case 'contacted': return 'Contact gemaakt';
      case 'qualified': return 'Gekwalificeerd';
      case 'proposal': return 'Voorstel gedaan';
      case 'negotiation': return 'Onderhandeling';
      case 'won': return 'Gewonnen';
      case 'lost': return 'Verloren';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral">CRM - Klantrelatiebeheer</h1>
          <p className="text-gray-600 mt-1">Beheer leads, klanten, interacties en sales pipeline</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'leads'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🎯 Leads & Pipeline
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'customers'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          👥 Klanten
        </button>
        <button
          onClick={() => setActiveTab('interactions')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'interactions'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          💬 Interacties
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✓ Taken
        </button>
      </div>

      {/* Dashboard Tab - Part 1 will continue... */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Leads Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral">Leads</h3>
                <span className="text-3xl">🎯</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Totaal:</span>
                  <span className="text-2xl font-bold text-neutral">{dashboardStats.totalLeads}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Actief:</span>
                  <span className="font-semibold text-blue-600">{dashboardStats.activeLeads}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Gewonnen:</span>
                  <span className="font-semibold text-green-600">{dashboardStats.wonLeads}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Verloren:</span>
                  <span className="font-semibold text-red-600">{dashboardStats.lostLeads}</span>
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral">Conversie</h3>
                <span className="text-3xl">📈</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {dashboardStats.conversionRate}%
                </div>
                <p className="text-sm text-gray-600">Lead naar Klant</p>
                <div className="mt-4 text-xs text-gray-500">
                  €{dashboardStats.wonValue.toLocaleString()} gewonnen
                </div>
              </div>
            </div>

            {/* Customers Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral">Klanten</h3>
                <span className="text-3xl">👥</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Totaal:</span>
                  <span className="text-2xl font-bold text-neutral">{dashboardStats.totalCustomers}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Zakelijk:</span>
                  <span className="font-semibold text-purple-600">{dashboardStats.businessCustomers}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Particulier:</span>
                  <span className="font-semibold text-purple-600">{dashboardStats.privateCustomers}</span>
                </div>
              </div>
            </div>

            {/* Activities Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral">Activiteiten</h3>
                <span className="text-3xl">💬</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Interacties (maand):</span>
                  <span className="font-semibold text-orange-600">{dashboardStats.thisMonthInteractions}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Follow-ups:</span>
                  <span className="font-semibold text-yellow-600">{dashboardStats.pendingFollowUps}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Actieve taken:</span>
                  <span className="font-semibold text-blue-600">{dashboardStats.activeTasks}</span>
                </div>
                {dashboardStats.overdueTasks > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Verlopen:</span>
                    <span className="font-semibold text-red-600">{dashboardStats.overdueTasks}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pipeline Value */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral mb-4 flex items-center gap-2">
              <span>💰</span>
              Pipeline Waarde
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Totale Pipeline Waarde</div>
                <div className="text-3xl font-bold text-primary">
                  €{dashboardStats.totalValue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Gewonnen Waarde</div>
                <div className="text-3xl font-bold text-green-600">
                  €{dashboardStats.wonValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral mb-4">Recente Activiteiten</h3>
            <div className="space-y-3">
              {interactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(interaction => {
                  const relatedName = interaction.leadId 
                    ? getLeadName(interaction.leadId) 
                    : getCustomerName(interaction.customerId);
                  const interactionType = INTERACTION_TYPES.find(t => t.value === interaction.type);
                  
                  return (
                    <div key={interaction.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{interactionType?.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-neutral">{interaction.subject}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(interaction.date).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{interaction.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Met: {relatedName}</span>
                          <span>Door: {getEmployeeName(interaction.employeeId)}</span>
                          {interaction.followUpRequired && (
                            <span className="text-yellow-600 font-medium">
                              ⏰ Follow-up: {interaction.followUpDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

{/* Leads Tab - Will continue in next part... */}
{activeTab === 'leads' && (
        <div className="space-y-6">
          {/* Add Lead Button */}
          <div className="flex justify-end">
            {isAdmin && (
              <button
                onClick={() => setShowAddLeadForm(!showAddLeadForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Lead
              </button>
            )}
          </div>

          {/* Add Lead Form */}
          {showAddLeadForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">Nieuwe Lead Toevoegen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Naam *"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="tel"
                  placeholder="Telefoon"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Bedrijf"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LEAD_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Geschatte waarde (€)"
                  value={newLead.estimatedValue || ''}
                  onChange={(e) => setNewLead({ ...newLead, estimatedValue: parseFloat(e.target.value) || 0 })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Notities"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  rows={3}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddLead}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => setShowAddLeadForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Pipeline - Kanban Style */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map(status => {
              const leadsInStatus = getLeadsByStatus(status);
              const totalValue = leadsInStatus.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
              
              return (
                <div key={status} className={`rounded-lg p-4 min-h-[400px] ${getStatusColor(status)}`}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{getStatusLabel(status)}</h3>
                      <span className="px-2 py-1 bg-white bg-opacity-70 rounded-full text-xs font-bold">
                        {leadsInStatus.length}
                      </span>
                    </div>
                    {totalValue > 0 && (
                      <div className="text-xs font-medium opacity-80">
                        €{totalValue.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {leadsInStatus.map(lead => (
                      <div key={lead.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-neutral text-sm">{lead.name}</h4>
                          {isAdmin && status !== 'won' && status !== 'lost' && (
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                              title="Verwijderen"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        
                        {lead.company && (
                          <p className="text-xs text-gray-600 mb-2">{lead.company}</p>
                        )}
                        
                        {lead.estimatedValue && (
                          <p className="text-sm font-bold text-primary mb-2">
                            €{lead.estimatedValue.toLocaleString()}
                          </p>
                        )}
                        
                        <div className="space-y-1 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <span>📧</span>
                            <span className="truncate">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <span>📞</span>
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{lead.source}</span>
                          </div>
                        </div>

                        {lead.notes && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{lead.notes}</p>
                        )}

                        {lead.nextFollowUpDate && (
                          <div className="mb-3 text-xs">
                            <span className="text-yellow-600">⏰ Follow-up: {lead.nextFollowUpDate}</span>
                          </div>
                        )}

                        {/* Status Actions */}
                        {isAdmin && (
                          <div className="flex flex-col gap-2">
                            {status === 'new' && (
                              <button
                                onClick={() => updateLeadStatus(lead.id, 'contacted')}
                                className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                              >
                                → Gecontacteerd
                              </button>
                            )}
                            {status === 'contacted' && (
                              <button
                                onClick={() => updateLeadStatus(lead.id, 'qualified')}
                                className="w-full px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600"
                              >
                                → Gekwalificeerd
                              </button>
                            )}
                            {status === 'qualified' && (
                              <button
                                onClick={() => updateLeadStatus(lead.id, 'proposal')}
                                className="w-full px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                              >
                                → Voorstel
                              </button>
                            )}
                            {status === 'proposal' && (
                              <button
                                onClick={() => updateLeadStatus(lead.id, 'negotiation')}
                                className="w-full px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                              >
                                → Onderhandeling
                              </button>
                            )}
                            {['negotiation', 'proposal', 'qualified'].includes(status) && (
                              <>
                                <button
                                  onClick={() => convertLeadToCustomer(lead.id)}
                                  className="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                >
                                  ✓ Gewonnen
                                </button>
                                <button
                                  onClick={() => updateLeadStatus(lead.id, 'lost')}
                                  className="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  × Verloren
                                </button>
                              </>
                            )}
                          </div>
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

{/* Customers Tab */}
      {activeTab === 'customers' && (
        <>
          <div className="flex justify-end mb-6">
            {isAdmin && (
              <button
                onClick={() => setShowAddCustomerForm(!showAddCustomerForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Klant
              </button>
            )}
          </div>

          {/* Add Customer Form */}
          {showAddCustomerForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">Nieuwe Klant Toevoegen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Naam *"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="tel"
                  placeholder="Telefoon"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newCustomer.type}
                  onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value as any })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="business">Zakelijk</option>
                  <option value="private">Particulier</option>
                </select>
                <input
                  type="text"
                  placeholder="Bedrijf"
                  value={newCustomer.company}
                  onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newCustomer.source}
                  onChange={(e) => setNewCustomer({ ...newCustomer, source: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LEAD_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Adres"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddCustomer}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => setShowAddCustomerForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Customers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map(customer => {
              const customerSales = getCustomerSales(customer.id);
              const totalSpent = getCustomerTotal(customer.id);
              const customerInteractions = interactions.filter(i => i.customerId === customer.id);

              return (
                <div key={customer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral text-lg">{customer.name}</h3>
                        <p className="text-xs text-gray-500">
                          {customer.type === 'business' ? '🏢 Zakelijk' : '👤 Particulier'} • Sinds {customer.since}
                        </p>
                      </div>
                    </div>
                  </div>

                  {customer.company && (
                    <div className="mb-3 text-sm font-medium text-gray-700">
                      {customer.company}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700">{customer.phone}</span>
                    </div>
                    {customer.address && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700 text-xs truncate">{customer.address}</span>
                      </div>
                    )}
                    {customer.source && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 mr-2">📍</span>
                        <span className="text-gray-600 text-xs">Bron: {customer.source}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-xs text-gray-600">Omzet</div>
                        <div className="text-lg font-bold text-primary">€{totalSpent.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Orders</div>
                        <div className="text-lg font-bold text-neutral">{customerSales.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Contact</div>
                        <div className="text-lg font-bold text-blue-600">{customerInteractions.length}</div>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => deleteCustomer(customer.id)}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Verwijder Klant
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {customers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Geen klanten gevonden</p>
            </div>
          )}
        </>
      )}

      {/* Interactions Tab */}
      {activeTab === 'interactions' && (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddInteractionForm(!showAddInteractionForm)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              + Nieuwe Interactie
            </button>
          </div>

          {/* Add Interaction Form */}
          {showAddInteractionForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">Nieuwe Interactie Registreren</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newInteraction.type}
                  onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as InteractionType })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {INTERACTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Onderwerp *"
                  value={newInteraction.subject}
                  onChange={(e) => setNewInteraction({ ...newInteraction, subject: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newInteraction.relatedType}
                  onChange={(e) => setNewInteraction({ ...newInteraction, relatedType: e.target.value as any, relatedTo: '' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="lead">Lead</option>
                  <option value="customer">Klant</option>
                </select>
                <select
                  value={newInteraction.relatedTo}
                  onChange={(e) => setNewInteraction({ ...newInteraction, relatedTo: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer {newInteraction.relatedType === 'lead' ? 'lead' : 'klant'} *</option>
                  {newInteraction.relatedType === 'lead' ? (
                    leads.filter(l => !['won', 'lost'].includes(l.status)).map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name}</option>
                    ))
                  ) : (
                    customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  )}
                </select>
                <textarea
                  placeholder="Beschrijving"
                  value={newInteraction.description}
                  onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })}
                  rows={3}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
                <div className="col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newInteraction.followUpRequired}
                      onChange={(e) => setNewInteraction({ ...newInteraction, followUpRequired: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Follow-up vereist</span>
                  </label>
                  {newInteraction.followUpRequired && (
                    <input
                      type="date"
                      value={newInteraction.followUpDate}
                      onChange={(e) => setNewInteraction({ ...newInteraction, followUpDate: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddInteraction}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => setShowAddInteractionForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Interactions Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral mb-6">Interactie Geschiedenis</h3>
            <div className="space-y-4">
              {interactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(interaction => {
                  const relatedName = interaction.leadId 
                    ? getLeadName(interaction.leadId) 
                    : getCustomerName(interaction.customerId);
                  const interactionType = INTERACTION_TYPES.find(t => t.value === interaction.type);
                  
                  return (
                    <div key={interaction.id} className="flex gap-4 border-l-4 border-blue-400 pl-4 py-2">
                      <div className="flex-shrink-0">
                        <span className="text-3xl">{interactionType?.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-neutral">{interaction.subject}</h4>
                            <p className="text-sm text-gray-600 mt-1">{interactionType?.label}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(interaction.date).toLocaleString('nl-NL', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{interaction.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <span>👤</span>
                            {relatedName}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>💼</span>
                            {getEmployeeName(interaction.employeeId)}
                          </span>
                          {interaction.followUpRequired && (
                            <span className="flex items-center gap-1 text-yellow-600 font-medium">
                              <span>⏰</span>
                              Follow-up: {interaction.followUpDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            {interactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Geen interacties gevonden</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <>
          <div className="flex justify-end mb-6">
            {isAdmin && (
              <button
                onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Taak
              </button>
            )}
          </div>

          {/* Add Task Form */}
          {showAddTaskForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">Nieuwe Taak</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Titel *"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newTask.customerId}
                  onChange={(e) => setNewTask({ ...newTask, customerId: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Geen klant</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Laag</option>
                  <option value="medium">Gemiddeld</option>
                  <option value="high">Hoog</option>
                </select>
                <textarea
                  placeholder="Beschrijving"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddTask}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => setShowAddTaskForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => {
              const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date();
              
              return (
                <div key={task.id} className={`bg-white rounded-lg shadow-md p-6 ${
                  isOverdue ? 'border-l-4 border-red-500' : ''
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-neutral text-lg">{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'high' && 'Hoog'}
                      {task.priority === 'medium' && 'Gemiddeld'}
                      {task.priority === 'low' && 'Laag'}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Klant:</span>
                      <span className="font-medium text-neutral">{getCustomerName(task.customerId)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Deadline:</span>
                      <span className={`font-medium ${
                        isOverdue ? 'text-red-600' : 'text-neutral'
                      }`}>
                        {task.dueDate}
                        {isOverdue && ' ⚠️'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTaskStatusColor(task.status)}`}>
                        {task.status === 'todo' && 'Te doen'}
                        {task.status === 'in_progress' && 'Bezig'}
                        {task.status === 'done' && 'Klaar'}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      {task.status === 'todo' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'done')}
                          className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Voltooi
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Verwijder
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Geen taken gevonden</p>
            </div>
          )}
        </>
      )}

    </div>
  );
};