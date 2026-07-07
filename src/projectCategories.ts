// Broad filter categories for the projects index. The per-project `tags` stay
// specific (and still show on the cards); the filter bar groups them into these
// few buckets so it isn't a wall of 60+ one-off tags.

export interface Category {
  /** stable key used in the card's data-tags + the filter button */
  key: string;
  en: string;
  da: string;
  /** a project belongs to this category if it has ANY of these tags */
  tags: string[];
}

export const categories: Category[] = [
  {
    key: 'pcb',
    en: 'PCB & fabrication',
    da: 'PCB & fremstilling',
    tags: [
      'KiCad', 'PCB design', 'PCB automation', 'CNC / grbl', 'FreeRouting',
      'Power electronics', 'Analog electronics', 'Analog front-end', 'Op-amp (TL072)',
      'PWM DAC', 'Filter design', '3D CAD',
    ],
  },
  {
    key: 'firmware',
    en: 'Embedded firmware',
    da: 'Embedded firmware',
    tags: [
      'Embedded C', 'Embedded C++', 'C / firmware', 'Bare-metal AVR', 'ESP32',
      'ESP32 / ESP-IDF', 'ESPHome component', 'Arduino', 'ATmega328P', 'ATmega2560',
      'PID control', 'Firmware testing', 'Safety-critical', 'Safety', 'SPIFFS',
    ],
  },
  {
    key: 'control',
    en: 'Control & DSP',
    da: 'Regulering & DSP',
    tags: [
      'Control systems', 'DSP', 'Frequency-domain design', 'System identification',
      'Simulink', 'Simscape Multibody', 'MATLAB', 'Measurement',
    ],
  },
  {
    key: 'fpga',
    en: 'FPGA & digital',
    da: 'FPGA & digital',
    tags: ['VHDL', 'FPGA', 'Vivado', 'Digital design', 'Computer architecture', 'FSM', 'State machine'],
  },
  {
    key: 'software',
    en: 'Software & tools',
    da: 'Software & værktøjer',
    tags: [
      'Python', 'Python / FastAPI', 'PySide6', 'Electron', 'Desktop app', 'CLI tool',
      'Computational geometry', 'Simulated annealing', 'LLM', 'RAG / grounding', 'Ollama',
      'Prompt engineering', 'LabVIEW', 'Home Assistant', 'Raspberry Pi',
    ],
  },
  {
    key: 'reveng',
    en: 'Reverse engineering',
    da: 'Reverse engineering',
    tags: ['Reverse engineering', 'Logic analyzer', 'IR protocols', 'UART', 'SPI', 'I2C'],
  },
];

/** The category keys a project belongs to, based on its tags. */
export function projectCategoryKeys(tags: string[]): string[] {
  return categories.filter((c) => c.tags.some((t) => tags.includes(t))).map((c) => c.key);
}
