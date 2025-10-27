
import { Module, ModuleKey } from './types';
import {
  DashboardIcon,
  InventoryIcon,
  POSIcon,
  WorkOrdersIcon,
  AccountingIcon,
  CRMIcon,
  HRMIcon,
  ReportsIcon,
  PlanningIcon,
  AdminIcon,
} from './components/icons/IconComponents';

export const ALL_MODULES: Module[] = [
  { 
    id: ModuleKey.DASHBOARD, 
    name: 'Dashboard', 
    description: 'Centraal overzicht van uw bedrijfsactiviteiten.', 
    icon: DashboardIcon 
  },
  { 
    id: ModuleKey.INVENTORY, 
    name: 'Voorraadbeheer', 
    description: 'Beheer grondstoffen, halffabricaten en eindproducten.',
    icon: InventoryIcon 
  },
  { 
    id: ModuleKey.POS, 
    name: 'Kassasysteem (POS)', 
    description: 'Verwerk betalingen en registreer verkopen.',
    icon: POSIcon
  },
  { 
    id: ModuleKey.WORK_ORDERS, 
    name: 'Werkorders',
    description: 'Stroomlijn productieprocessen en monitor de voortgang.',
    icon: WorkOrdersIcon 
  },
  { 
    id: ModuleKey.ACCOUNTING, 
    name: 'Boekhouding & Offertes', 
    description: 'Genereer offertes, facturen en beheer financiële gegevens.',
    icon: AccountingIcon
  },
  { 
    id: ModuleKey.CRM, 
    name: 'Klantenbeheer (CRM)',
    description: 'Beheer klantgegevens, taken en verkoopkansen.',
    icon: CRMIcon
  },
  { 
    id: ModuleKey.HRM, 
    name: 'Personeelsbeheer (HRM)', 
    description: 'Beheer medewerkers, verlof en prestaties.',
    icon: HRMIcon
  },
  {
    id: ModuleKey.PLANNING,
    name: 'Planning & Agenda',
    description: 'Plan werkzaamheden, afspraken en monitor deadlines.',
    icon: PlanningIcon
  },
  { 
    id: ModuleKey.REPORTS, 
    name: 'Rapportages', 
    description: 'Genereer rapporten en analyseer bedrijfsprestaties.',
    icon: ReportsIcon
  },
];

export const ADMIN_MODULE: Module = {
  id: ModuleKey.ADMIN_SETTINGS,
  name: 'Admin Instellingen',
  description: 'Beheer de actieve modules voor alle gebruikers.',
  icon: AdminIcon,
};

export const MODULE_DATA: Record<ModuleKey, Module> = 
  [...ALL_MODULES, ADMIN_MODULE].reduce((acc, module) => {
    acc[module.id] = module;
    return acc;
  }, {} as Record<ModuleKey, Module>);