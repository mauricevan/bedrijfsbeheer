import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Email, EmailTemplate } from '../types';
import { MOCK_EMAILS, MOCK_EMAIL_TEMPLATES } from '../data/mockData';

interface EmailContextType {
  emails: Email[];
  emailTemplates: EmailTemplate[];
  setEmails: (emails: Email[]) => void;
  setEmailTemplates: (templates: EmailTemplate[]) => void;
  addEmail: (email: Email) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  deleteEmail: (id: string) => void;
  addEmailTemplate: (template: EmailTemplate) => void;
  updateEmailTemplate: (id: string, updates: Partial<EmailTemplate>) => void;
  deleteEmailTemplate: (id: string) => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(MOCK_EMAIL_TEMPLATES);

  const addEmail = useCallback((email: Email) => {
    setEmails(prev => [...prev, email]);
  }, []);

  const updateEmail = useCallback((id: string, updates: Partial<Email>) => {
    setEmails(prev => prev.map(email =>
      email.id === id ? { ...email, ...updates } : email
    ));
  }, []);

  const deleteEmail = useCallback((id: string) => {
    setEmails(prev => prev.filter(email => email.id !== id));
  }, []);

  const addEmailTemplate = useCallback((template: EmailTemplate) => {
    setEmailTemplates(prev => [...prev, template]);
  }, []);

  const updateEmailTemplate = useCallback((id: string, updates: Partial<EmailTemplate>) => {
    setEmailTemplates(prev => prev.map(template =>
      template.id === id ? { ...template, ...updates } : template
    ));
  }, []);

  const deleteEmailTemplate = useCallback((id: string) => {
    setEmailTemplates(prev => prev.filter(template => template.id !== id));
  }, []);

  const value = {
    emails,
    emailTemplates,
    setEmails,
    setEmailTemplates,
    addEmail,
    updateEmail,
    deleteEmail,
    addEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within EmailProvider');
  }
  return context;
};
