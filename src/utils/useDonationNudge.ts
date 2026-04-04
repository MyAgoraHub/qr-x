import { useState, useCallback } from 'react';
import { incrementActionCount } from './storage';

/**
 * Hook that tracks scan/generate actions and signals when the donation
 * screen should be shown (every 10 actions, unless user has acknowledged).
 *
 * Usage:
 *   const { showDonationNudge, onNudgeDismissed } = useDonationNudge();
 *   // After each scan/generate:
 *   await trackAction();
 *   // Render donation modal when showDonationNudge is true
 */
export function useDonationNudge() {
  const [showDonationNudge, setShowDonationNudge] = useState(false);

  const trackAction = useCallback(async () => {
    const shouldShow = await incrementActionCount();
    if (shouldShow) {
      setShowDonationNudge(true);
    }
  }, []);

  const onNudgeDismissed = useCallback(() => {
    setShowDonationNudge(false);
  }, []);

  return { showDonationNudge, trackAction, onNudgeDismissed };
}
