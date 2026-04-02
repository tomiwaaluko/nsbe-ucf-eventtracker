export const POINT_TYPES = {
  // General
  GPA_VERIFICATION:         { label: 'GPA Verification',                   points: 20,  zone: 'general',         requiresLabel: false, autoSource: null },
  PAID_MEMBER:              { label: 'Paid Member',                        points: 30,  zone: 'general',         requiresLabel: false, autoSource: null },
  COMMITTEE_MEETING:        { label: 'Committee Meeting',                  points: 30,  zone: 'general',         requiresLabel: false, autoSource: 'COMMITTEE_PARTICIPATION' },
  GBM:                      { label: 'Attending GBM',                      points: 50,  zone: 'general',         requiresLabel: false, autoSource: 'GBM' },
  NATIONAL_DUES:            { label: 'National Dues',                      points: 50,  zone: 'general',         requiresLabel: false, autoSource: null },
  JOINED_COMMITTEE:         { label: 'Joining a Committee',                points: 15,  zone: 'general',         requiresLabel: true,  autoSource: null },

  // Communication
  SOCIAL:                   { label: 'Attending a Social',                 points: 30,  zone: 'communication',   requiresLabel: false, autoSource: 'SOCIAL' },
  TABLING:                  { label: 'Helping with Tabling',               points: 30,  zone: 'communication',   requiresLabel: true,  autoSource: null },
  VIDEO_PROJECT:            { label: 'Final Draft of Video Project',       points: 60,  zone: 'communication',   requiresLabel: true,  autoSource: null },
  CREATING_GRAPHICS:        { label: 'Creating Graphics',                  points: 35,  zone: 'communication',   requiresLabel: true,  autoSource: null },

  // Program
  AEX_WORKSHOP:             { label: 'AEX Workshop / PowerStudiez',        points: 30,  zone: 'program',         requiresLabel: false, autoSource: 'WORKSHOP' },
  SPONSORED_EVENT:          { label: 'Sponsored Event (Committee Member)', points: 20,  zone: 'program',         requiresLabel: true,  autoSource: null },
  TUTORING_TUTOR:           { label: 'Tutoring Session (Tutor)',           points: 30,  zone: 'program',         requiresLabel: true,  autoSource: null },
  TUTORING_TUTEE:           { label: 'Tutoring Session (Tutee)',           points: 15,  zone: 'program',         requiresLabel: true,  autoSource: null },
  MENTORSHIP_MEETING:       { label: 'Mentorship Meeting',                 points: 15,  zone: 'program',         requiresLabel: false, autoSource: null },
  COMMUNITY_SERVICE:        { label: 'Community Service (PCI & Torch)',    points: 40,  zone: 'program',         requiresLabel: false, autoSource: 'COMMUNITY_SERVICE' },
  PROJECT_TEAM:             { label: 'Joined AEX Technical Project Team',  points: 30,  zone: 'program',         requiresLabel: true,  autoSource: null },
  POWER_SYNC_HOST:          { label: 'Power Sync Workshop Co-Host',        points: 50,  zone: 'program',         requiresLabel: true,  autoSource: null },
  MENTORSHIP_COMPLETE:      { label: 'Completed Mentorship Program',       points: 60,  zone: 'program',         requiresLabel: false, autoSource: null },
  WALK_FOR_EDUCATION:       { label: 'Walk for Education',                 points: 100, zone: 'program',         requiresLabel: false, autoSource: null },

  // Parliamentarian
  FALL_REGIONAL_CONFERENCE: { label: 'Fall Regional Conference',           points: 75,  zone: 'parliamentarian', requiresLabel: false, autoSource: null },
  NATIONAL_CONVENTION:      { label: 'National Convention',                points: 100, zone: 'parliamentarian', requiresLabel: false, autoSource: null },
} as const;

export type PointTypeKey = keyof typeof POINT_TYPES;
export type PointZone = 'general' | 'communication' | 'program' | 'parliamentarian';
