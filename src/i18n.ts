// Minimal two-language string table for site chrome (nav, footer, toggle).
// Narrative pages (home, about, cv, courses, projects index) exist as separate
// EN and DA files under src/pages and src/pages/da. Project write-ups are
// English-only.

export type Lang = 'en' | 'da';

export const ui = {
  en: {
    navLabel: 'Main navigation',
    navHome: 'Home',
    navProjects: 'Projects',
    navAbout: 'About',
    navCv: 'CV',
    navCourses: 'Courses',
    footerLoc: 'Kgs. Lyngby, Denmark',
    footerTag: 'static site, no trackers',
    available: 'Available Jan 2027',
  },
  da: {
    navLabel: 'Hovedmenu',
    navHome: 'Hjem',
    navProjects: 'Projekter',
    navAbout: 'Om mig',
    navCv: 'CV',
    navCourses: 'Kurser',
    footerLoc: 'Kgs. Lyngby, Danmark',
    footerTag: 'statisk side, ingen sporing',
    available: 'Ledig jan. 2027',
  },
} as const;
