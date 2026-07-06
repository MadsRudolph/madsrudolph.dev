// Minimal two-language string table for site chrome (nav, footer, toggle).
// Narrative pages (home, about, cv, projects index) exist as separate EN and DA
// files under src/pages and src/pages/da. Project writeups are English-only.

export type Lang = 'en' | 'da';

export const ui = {
  en: {
    navProjects: 'Projects',
    navAbout: 'About',
    navCv: 'CV',
    footerLoc: 'Kgs. Lyngby, Denmark',
    footerTag: 'static site, no trackers',
  },
  da: {
    navProjects: 'Projekter',
    navAbout: 'Om mig',
    navCv: 'CV',
    footerLoc: 'Kgs. Lyngby, Danmark',
    footerTag: 'statisk side, ingen sporing',
  },
} as const;
