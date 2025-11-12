import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.5rem'
    }}>
      <div>⏳ Loading...</div>
    </div>
  );
};

export const PageLoadingFallback: React.FC<{ pageName?: string }> = ({ pageName }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      fontSize: '1.2rem',
      color: '#666'
    }}>
      <div>Loading {pageName || 'page'}...</div>
    </div>
  );
};
