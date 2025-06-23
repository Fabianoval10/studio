"use client";

import { useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

const Portal = ({ children }: PortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Return null on the server or until the component is mounted on the client
  if (typeof window === "undefined" || !mounted) {
    return null;
  }
  
  const element = document.body;
  return createPortal(children, element);
};

export default Portal;
