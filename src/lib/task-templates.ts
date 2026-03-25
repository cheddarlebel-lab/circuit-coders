// Task templates per project type — auto-populated when project enters production

export interface TaskTemplate {
  phase: string;
  title: string;
  description?: string;
}

const COMMON_PLANNING: TaskTemplate[] = [
  { phase: 'planning', title: 'Review client requirements', description: 'Analyze inquiry details and clarify scope' },
  { phase: 'planning', title: 'Define project scope & deliverables' },
  { phase: 'planning', title: 'Create project timeline & milestones' },
];

const COMMON_TESTING: TaskTemplate[] = [
  { phase: 'testing', title: 'Unit testing' },
  { phase: 'testing', title: 'Integration testing' },
  { phase: 'testing', title: 'Client UAT / review session' },
];

const COMMON_DEPLOYMENT: TaskTemplate[] = [
  { phase: 'deployment', title: 'Final QA pass' },
  { phase: 'deployment', title: 'Deploy to production' },
  { phase: 'deployment', title: 'Client handoff & documentation' },
];

const SOFTWARE_TASKS: TaskTemplate[] = [
  ...COMMON_PLANNING,
  { phase: 'design', title: 'Wireframes / UI mockups' },
  { phase: 'design', title: 'Database schema design' },
  { phase: 'design', title: 'API architecture planning' },
  { phase: 'design', title: 'Client design approval' },
  { phase: 'development', title: 'Set up project repo & CI/CD' },
  { phase: 'development', title: 'Build core backend / API' },
  { phase: 'development', title: 'Build frontend UI' },
  { phase: 'development', title: 'Integrate frontend & backend' },
  { phase: 'development', title: 'Authentication & authorization' },
  ...COMMON_TESTING,
  ...COMMON_DEPLOYMENT,
];

const HARDWARE_TASKS: TaskTemplate[] = [
  ...COMMON_PLANNING,
  { phase: 'planning', title: 'Component sourcing & BOM' },
  { phase: 'design', title: 'Schematic design' },
  { phase: 'design', title: 'PCB layout' },
  { phase: 'design', title: 'Enclosure / mechanical design' },
  { phase: 'design', title: 'Design review with client' },
  { phase: 'development', title: 'Order components & PCBs' },
  { phase: 'development', title: 'Prototype assembly' },
  { phase: 'development', title: 'Firmware development' },
  { phase: 'development', title: 'Hardware-firmware integration' },
  { phase: 'testing', title: 'Power & thermal testing' },
  { phase: 'testing', title: 'Functional validation' },
  { phase: 'testing', title: 'Client prototype review' },
  { phase: 'deployment', title: 'Final build & assembly' },
  { phase: 'deployment', title: 'Firmware flashing & QA' },
  { phase: 'deployment', title: 'Client handoff & documentation' },
];

const FULLSTACK_TASKS: TaskTemplate[] = [
  ...COMMON_PLANNING,
  { phase: 'planning', title: 'Component sourcing & BOM' },
  { phase: 'design', title: 'System architecture (HW + SW)' },
  { phase: 'design', title: 'Schematic & PCB layout' },
  { phase: 'design', title: 'UI/UX wireframes' },
  { phase: 'design', title: 'API & communication protocol design' },
  { phase: 'design', title: 'Client design approval' },
  { phase: 'development', title: 'Order components & PCBs' },
  { phase: 'development', title: 'Hardware prototype assembly' },
  { phase: 'development', title: 'Firmware development' },
  { phase: 'development', title: 'Backend API & database' },
  { phase: 'development', title: 'Frontend / dashboard UI' },
  { phase: 'development', title: 'Hardware-software integration' },
  ...COMMON_TESTING,
  { phase: 'testing', title: 'End-to-end system test' },
  ...COMMON_DEPLOYMENT,
];

const CONSULTATION_TASKS: TaskTemplate[] = [
  { phase: 'planning', title: 'Review client requirements' },
  { phase: 'planning', title: 'Research & analysis' },
  { phase: 'design', title: 'Draft recommendations document' },
  { phase: 'design', title: 'Prepare presentation / deliverable' },
  { phase: 'development', title: 'Client consultation session' },
  { phase: 'development', title: 'Revisions based on feedback' },
  { phase: 'testing', title: 'Final review pass' },
  { phase: 'deployment', title: 'Deliver final document' },
  { phase: 'deployment', title: 'Follow-up session' },
];

export function getTaskTemplates(projectType: string): TaskTemplate[] {
  switch (projectType?.toLowerCase()) {
    case 'hardware':
      return HARDWARE_TASKS;
    case 'full stack':
    case 'fullstack':
    case 'full_stack':
      return FULLSTACK_TASKS;
    case 'consultation':
      return CONSULTATION_TASKS;
    case 'software':
    default:
      return SOFTWARE_TASKS;
  }
}
