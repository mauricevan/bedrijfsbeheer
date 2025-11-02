/**
 * Permission utilities
 * Helper functies om te checken of een gebruiker specifieke rechten heeft
 */

import { Permission, User, Employee } from '../types';

/**
 * Checkt of een user een specifieke permission heeft
 * Als user full_admin heeft, heeft hij/zij automatisch alle rechten
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  
  // Als user volledige admin rechten heeft, heeft hij/zij alle permissions
  if (user.isAdmin || user.permissions?.includes('full_admin')) {
    return true;
  }

  // Check of user de specifieke permission heeft
  return user.permissions?.includes(permission) || false;
}

/**
 * Checkt of een user meerdere permissions heeft (OR logica)
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Checkt of een user alle opgegeven permissions heeft (AND logica)
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Haalt alle beschikbare permissions op
 */
export function getAllPermissions(): { value: Permission; label: string; description: string }[] {
  return [
    {
      value: 'full_admin',
      label: 'Volledige Admin Rechten',
      description: 'Alle rechten - geeft automatisch toegang tot alle functionaliteiten'
    },
    {
      value: 'manage_modules',
      label: 'Modules Beheren',
      description: 'Modules in- en uitschakelen (Admin Instellingen)'
    },
    {
      value: 'manage_inventory',
      label: 'Voorraad Beheren',
      description: 'Voorraaditems toevoegen, bewerken en verwijderen'
    },
    {
      value: 'manage_crm',
      label: 'CRM Beheren',
      description: 'Klanten, leads en taken toevoegen, bewerken en verwijderen'
    },
    {
      value: 'manage_accounting',
      label: 'Boekhouding Beheren',
      description: 'Facturen en offertes aanmaken, bewerken en beheren'
    },
    {
      value: 'manage_workorders',
      label: 'Werkorders Beheren',
      description: 'Werkorders aanmaken, toewijzen en beheren'
    },
    {
      value: 'manage_employees',
      label: 'Medewerkers Beheren',
      description: 'Medewerkers toevoegen, bewerken en rechten toewijzen'
    },
    {
      value: 'view_all_workorders',
      label: 'Alle Werkorders Zien',
      description: 'Werkorders van alle medewerkers bekijken (niet alleen eigen)'
    },
    {
      value: 'view_reports',
      label: 'Rapportages',
      description: 'Volledige bedrijfsrapportages en analyses bekijken'
    },
    {
      value: 'manage_planning',
      label: 'Planning Beheren',
      description: 'Planning en agenda beheren'
    },
    {
      value: 'manage_pos',
      label: 'Kassasysteem Beheren',
      description: 'Kassasysteem (POS) beheren'
    }
  ];
}

/**
 * Zet Employee permissions om naar User permissions
 */
export function employeeToUserPermissions(employee: Employee): Permission[] {
  // Als isAdmin true is, voeg full_admin toe
  if (employee.isAdmin) {
    return ['full_admin'];
  }
  // Anders gebruik de permissions array
  return employee.permissions || [];
}

