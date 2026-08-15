import React from 'react';

export const Component = () => {
  return (
    <main className="hero-section relative w-full h-screen overflow-hidden flex items-center justify-center">
      <div className="liquid-shape shape-1" />
      <div className="liquid-shape shape-2" />
      <div className="liquid-shape shape-3" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.25),_transparent_55%)]" />
      <div className="relative z-10 text-center p-8 max-w-2xl" />
    </main>
  );
};
