import React, { ReactNode } from 'react';
import { InventoryProvider } from './InventoryContext';
import { CustomerProvider } from './CustomerContext';
import { WorkOrderProvider } from './WorkOrderContext';
import { QuoteProvider } from './QuoteContext';
import { EmployeeProvider } from './EmployeeContext';
import { TransactionProvider } from './TransactionContext';
import { NotificationProvider } from './NotificationContext';
import { EmailProvider } from './EmailContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <NotificationProvider>
      <EmployeeProvider>
        <CustomerProvider>
          <InventoryProvider>
            <QuoteProvider>
              <TransactionProvider>
                <WorkOrderProvider>
                  <EmailProvider>
                    {children}
                  </EmailProvider>
                </WorkOrderProvider>
              </TransactionProvider>
            </QuoteProvider>
          </InventoryProvider>
        </CustomerProvider>
      </EmployeeProvider>
    </NotificationProvider>
  );
};
