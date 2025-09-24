/**
 * Client-Only Component Wrapper
 * Prevents hydration mismatches by only rendering children on the client side
 */

import { useState, useEffect } from 'react';

const ClientOnly = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
};

export default ClientOnly;
