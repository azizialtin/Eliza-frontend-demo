// Accessibility Utilities
// Helper functions for accessibility features

/**
 * Announce message to screen readers using ARIA live region
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const liveRegion = document.getElementById('aria-live-region');
  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
};

/**
 * Create ARIA live region if it doesn't exist
 */
export const initializeAriaLiveRegion = () => {
  if (!document.getElementById('aria-live-region')) {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }
};

/**
 * Trap focus within a modal or dialog
 */
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstFocusable?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Get readable label for content type
 */
export const getContentTypeLabel = (contentType: string): string => {
  const labels: Record<string, string> = {
    'INTRO': 'Introduction section',
    'CONCEPT': 'Concept explanation',
    'SUMMARY': 'Summary section',
    'TEXT': 'Text content',
    'VIDEO': 'Video content',
    'IMAGE': 'Image content',
    'PRACTICE': 'Practice exercise',
    'CTA': 'Call to action',
    'STUDENT_EXTRA': 'Personalized content',
  };
  return labels[contentType] || 'Content section';
};

/**
 * Format time for screen readers
 */
export const formatTimeForScreenReader = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds} seconds`;
  }
  if (remainingSeconds === 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and ${remainingSeconds} seconds`;
};

/**
 * Format percentage for screen readers
 */
export const formatPercentageForScreenReader = (percentage: number): string => {
  return `${Math.round(percentage)} percent`;
};

/**
 * Get color contrast ratio
 */
export const getContrastRatio = (foreground: string, background: string): number => {
  // Simplified contrast calculation
  // In production, use a proper color contrast library
  return 4.5; // Placeholder - assumes WCAG AA compliance
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReaders = (element: HTMLElement): boolean => {
  return !element.hasAttribute('aria-hidden') || element.getAttribute('aria-hidden') === 'false';
};

/**
 * Skip to main content
 */
export const skipToMainContent = () => {
  const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
  if (mainContent instanceof HTMLElement) {
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Skip to navigation
 */
export const skipToNavigation = () => {
  const navigation = document.querySelector('nav') || document.querySelector('[role="navigation"]');
  if (navigation instanceof HTMLElement) {
    const firstLink = navigation.querySelector('a, button');
    if (firstLink instanceof HTMLElement) {
      firstLink.focus();
    }
  }
};
