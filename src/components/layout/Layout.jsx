import React from 'react';

export default function Layout({ children }) {
  return (
    <main className="main-content" style={{ fontFamily: 'inherit' }}>
      {children}
    </main>
  );
}
