/**
 * Event category enum matching the backend Prisma schema
 * These values must match the EventCategory enum in the backend
 */
export enum EventCategory {
  GBM = 'GBM',
  SOCIAL = 'SOCIAL',
  WORKSHOP = 'WORKSHOP',
  FUNDRAISER = 'FUNDRAISER',
  COMMUNITY_SERVICE = 'COMMUNITY_SERVICE',
  COMMITTEE_PARTICIPATION = 'COMMITTEE_PARTICIPATION',
}

/**
 * Array of all event categories with their display labels and colors
 * Used throughout the frontend for dropdowns, displays, and form validation
 */
export const EVENT_CATEGORIES = [
  { 
    value: EventCategory.GBM, 
    label: 'General Body Meeting', 
    color: '#00a651' // NSBE Green
  },
  { 
    value: EventCategory.SOCIAL, 
    label: 'Social', 
    color: '#ffb81c' // NSBE Gold
  },
  { 
    value: EventCategory.WORKSHOP, 
    label: 'Workshop', 
    color: '#0066cc' // Blue
  },
  { 
    value: EventCategory.FUNDRAISER, 
    label: 'Fundraiser', 
    color: '#ed1c24' // NSBE Red
  },
  { 
    value: EventCategory.COMMUNITY_SERVICE, 
    label: 'Community Service', 
    color: '#8b4513' // Brown
  },
  { 
    value: EventCategory.COMMITTEE_PARTICIPATION, 
    label: 'Committee Participation', 
    color: '#9932cc' // Purple
  },
] as const;

/**
 * Type for event category values
 */
export type EventCategoryType = EventCategory;

/**
 * Get the display label for an event category
 */
export function getEventCategoryLabel(category: EventCategory | string): string {
  const found = EVENT_CATEGORIES.find((cat) => cat.value === category);
  return found?.label || category;
}

/**
 * Get the color for an event category
 */
export function getEventCategoryColor(category: EventCategory | string): string {
  const found = EVENT_CATEGORIES.find((cat) => cat.value === category);
  return found?.color || '#666666'; // Default gray
}

/**
 * Check if a string is a valid event category
 */
export function isValidEventCategory(value: string): value is EventCategory {
  return Object.values(EventCategory).includes(value as EventCategory);
}
