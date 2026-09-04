// DTU coursework, one source for the courses pages and the home page.
// Completed terms come from the official transcript (110 ECTS at 7 July 2026)
// plus 34722, passed at the oral re-exam on 25 August 2026. Grades are
// deliberately not published. The current term is what the DTU planner shows
// as enrolled for autumn 2026 (checked 8 August 2026).

export interface Course {
  code: string;
  title: string;
  ects: number;
}

export interface Term {
  term: string;
  sem: string;
  courses: Course[];
  note?: string;
}

export interface Coursework {
  completed: Term[];
  current: Term;
  planned: Term[];
}

const link = (code: string) => (code === '—' ? undefined : `https://kurser.dtu.dk/course/${code}`);
export const courseUrl = link;

export const ectsOf = (terms: Term[]) =>
  terms.reduce((s, t) => s + t.courses.reduce((a, c) => a + c.ects, 0), 0);

export const coursework: Record<'en' | 'da', Coursework> = {
  en: {
    completed: [
      {
        term: 'Autumn 2024',
        sem: '1st semester',
        courses: [
          { code: '30032', title: 'Electrical Engineering', ects: 10 },
          { code: '10935', title: 'Physics 1', ects: 5 },
          { code: '62712', title: 'Fundamental C Programming', ects: 5 },
          { code: '01911', title: 'Mathematical Analysis and Modelling', ects: 5 },
          { code: '62733', title: 'Project Work in Electrical Engineering', ects: 5 },
        ],
      },
      {
        term: 'Spring 2025',
        sem: '2nd semester',
        courses: [
          { code: '34601', title: 'Electric Circuits 2', ects: 5 },
          { code: '30081', title: 'Digital Electronics', ects: 5 },
          { code: '30082', title: 'Project Work in Digital Design', ects: 5 },
          { code: '62734', title: 'Computer Engineering and Programming', ects: 5 },
          { code: '01922', title: 'Linear Algebra and Modelling', ects: 5 },
          { code: '62735', title: 'Advanced Mathematics for Electrical Engineering', ects: 5 },
        ],
      },
      {
        term: 'Autumn 2025',
        sem: '3rd semester',
        courses: [
          { code: '30035', title: 'Applied Electromagnetics', ects: 10 },
          { code: '34636', title: 'Integrated Analog Electronics 1', ects: 5 },
          { code: '34621', title: 'Electromagnetic Sensors and Digital Signal Processing', ects: 5 },
        ],
      },
      {
        term: 'Spring 2026',
        sem: '4th semester',
        courses: [
          { code: '62743', title: 'Digital Signal Processing', ects: 10 },
          { code: '34655', title: 'Integrated Analog Electronics 2', ects: 5 },
          { code: '34620', title: 'Fundamental Power Electronics in Energy Systems', ects: 5 },
          { code: '34315', title: 'Internet of Things — Application & Infrastructure Development', ects: 5 },
          { code: '62711', title: 'Digital Systems Design', ects: 5 },
          { code: '34722', title: 'Linear Control Design 1', ects: 5 },
        ],
        note: 'Linear Control Design 1 was passed at the oral re-exam in August 2026.',
      },
    ],
    current: {
      term: 'Autumn 2026',
      sem: '5th semester',
      courses: [
        { code: '34870', title: 'Electroacoustics', ects: 10 },
        { code: '62755', title: 'Power Electronics', ects: 5 },
        { code: '34840', title: 'Fundamentals of Acoustics and Noise Control', ects: 5 },
        { code: '34654', title: 'Circuit Technology and EMC', ects: 5 },
      ],
      note: 'The acoustics track in one year: transducers, the fields they create, and in January the nonlinear part.',
    },
    planned: [
      {
        term: 'January 2027',
        sem: '3-week intensive',
        courses: [{ code: '34871', title: 'Nonlinear Transducers', ects: 5 }],
      },
      {
        term: 'Spring 2027',
        sem: '6th semester',
        courses: [{ code: '—', title: 'Engineering internship (praktik)', ects: 30 }],
      },
      {
        term: 'Autumn 2027',
        sem: '7th semester',
        courses: [
          { code: '—', title: 'Bachelor thesis (Diplomingeniørprojekt)', ects: 20 },
          { code: '34652', title: 'Power Electronics 1 (elective)', ects: 10 },
        ],
      },
    ],
  },
  da: {
    completed: [
      {
        term: 'Efterår 2024',
        sem: '1. semester',
        courses: [
          { code: '30032', title: 'Elektroteknik', ects: 10 },
          { code: '10935', title: 'Fysik 1', ects: 5 },
          { code: '62712', title: 'Grundlæggende C programmering', ects: 5 },
          { code: '01911', title: 'Matematisk analyse og modellering', ects: 5 },
          { code: '62733', title: 'Projektarbejde i elektroteknik', ects: 5 },
        ],
      },
      {
        term: 'Forår 2025',
        sem: '2. semester',
        courses: [
          { code: '34601', title: 'Elektriske kredsløb 2', ects: 5 },
          { code: '30081', title: 'Digitalteknik', ects: 5 },
          { code: '30082', title: 'Projektarbejde i digitaldesign', ects: 5 },
          { code: '62734', title: 'Datateknik og programmering', ects: 5 },
          { code: '01922', title: 'Lineær algebra og modellering', ects: 5 },
          { code: '62735', title: 'Videregående Matematik for Diplom Elektroteknologi', ects: 5 },
        ],
      },
      {
        term: 'Efterår 2025',
        sem: '3. semester',
        courses: [
          { code: '30035', title: 'Anvendt elektromagnetisme', ects: 10 },
          { code: '34636', title: 'Integreret analog elektronik 1', ects: 5 },
          { code: '34621', title: 'Elektromagnetiske sensorer og digital signalbehandling', ects: 5 },
        ],
      },
      {
        term: 'Forår 2026',
        sem: '4. semester',
        courses: [
          { code: '62743', title: 'Digital signalbehandling', ects: 10 },
          { code: '34655', title: 'Integreret analog elektronik 2', ects: 5 },
          { code: '34620', title: 'Grundlæggende effektelektronik i energisystemer', ects: 5 },
          { code: '34315', title: 'Internet of things — applikation og infrastruktur udvikling', ects: 5 },
          { code: '62711', title: 'Digitale systemer, design af', ects: 5 },
          { code: '34722', title: 'Reguleringsteknik 1', ects: 5 },
        ],
        note: 'Reguleringsteknik 1 blev bestået ved den mundtlige reeksamen i august 2026.',
      },
    ],
    current: {
      term: 'Efterår 2026',
      sem: '5. semester',
      courses: [
        { code: '34870', title: 'Elektroakustik', ects: 10 },
        { code: '62755', title: 'Effektelektronik', ects: 5 },
        { code: '34840', title: 'Grundlæggende akustik og støjbekæmpelse', ects: 5 },
        { code: '34654', title: 'Kredsløbsteknik og EMC', ects: 5 },
      ],
      note: 'Hele akustiksporet på ét år: transducere, de lydfelter de skaber, og i januar den ulineære del.',
    },
    planned: [
      {
        term: 'Januar 2027',
        sem: '3-ugers intensivt',
        courses: [{ code: '34871', title: 'Ulineære transducere', ects: 5 }],
      },
      {
        term: 'Forår 2027',
        sem: '6. semester',
        courses: [{ code: '—', title: 'Ingeniørpraktik', ects: 30 }],
      },
      {
        term: 'Efterår 2027',
        sem: '7. semester',
        courses: [
          { code: '—', title: 'Diplomingeniørprojekt (bachelorprojekt)', ects: 20 },
          { code: '34652', title: 'Effektelektronik 1 (valgfag)', ects: 10 },
        ],
      },
    ],
  },
};
