import React from 'react';
import { CacheLifeProfile } from '@/lib/utils/cacheUtils';

interface CacheBoxProps {
  children: React.ReactNode;
  profile?: CacheLifeProfile;
  tags?: string[];
}

/**
 * CacheBox is a reusable Next.js Server Component for managing server-side caching.
 * Currently using stable patterns while experimental 'use cache' matures.
 */
export async function CacheBox({ 
  children, 
  profile = 'STANDARD', 
  tags = [] 
}: CacheBoxProps) {
  // Stability Note: 'use cache' and 'cacheLife' are currently disabled due to 
  // experimental framework instability in dev mode. 
  return <>{children}</>;
}
