/**
 * Voorbeeld CSV Generator
 * 
 * Genereert voorbeeld CSV bestanden voor verschillende modules
 * Gebruikers kunnen deze downloaden als template
 */

import { generateCSV, downloadCSV } from './csvParser';
import type { InventoryItem, Customer, Employee, WorkOrder } from '../types';

// ==================== INVENTORYVOORBEELD ====================

export function downloadInventoryExampleCSV(): void {
  const exampleData = [
    {
      naam: 'Staal Plaat 1000x1000mm',
      supplierSku: 'SP-1000',
      customSku: 'STAAL-001',
      locatie: 'Rek A1',
      hoeveelheid: '50',
      eenheid: 'stuk',
      minStock: '10',
      leverancier: 'Staal Groothandel BV',
      categorie: 'Metaal',
      verkoopprijs: '45.50',
      inkoopprijs: '30.00',
      notities: 'Standaard plaatmateriaal',
    },
    {
      naam: 'Boutset M8x50 (100st)',
      supplierSku: 'BS-M8-50',
      customSku: 'BOUT-008',
      locatie: 'Lade B12',
      hoeveelheid: '25',
      eenheid: 'doos',
      minStock: '5',
      leverancier: 'Bouten.nl',
      categorie: 'Bevestigingsmateriaal',
      verkoopprijs: '12.95',
      inkoopprijs: '8.50',
      notities: 'Per doos 100 stuks',
    },
    {
      naam: 'Coating Verf RAL 9016',
      supplierSku: 'VERF-9016',
      customSku: 'VERF-001',
      locatie: 'Kast C3',
      hoeveelheid: '15',
      eenheid: 'liter',
      minStock: '3',
      leverancier: 'Verfspecialist',
      categorie: 'Verven',
      verkoopprijs: '28.00',
      inkoopprijs: '18.50',
      notities: 'Verkeerswit, hoogglans',
    },
  ];

  const headers = [
    { key: 'naam' as const, label: 'Naam' },
    { key: 'supplierSku' as const, label: 'SKU Leverancier' },
    { key: 'customSku' as const, label: 'Aangepaste SKU' },
    { key: 'locatie' as const, label: 'Locatie' },
    { key: 'hoeveelheid' as const, label: 'Hoeveelheid' },
    { key: 'eenheid' as const, label: 'Eenheid' },
    { key: 'minStock' as const, label: 'Minimum Voorraad' },
    { key: 'leverancier' as const, label: 'Leverancier' },
    { key: 'categorie' as const, label: 'Categorie' },
    { key: 'verkoopprijs' as const, label: 'Verkoopprijs (€)' },
    { key: 'inkoopprijs' as const, label: 'Inkoopprijs (€)' },
    { key: 'notities' as const, label: 'Notities' },
  ];

  const csvContent = generateCSV(exampleData, headers);
  downloadCSV(csvContent, 'voorbeeld_voorraad.csv');
}

// ==================== CUSTOMERVOORBEELD ====================

export function downloadCustomerExampleCSV(): void {
  const exampleData = [
    {
      naam: 'Jan de Vries',
      email: 'jan@example.com',
      telefoon: '0612345678',
      type: 'particulier',
      bedrijf: '',
      adres: 'Hoofdstraat 123',
      postcode: '1234AB',
      plaats: 'Amsterdam',
      herkomst: 'website',
      notities: 'Vaste klant sinds 2020',
    },
    {
      naam: 'Pietersen Metaalbewerking',
      email: 'info@pietersen.nl',
      telefoon: '0201234567',
      type: 'zakelijk',
      bedrijf: 'Pietersen Metaalbewerking BV',
      adres: 'Industrieweg 45',
      postcode: '3456CD',
      plaats: 'Rotterdam',
      herkomst: 'referral',
      notities: 'Grote orders, netto 30 dagen',
    },
    {
      naam: 'Maria Jansen',
      email: 'maria@example.com',
      telefoon: '0687654321',
      type: 'particulier',
      bedrijf: '',
      adres: 'Laan 78',
      postcode: '5678EF',
      plaats: 'Utrecht',
      herkomst: 'advertisement',
      notities: 'Interesse in custom meubels',
    },
  ];

  const headers = [
    { key: 'naam' as const, label: 'Naam' },
    { key: 'email' as const, label: 'Email' },
    { key: 'telefoon' as const, label: 'Telefoon' },
    { key: 'type' as const, label: 'Type (particulier/zakelijk)' },
    { key: 'bedrijf' as const, label: 'Bedrijfsnaam' },
    { key: 'adres' as const, label: 'Adres' },
    { key: 'postcode' as const, label: 'Postcode' },
    { key: 'plaats' as const, label: 'Plaats' },
    { key: 'herkomst' as const, label: 'Herkomst' },
    { key: 'notities' as const, label: 'Notities' },
  ];

  const csvContent = generateCSV(exampleData, headers);
  downloadCSV(csvContent, 'voorbeeld_klanten.csv');
}

// ==================== EMPLOYEEVOORBEELD ====================

export function downloadEmployeeExampleCSV(): void {
  const exampleData = [
    {
      naam: 'Peter Bakker',
      email: 'peter@bedrijf.nl',
      telefoon: '0612345678',
      functie: 'Lasser',
      wachtwoord: 'TempPass123!',
      isAdmin: 'nee',
      verlofdagen: '25',
      gebruikteVerlof: '0',
      beschikbaarheid: 'available',
    },
    {
      naam: 'Sophie van Dam',
      email: 'sophie@bedrijf.nl',
      telefoon: '0687654321',
      functie: 'Manager Productie',
      wachtwoord: 'AdminPass456!',
      isAdmin: 'ja',
      verlofdagen: '25',
      gebruikteVerlof: '5',
      beschikbaarheid: 'available',
    },
    {
      naam: 'Tom de Groot',
      email: 'tom@bedrijf.nl',
      telefoon: '0698765432',
      functie: 'Monteur',
      wachtwoord: 'TempPass789!',
      isAdmin: 'nee',
      verlofdagen: '20',
      gebruikteVerlof: '3',
      beschikbaarheid: 'available',
    },
  ];

  const headers = [
    { key: 'naam' as const, label: 'Naam' },
    { key: 'email' as const, label: 'Email' },
    { key: 'telefoon' as const, label: 'Telefoon' },
    { key: 'functie' as const, label: 'Functie' },
    { key: 'wachtwoord' as const, label: 'Wachtwoord' },
    { key: 'isAdmin' as const, label: 'Admin (ja/nee)' },
    { key: 'verlofdagen' as const, label: 'Verlofdagen' },
    { key: 'gebruikteVerlof' as const, label: 'Gebruikte Verlofdagen' },
    { key: 'beschikbaarheid' as const, label: 'Beschikbaarheid' },
  ];

  const csvContent = generateCSV(exampleData, headers);
  downloadCSV(csvContent, 'voorbeeld_medewerkers.csv');
}

// ==================== WERKORDER VOORBEELD ====================

export function downloadWorkOrderExampleCSV(): void {
  const exampleData = [
    {
      titel: 'Laswerk stalen constructie',
      beschrijving: 'Lassen van stalen frame volgens tekening TK-2024-001',
      klant: 'Pietersen Metaalbewerking',
      toegewezen: 'Maria Jansen',
      locatie: 'Werkplaats Hal 2',
      geplannedatum: '2025-01-15',
      geschatteuren: '8',
      status: 'To Do',
      materialen: 'Staal Plaat 1000x1000mm (10); Boutset M8x50 (2)',
      notities: 'Klant heeft haast, prioriteit hoog',
    },
    {
      titel: 'Spuitwerk kleur RAL 9016',
      beschrijving: 'Spuiten van metalen onderdelen in verkeerswit',
      klant: 'Jan de Vries',
      toegewezen: 'Peter Bakker',
      locatie: 'Spuitcabine',
      geplannedatum: '2025-01-16',
      geschatteuren: '4',
      status: 'To Do',
      materialen: 'Coating Verf RAL 9016 (5)',
      notities: 'Voorbehandeling reeds gedaan',
    },
    {
      titel: 'Montage metalen hek',
      beschrijving: 'Montage van 20 meter hekwerk op locatie klant',
      klant: 'Maria Jansen',
      toegewezen: 'Jan de Vries',
      locatie: 'Klant locatie - Utrecht',
      geplannedatum: '2025-01-17',
      geschatteuren: '12',
      status: 'To Do',
      materialen: 'Boutset M8x50 (5)',
      notities: 'Gereedschap meenemen voor op locatie',
    },
  ];

  const headers = [
    { key: 'titel' as const, label: 'Titel' },
    { key: 'beschrijving' as const, label: 'Beschrijving' },
    { key: 'klant' as const, label: 'Klantnaam' },
    { key: 'toegewezen' as const, label: 'Toegewezen Aan' },
    { key: 'locatie' as const, label: 'Locatie' },
    { key: 'geplannedatum' as const, label: 'Geplande Datum (YYYY-MM-DD)' },
    { key: 'geschatteuren' as const, label: 'Geschatte Uren' },
    { key: 'status' as const, label: 'Status' },
    { key: 'materialen' as const, label: 'Materialen (Item (aantal); Item (aantal))' },
    { key: 'notities' as const, label: 'Notities' },
  ];

  const csvContent = generateCSV(exampleData, headers);
  downloadCSV(csvContent, 'voorbeeld_werkorders.csv');
}

// ==================== ALGEMENE DOWNLOAD FUNCTIE ====================

export interface CSVExampleType {
  key: 'inventory' | 'customer' | 'employee' | 'workorder';
  label: string;
  description: string;
  downloadFunction: () => void;
}

export const csvExampleTypes: CSVExampleType[] = [
  {
    key: 'inventory',
    label: 'Voorraad Items',
    description: 'Voorbeeld CSV voor het importeren van voorraad items',
    downloadFunction: downloadInventoryExampleCSV,
  },
  {
    key: 'customer',
    label: 'Klanten',
    description: 'Voorbeeld CSV voor het importeren van klanten',
    downloadFunction: downloadCustomerExampleCSV,
  },
  {
    key: 'employee',
    label: 'Medewerkers',
    description: 'Voorbeeld CSV voor het importeren van medewerkers',
    downloadFunction: downloadEmployeeExampleCSV,
  },
  {
    key: 'workorder',
    label: 'Werkorders',
    description: 'Voorbeeld CSV voor het importeren van werkorders',
    downloadFunction: downloadWorkOrderExampleCSV,
  },
];
