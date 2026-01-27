/**
 * Utility functions for deadline calculations and benefit amount parsing
 */

type TranslationFn = (en: string, hi?: string, ta?: string, te?: string) => string;

/**
 * Calculate days until deadline from a date string
 * @param deadline - Date string in various formats (e.g., "March 31, 2025", "2025-03-31", "31/03/2025")
 * @returns Number of days until deadline (negative if past)
 */
export function getDaysUntilDeadline(deadline: string): number {
  const deadlineDate = parseDeadlineDate(deadline);
  if (!deadlineDate) return 999; // Unknown deadline, treat as far away

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Parse various deadline date formats
 */
function parseDeadlineDate(deadline: string): Date | null {
  if (!deadline) return null;

  // Try standard Date parsing first
  const date = new Date(deadline);
  if (!isNaN(date.getTime())) return date;

  // Handle "DD/MM/YYYY" format
  const ddmmyyyy = deadline.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
  }

  // Handle "Month Day, Year" format (e.g., "March 31, 2025")
  const monthDayYear = deadline.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monthDayYear) {
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                        'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIndex = monthNames.indexOf(monthDayYear[1].toLowerCase());
    if (monthIndex !== -1) {
      return new Date(parseInt(monthDayYear[3]), monthIndex, parseInt(monthDayYear[2]));
    }
  }

  return null;
}

/**
 * Get deadline status for color coding
 */
export type DeadlineStatus = 'urgent' | 'closing' | 'open' | 'closed';

export function getDeadlineStatus(deadline: string): DeadlineStatus {
  const days = getDaysUntilDeadline(deadline);

  if (days < 0) return 'closed';
  if (days <= 3) return 'urgent';
  if (days <= 14) return 'closing';
  return 'open';
}

/**
 * Format deadline for display with urgency indicator
 */
export function formatDeadlineDisplay(deadline: string, t: TranslationFn): string {
  const days = getDaysUntilDeadline(deadline);

  if (days < 0) {
    return t('Closed', 'बंद', 'மூடப்பட்டது', 'మూసివేయబడింది');
  }
  if (days === 0) {
    return t('Today!', 'आज!', 'இன்று!', 'ఈ రోజు!');
  }
  if (days === 1) {
    return t('1 day left', '1 दिन बाकी', '1 நாள் மீதம்', '1 రోజు మిగిలింది');
  }
  if (days <= 7) {
    return t(`${days} days left`, `${days} दिन बाकी`, `${days} நாட்கள் மீதம்`, `${days} రోజులు మిగిలాయి`);
  }
  if (days <= 30) {
    const weeks = Math.floor(days / 7);
    if (weeks === 1) {
      return t('~1 week left', '~1 सप्ताह बाकी', '~1 வாரம் மீதம்', '~1 వారం మిగిలింది');
    }
    return t(`~${weeks} weeks left`, `~${weeks} सप्ताह बाकी`, `~${weeks} வாரங்கள் மீதம்`, `~${weeks} వారాలు మిగిలాయి`);
  }

  // For dates far in the future, show the actual date
  return deadline;
}

/**
 * Get CSS classes for deadline badge based on urgency
 */
export function getDeadlineBadgeClasses(deadline: string): string {
  const status = getDeadlineStatus(deadline);

  switch (status) {
    case 'closed':
      return 'bg-gray-100 text-gray-500';
    case 'urgent':
      return 'bg-red-100 text-red-700';
    case 'closing':
      return 'bg-amber-100 text-amber-700';
    case 'open':
      return 'bg-green-100 text-green-700';
  }
}

/**
 * Parse benefit amount from a string like "₹50,000/year" or "Up to ₹1,00,000"
 * @returns Amount in rupees, or 0 if not parseable
 */
export function parseBenefitAmount(benefits: string): number {
  if (!benefits) return 0;

  // Remove commas and find numbers after ₹ or Rs
  const cleaned = benefits.replace(/,/g, '');

  // Match patterns like ₹50000, Rs 50000, Rs. 1,00,000
  const match = cleaned.match(/(?:₹|Rs\.?\s*)(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }

  // Match patterns like "1 lakh", "2.5 lakh"
  const lakhMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
  if (lakhMatch) {
    return parseFloat(lakhMatch[1]) * 100000;
  }

  return 0;
}

/**
 * Format amount in Indian notation (lakhs)
 */
export function formatBenefitAmount(amount: number): string {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
}

/**
 * Count urgent scholarships (deadline within 7 days)
 */
export function countUrgentScholarships(scholarships: { deadline: string }[]): number {
  return scholarships.filter(s => {
    const days = getDaysUntilDeadline(s.deadline);
    return days >= 0 && days <= 7;
  }).length;
}

/**
 * Calculate total potential benefit amount
 */
export function calculateTotalPotential(scholarships: { benefits: string }[]): number {
  return scholarships.reduce((sum, s) => sum + parseBenefitAmount(s.benefits), 0);
}
