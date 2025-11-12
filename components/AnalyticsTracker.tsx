import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackNavigation } from '../utils/analytics';
import { ModuleKey } from '../types';

interface AnalyticsTrackerProps {
  userId: string;
  userRole: string;
}

// Helper to convert route path to ModuleKey
const pathToModuleKey = (path: string): ModuleKey | null => {
  const cleanPath = path.replace('/', '').trim();
  if (!cleanPath) return ModuleKey.DASHBOARD;
  
  // Try to match with ModuleKey enum
  const moduleKeys = Object.values(ModuleKey);
  const matched = moduleKeys.find(key => key === cleanPath);
  return matched || null;
};

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ userId, userRole }) => {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);
  const sessionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const currentPath = location.pathname;
    const currentModule = pathToModuleKey(currentPath);
    
    if (!currentModule) return;

    const prevPath = prevPathRef.current;
    const prevModule = prevPath ? pathToModuleKey(prevPath) : null;

    if (prevModule !== currentModule) {
      // Calculate duration in current module (if we were in a module before)
      const duration = prevModule ? Date.now() - sessionStartTime.current : undefined;

      // Track navigation
      trackNavigation(
        userId,
        userRole,
        prevModule,
        currentModule,
        duration
      );

      // Update session start time
      sessionStartTime.current = Date.now();
      prevPathRef.current = currentPath;
    }
  }, [location.pathname, userId, userRole]);

  // Track initial navigation
  useEffect(() => {
    const currentModule = pathToModuleKey(location.pathname);
    if (currentModule && !prevPathRef.current) {
      trackNavigation(userId, userRole, null, currentModule);
      prevPathRef.current = location.pathname;
      sessionStartTime.current = Date.now();
    }
  }, [location.pathname, userId, userRole]);

  return null; // This component doesn't render anything
};

