import { 
  InventoryItem, 
  Product, 
  Sale, 
  WorkOrder, 
  Customer, 
  Employee, 
  Transaction,
  Quote,
  Invoice,
  Task,
  CalendarEvent,
  Notification,
  Lead,
  Interaction,
  Email,
  EmailTemplate
} from '../types';

export const MOCK_INVENTORY: InventoryItem[] = [
  { 
    id: '1', 
    name: 'Staal plaat', 
    sku: 'STL-001', 
    quantity: 150, 
    reorderLevel: 50, 
    supplier: 'Staal B.V.', 
    location: 'A1', 
    purchasePrice: 35.00,
    salePrice: 45.50,
    margin: 30.0,
    vatRate: '21',
    syncEnabled: false,
    unit: 'stuk',
    price: 45.50, // Legacy
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: '2', 
    name: 'Aluminium staaf', 
    sku: 'ALU-002', 
    quantity: 80, 
    reorderLevel: 30, 
    supplier: 'MetaalGigant', 
    location: 'A2', 
    purchasePrice: 20.00,
    salePrice: 28.75,
    margin: 43.75,
    vatRate: '21',
    syncEnabled: false,
    unit: 'meter',
    price: 28.75, // Legacy
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: '3', 
    name: 'Schroeven M8', 
    sku: 'SCH-003', 
    quantity: 5000, 
    reorderLevel: 1000, 
    supplier: 'Bouten & Co', 
    location: 'B1', 
    purchasePrice: 0.10,
    salePrice: 0.15,
    margin: 50.0,
    vatRate: '21',
    syncEnabled: true,
    unit: 'stuk',
    price: 0.15, // Legacy
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: '4', 
    name: 'Verfspuit', 
    sku: 'VRF-004', 
    quantity: 12, 
    reorderLevel: 5, 
    supplier: 'Verf Wereld', 
    location: 'C1', 
    purchasePrice: 180.00,
    salePrice: 245.00,
    margin: 36.11,
    vatRate: '21',
    syncEnabled: false,
    unit: 'stuk',
    price: 245.00, // Legacy
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: '5', 
    name: 'Lasstaaf', 
    sku: 'LAS-005', 
    quantity: 200, 
    reorderLevel: 50, 
    supplier: 'Las Totaal', 
    location: 'A3', 
    purchasePrice: 2.50,
    salePrice: 3.25,
    margin: 30.0,
    vatRate: '21',
    syncEnabled: false,
    unit: 'stuk',
    price: 3.25, // Legacy
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Metalen Frame', price: 125.00, inventoryItemId: '1' },
  { id: 'p2', name: 'Aluminium Behuizing', price: 89.50, inventoryItemId: '2' },
  { id: 'p3', name: 'Schroefset (100st)', price: 15.00, inventoryItemId: '3' },
  { id: 'p4', name: 'Verfspuit Professioneel', price: 245.00, inventoryItemId: '4' },
];

export const MOCK_SALES: Sale[] = [
  {
    id: 's1',
    items: [
      { id: 'p1', name: 'Metalen Frame', price: 125.00, inventoryItemId: '1', quantity: 2 },
      { id: 'p3', name: 'Schroefset (100st)', price: 15.00, inventoryItemId: '3', quantity: 5 },
    ],
    total: 325.00,
    customerId: 'c1',
    date: '2024-10-01',
  },
  {
    id: 's2',
    items: [
      { id: 'p2', name: 'Aluminium Behuizing', price: 89.50, inventoryItemId: '2', quantity: 3 },
    ],
    total: 268.50,
    customerId: 'c2',
    date: '2024-10-05',
  },
  {
    id: 's3',
    items: [
      { id: 'p4', name: 'Verfspuit Professioneel', price: 245.00, inventoryItemId: '4', quantity: 1 },
    ],
    total: 245.00,
    customerId: null,
    date: '2024-10-07',
  },
];

export const LEAD_SOURCES = [
  'website',
  'referral',
  'cold-call',
  'advertisement',
  'social-media',
  'trade-show',
  'email-campaign',
  'walk-in',
  'other'
];

export const INTERACTION_TYPES = [
  { value: 'call', label: 'Telefoongesprek', icon: '📞' },
  { value: 'email', label: 'E-mail', icon: '📧' },
  { value: 'meeting', label: 'Meeting', icon: '🤝' },
  { value: 'note', label: 'Notitie', icon: '📝' },
  { value: 'sms', label: 'SMS', icon: '💬' },
];

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1',
    title: 'Frame Assemblage',
    description: 'Assembleer 10 metalen frames voor order #1234',
    status: 'In Progress',
    assignedTo: 'e1',
    requiredInventory: [
      { itemId: '1', quantity: 20 },
      { itemId: '3', quantity: 200 },
    ],
    createdDate: '2024-09-28',
    customerId: 'c1',
    location: 'Werkplaats A',
    scheduledDate: '2024-10-10',
    hoursSpent: 4,
    notes: 'Lassen moet met precisie gebeuren'
  },
  {
    id: 'wo2',
    title: 'Lassen Constructie',
    description: 'Las werk voor industriële constructie',
    status: 'Pending',
    assignedTo: 'e2',
    requiredInventory: [
      { itemId: '5', quantity: 50 },
    ],
    createdDate: '2024-10-01',
    customerId: 'c3',
    location: 'Lasstation',
    scheduledDate: '2024-10-12',
    pendingReason: 'Wacht op levering extra lasstaaf',
  },
  {
    id: 'wo3',
    title: 'Verfwerk Behuizingen',
    description: 'Spuit 15 aluminium behuizingen',
    status: 'Completed',
    assignedTo: 'e3',
    requiredInventory: [
      { itemId: '2', quantity: 15 },
      { itemId: '4', quantity: 2 },
    ],
    createdDate: '2024-09-20',
    completedDate: '2024-09-25',
    customerId: 'c2',
    location: 'Spuitcabine',
    hoursSpent: 8,
  },
  {
    id: 'wo4',
    title: 'Schroefverbindingen controleren',
    description: 'Kwaliteitscontrole op alle schroefverbindingen van project #5678',
    status: 'To Do',
    assignedTo: 'e1',
    requiredInventory: [],
    createdDate: '2024-10-08',
    customerId: 'c1',
    location: 'Werkplaats B',
    scheduledDate: '2024-10-15',
  },
  {
    id: 'wo5',
    title: 'Nieuwe frame productie',
    description: 'Productie van 5 nieuwe metalen frames volgens tekening',
    status: 'To Do',
    assignedTo: 'e2',
    requiredInventory: [
      { itemId: '1', quantity: 10 },
      { itemId: '3', quantity: 100 },
    ],
    createdDate: '2024-10-09',
    customerId: 'c2',
    location: 'Werkplaats A',
    scheduledDate: '2024-10-16',
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { 
    id: 'c1', 
    name: 'TechBouw B.V.', 
    email: 'info@techbouw.nl', 
    phone: '020-1234567', 
    since: '2022-03-15',
    type: 'business',
    address: 'Techniekstraat 15, Amsterdam',
    notes: 'Vaste klant, altijd op tijd betalen',
    source: 'referral',
    company: 'TechBouw B.V.'
  },
  { 
    id: 'c2', 
    name: 'Industriaal Partners', 
    email: 'contact@industriaal.nl', 
    phone: '010-9876543', 
    since: '2023-01-10',
    type: 'business',
    address: 'Industrieweg 44, Rotterdam',
    source: 'website',
    company: 'Industriaal Partners'
  },
  { 
    id: 'c3', 
    name: 'Metaal Constructies', 
    email: 'sales@metaalcon.nl', 
    phone: '030-5555555', 
    since: '2021-11-22',
    type: 'business',
    address: 'Staalstraat 8, Utrecht',
    source: 'advertisement',
    company: 'Metaal Constructies'
  },
  { 
    id: 'c4', 
    name: 'Jan Jansen', 
    email: 'jan@email.nl', 
    phone: '06-11223344', 
    since: '2023-06-05',
    type: 'private',
    address: 'Dorpsstraat 12, Den Haag',
    source: 'walk-in'
  },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Emma van der Berg',
    email: 'emma@constructiebv.nl',
    phone: '06-11223344',
    company: 'Constructie B.V.',
    status: 'qualified',
    source: 'website',
    estimatedValue: 5000,
    notes: 'Geïnteresseerd in maandelijkse samenwerking voor meerdere projecten',
    createdDate: '2024-10-05',
    lastContactDate: '2024-10-08',
    nextFollowUpDate: '2024-10-12'
  },
  {
    id: 'l2',
    name: 'Thomas de Groot',
    email: 'thomas@innovatielab.nl',
    phone: '06-22334455',
    company: 'Innovatie Lab',
    status: 'proposal',
    source: 'referral',
    estimatedValue: 8500,
    notes: 'Offerte verstuurd voor prototype ontwikkeling',
    createdDate: '2024-09-28',
    lastContactDate: '2024-10-06',
    nextFollowUpDate: '2024-10-13'
  },
  {
    id: 'l3',
    name: 'Lisa Vermeulen',
    email: 'lisa@designstudio.nl',
    phone: '06-33445566',
    company: 'Design Studio',
    status: 'negotiation',
    source: 'cold-call',
    estimatedValue: 3200,
    notes: 'In onderhandeling over prijzen en levertijd',
    createdDate: '2024-09-20',
    lastContactDate: '2024-10-07',
    nextFollowUpDate: '2024-10-11'
  },
  {
    id: 'l4',
    name: 'Mark Hendriks',
    email: 'mark@bouwmaatschappij.nl',
    phone: '06-44556677',
    company: 'Bouwmaatschappij NL',
    status: 'new',
    source: 'advertisement',
    estimatedValue: 12000,
    notes: 'Contact opgenomen via LinkedIn advertentie',
    createdDate: '2024-10-09',
    nextFollowUpDate: '2024-10-11'
  },
  {
    id: 'l5',
    name: 'Sarah Bakker',
    email: 'sarah@projectbureau.nl',
    phone: '06-55667788',
    company: 'Projectbureau',
    status: 'contacted',
    source: 'website',
    estimatedValue: 6500,
    notes: 'Eerste telefoongesprek gehad, wacht op specificaties',
    createdDate: '2024-10-03',
    lastContactDate: '2024-10-04',
    nextFollowUpDate: '2024-10-10'
  },
  {
    id: 'l6',
    name: 'Kevin Smit',
    email: 'kevin@architecten.nl',
    phone: '06-66778899',
    company: 'Architecten & Co',
    status: 'lost',
    source: 'referral',
    estimatedValue: 4500,
    notes: 'Prijs te hoog, gekozen voor concurrent',
    createdDate: '2024-09-15',
    lastContactDate: '2024-09-30'
  },
];

export const MOCK_INTERACTIONS: Interaction[] = [
  {
    id: 'int1',
    leadId: 'l1',
    type: 'call',
    subject: 'Eerste kennismakingsgesprek',
    description: 'Telefoongesprek over behoeftes en mogelijke samenwerking. Emma is zeer geïnteresseerd.',
    date: '2024-10-08T10:30:00',
    employeeId: 'e4',
    followUpRequired: true,
    followUpDate: '2024-10-12'
  },
  {
    id: 'int2',
    leadId: 'l2',
    type: 'email',
    subject: 'Offerte verstuurd',
    description: 'Offerte voor prototype ontwikkeling verstuurd per email. Wacht op reactie.',
    date: '2024-10-06T14:15:00',
    employeeId: 'e4',
    followUpRequired: true,
    followUpDate: '2024-10-13'
  },
  {
    id: 'int3',
    customerId: 'c1',
    type: 'meeting',
    subject: 'Project bespreking',
    description: 'Bespreking nieuwe projecten voor Q4. Positief verlopen.',
    date: '2024-10-07T11:00:00',
    employeeId: 'e4',
    followUpRequired: false
  },
  {
    id: 'int4',
    leadId: 'l3',
    type: 'call',
    subject: 'Prijsonderhandeling',
    description: 'Telefoongesprek over prijsaanpassingen. Lisa vraagt om 10% korting.',
    date: '2024-10-07T15:30:00',
    employeeId: 'e4',
    followUpRequired: true,
    followUpDate: '2024-10-11'
  },
  {
    id: 'int5',
    customerId: 'c2',
    type: 'email',
    subject: 'Factuur verzonden',
    description: 'Factuur voor order #1235 verzonden. Betaling verwacht binnen 30 dagen.',
    date: '2024-10-05T16:45:00',
    followUpRequired: false
  },
  {
    id: 'int6',
    leadId: 'l4',
    type: 'note',
    subject: 'LinkedIn contact',
    description: 'Mark heeft gereageerd op advertentie. Wil graag meer informatie over onze diensten.',
    date: '2024-10-09T09:00:00',
    followUpRequired: true,
    followUpDate: '2024-10-11'
  },
  {
    id: 'int7',
    customerId: 'c3',
    type: 'meeting',
    subject: 'Kwartaal review',
    description: 'Review van geleverde diensten dit kwartaal. Zeer tevreden.',
    date: '2024-10-01T13:00:00',
    employeeId: 'e4',
    followUpRequired: false
  },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { 
    id: 'e1', 
    name: 'Jan de Vries', 
    role: 'Productiemedewerker', 
    email: 'jan@bedrijf.nl', 
    phone: '06-12345678', 
    hireDate: '2020-05-01',
    vacationDays: 25,
    usedVacationDays: 12,
    availability: 'available',
    password: '1234'
  },
  { 
    id: 'e2', 
    name: 'Maria Jansen', 
    role: 'Lasser', 
    email: 'maria@bedrijf.nl', 
    phone: '06-23456789', 
    hireDate: '2019-08-15',
    vacationDays: 25,
    usedVacationDays: 8,
    availability: 'available',
    password: '1234'
  },
  { 
    id: 'e3', 
    name: 'Peter Bakker', 
    role: 'Spuiter', 
    email: 'peter@bedrijf.nl', 
    phone: '06-34567890', 
    hireDate: '2021-02-20',
    vacationDays: 25,
    usedVacationDays: 15,
    availability: 'vacation',
    password: '1234'
  },
  { 
    id: 'e4', 
    name: 'Sophie van Dam', 
    role: 'Manager Productie', 
    email: 'sophie@bedrijf.nl', 
    phone: '06-45678901', 
    hireDate: '2018-11-10',
    vacationDays: 28,
    usedVacationDays: 10,
    availability: 'available',
    password: '1234'
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'income', description: 'Verkoop order #1234', amount: 325.00, date: '2024-10-01', relatedTo: 's1' },
  { id: 't2', type: 'expense', description: 'Inkoop staal', amount: -450.00, date: '2024-09-28' },
  { id: 't3', type: 'income', description: 'Verkoop order #1235', amount: 268.50, date: '2024-10-05', relatedTo: 's2' },
  { id: 't4', type: 'expense', description: 'Elektriciteit factuur', amount: -125.00, date: '2024-10-03' },
  { id: 't5', type: 'income', description: 'Verkoop order #1236', amount: 245.00, date: '2024-10-07', relatedTo: 's3' },
  { id: 't6', type: 'expense', description: 'Salarissen', amount: -5200.00, date: '2024-09-30' },
  { id: 't7', type: 'income', description: 'Offerte Q001 geaccepteerd', amount: 1500.00, date: '2024-10-08', relatedTo: 'q1' },
];

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'Q001',
    customerId: 'c1',
    items: [
      { inventoryItemId: '1', description: 'Staal plaat', quantity: 20, pricePerUnit: 45.50, total: 910.00 },
      { inventoryItemId: '3', description: 'Schroeven M8', quantity: 200, pricePerUnit: 0.15, total: 30.00 },
    ],
    labor: [
      { description: 'Montage en installatie', hours: 8, hourlyRate: 65.00, total: 520.00 }
    ],
    subtotal: 1460.00,
    vatRate: 21,
    vatAmount: 306.60,
    total: 1766.60,
    status: 'approved',
    createdDate: '2024-10-01',
    validUntil: '2024-10-31',
    notes: 'Inclusief transport'
  },
  {
    id: 'Q002',
    customerId: 'c2',
    items: [
      { inventoryItemId: '2', description: 'Aluminium staaf', quantity: 25, pricePerUnit: 28.75, total: 718.75 },
    ],
    labor: [
      { description: 'Zagen en afwerken', hours: 6, hourlyRate: 55.00, total: 330.00 }
    ],
    subtotal: 1048.75,
    vatRate: 21,
    vatAmount: 220.24,
    total: 1268.99,
    status: 'sent',
    createdDate: '2024-10-05',
    validUntil: '2024-11-05',
  },
  {
    id: 'Q003',
    customerId: 'c3',
    items: [
      { inventoryItemId: '5', description: 'Lasstaaf', quantity: 100, pricePerUnit: 3.25, total: 325.00 },
      { description: 'Extra materialen en verbruiksgoederen', quantity: 1, pricePerUnit: 175.00, total: 175.00 },
    ],
    labor: [
      { description: 'Laswerk industriële constructie', hours: 40, hourlyRate: 75.00, total: 3000.00 }
    ],
    subtotal: 3500.00,
    vatRate: 21,
    vatAmount: 735.00,
    total: 4235.00,
    status: 'draft',
    createdDate: '2024-10-08',
    validUntil: '2024-11-08',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task1',
    title: 'Follow-up offerte TechBouw',
    description: 'Bellen voor status offerte Q001',
    customerId: 'c1',
    priority: 'high',
    status: 'todo',
    dueDate: '2024-10-12',
    createdDate: '2024-10-08',
  },
  {
    id: 'task2',
    title: 'Materialen bestellen',
    description: 'Aluminium staaf bestellen bij MetaalGigant',
    employeeId: 'e4',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2024-10-10',
    createdDate: '2024-10-07',
  },
  {
    id: 'task3',
    title: 'Klantoverleg Metaal Constructies',
    description: 'Bespreken project planning en deadlines',
    customerId: 'c3',
    priority: 'high',
    status: 'todo',
    dueDate: '2024-10-15',
    createdDate: '2024-10-08',
  },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal1',
    title: 'Frame Assemblage - TechBouw',
    description: 'Werkorder wo1',
    start: '2024-10-10T09:00:00',
    end: '2024-10-10T17:00:00',
    type: 'workorder',
    relatedId: 'wo1',
    employeeId: 'e1',
    customerId: 'c1',
  },
  {
    id: 'cal2',
    title: 'Lassen Constructie',
    start: '2024-10-12T08:00:00',
    end: '2024-10-12T16:00:00',
    type: 'workorder',
    relatedId: 'wo2',
    employeeId: 'e2',
    customerId: 'c3',
  },
  {
    id: 'cal3',
    title: 'Vakantie Peter Bakker',
    start: '2024-10-14T00:00:00',
    end: '2024-10-20T23:59:59',
    type: 'vacation',
    employeeId: 'e3',
  },
  {
    id: 'cal4',
    title: 'Team Meeting',
    description: 'Wekelijkse productie bespreking',
    start: '2024-10-11T14:00:00',
    end: '2024-10-11T15:00:00',
    type: 'meeting',
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    type: 'warning',
    message: 'Verfspuit voorraad onder herbestel niveau (12/5)',
    date: '2024-10-08T10:30:00',
    read: false,
    relatedModule: 'inventory' as any,
    relatedId: '4',
  },
  {
    id: 'notif2',
    type: 'success',
    message: 'Offerte Q001 door TechBouw B.V. geaccepteerd',
    date: '2024-10-08T09:15:00',
    read: false,
    relatedModule: 'accounting' as any,
    relatedId: 'q1',
  },
  {
    id: 'notif3',
    type: 'info',
    message: 'Werkorder wo3 succesvol afgerond door Peter Bakker',
    date: '2024-10-07T16:45:00',
    read: true,
    relatedModule: 'work_orders' as any,
    relatedId: 'wo3',
  },
  {
    id: 'notif4',
    type: 'warning',
    message: 'Taak "Follow-up offerte TechBouw" vervalt over 4 dagen',
    date: '2024-10-08T08:00:00',
    read: false,
    relatedModule: 'crm' as any,
    relatedId: 'task1',
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: '2025-001',
    customerId: 'c1',
    quoteId: 'Q001',
    items: [
      { inventoryItemId: '1', description: 'Staal plaat', quantity: 20, pricePerUnit: 45.50, total: 910.00 },
      { inventoryItemId: '3', description: 'Schroeven M8', quantity: 200, pricePerUnit: 0.15, total: 30.00 },
    ],
    labor: [
      { description: 'Montage en installatie', hours: 8, hourlyRate: 65.00, total: 520.00 }
    ],
    subtotal: 1460.00,
    vatRate: 21,
    vatAmount: 306.60,
    total: 1766.60,
    status: 'paid',
    issueDate: '2024-10-08',
    dueDate: '2024-10-22',
    paidDate: '2024-10-15',
    notes: 'Inclusief transport',
    paymentTerms: '14 dagen'
  },
  {
    id: 'inv2',
    invoiceNumber: '2025-002',
    customerId: 'c2',
    items: [
      { inventoryItemId: '2', description: 'Aluminium staaf', quantity: 15, pricePerUnit: 28.75, total: 431.25 },
    ],
    labor: [
      { description: 'Zagen en afwerken', hours: 4, hourlyRate: 55.00, total: 220.00 }
    ],
    subtotal: 651.25,
    vatRate: 21,
    vatAmount: 136.76,
    total: 788.01,
    status: 'sent',
    issueDate: '2024-10-06',
    dueDate: '2024-11-06',
    paymentTerms: '30 dagen'
  },
  {
    id: 'inv3',
    invoiceNumber: '2025-003',
    customerId: 'c3',
    items: [
      { inventoryItemId: '5', description: 'Lasstaaf', quantity: 50, pricePerUnit: 3.25, total: 162.50 },
    ],
    labor: [
      { description: 'Laswerk reparatie', hours: 6, hourlyRate: 75.00, total: 450.00 }
    ],
    subtotal: 612.50,
    vatRate: 21,
    vatAmount: 128.63,
    total: 741.13,
    status: 'overdue',
    issueDate: '2024-09-15',
    dueDate: '2024-09-29',
    paymentTerms: '14 dagen',
    notes: 'Herinnering verstuurd'
  },
];

export const MOCK_EMAILS: Email[] = [
  {
    id: 'email1',
    from: 'klant@bedrijf.nl',
    to: ['info@jouwbedrijf.nl'],
    subject: 'Vraag over offerte #Q001',
    body: 'Beste team, ik heb een vraag over de offerte die jullie hebben gestuurd. Kunnen we hierover bellen?',
    status: 'received',
    priority: 'normal',
    receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customerId: 'c1',
    quoteId: 'Q001',
    employeeId: 'emp1',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'email2',
    from: 'info@jouwbedrijf.nl',
    to: ['nieuweklant@example.com'],
    subject: 'Offerte voor installatie',
    body: 'Beste, bijgevoegd vindt u onze offerte voor de installatie. Laat het weten als u vragen heeft.',
    status: 'sent',
    priority: 'normal',
    sentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    customerId: 'c2',
    quoteId: 'Q002',
    employeeId: 'emp1',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'email3',
    from: 'lead@potentie.nl',
    to: ['info@jouwbedrijf.nl'],
    subject: 'Vraag over jullie diensten',
    body: 'Hallo, ik ben geïnteresseerd in jullie diensten. Kunnen jullie mij meer informatie sturen?',
    status: 'received',
    priority: 'high',
    receivedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    leadId: 'l1',
    employeeId: 'emp1',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'email4',
    from: 'info@jouwbedrijf.nl',
    to: ['klant@bedrijf.nl'],
    subject: 'Factuur #2025-001',
    body: 'Beste klant, bijgevoegd vindt u de factuur voor de geleverde diensten. Betaaltermijn: 14 dagen.',
    status: 'sent',
    priority: 'normal',
    sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    customerId: 'c1',
    invoiceId: 'inv1',
    employeeId: 'emp1',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'template1',
    name: 'Offerte versturen',
    subject: 'Offerte {{quoteNumber}} - {{customerName}}',
    body: 'Beste {{customerName}},\n\nBijgevoegd vindt u onze offerte {{quoteNumber}} voor {{projectDescription}}.\n\nDeze offerte is geldig tot {{validUntil}}.\n\nLaat het weten als u vragen heeft.\n\nMet vriendelijke groet,\n{{employeeName}}',
    category: 'quote',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template2',
    name: 'Factuur versturen',
    subject: 'Factuur {{invoiceNumber}} - {{customerName}}',
    body: 'Beste {{customerName}},\n\nBijgevoegd vindt u factuur {{invoiceNumber}} voor een totaalbedrag van €{{totalAmount}}.\n\nBetaaltermijn: {{paymentTerms}}.\n\nMet vriendelijke groet,\n{{employeeName}}',
    category: 'invoice',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template3',
    name: 'Follow-up na offerte',
    subject: 'Vervolg op offerte {{quoteNumber}}',
    body: 'Beste {{customerName}},\n\nIk wilde even contact opnemen over de offerte {{quoteNumber}} die we hebben gestuurd.\n\nHeeft u nog vragen of kunnen we u ergens mee helpen?\n\nMet vriendelijke groet,\n{{employeeName}}',
    category: 'followup',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];