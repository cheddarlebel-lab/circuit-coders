export interface Project {
  id: string;
  name: string;
  description: string;
  category: "hardware" | "software" | "integrated";
  components: HardwareComponent[];
  softwareStack: string[];
  estimatedPrice: number;
  timeline: string;
  mockup?: MockupConfig;
}

export interface HardwareComponent {
  id: string;
  name: string;
  category: "microcontroller" | "sensor" | "actuator" | "display" | "communication" | "power" | "pcb" | "enclosure";
  model: string;
  price: number;
  specs: Record<string, string>;
  icon: string;
}

export interface MockupConfig {
  type: "schematic" | "ui" | "dashboard" | "api" | "firmware";
  components: string[];
  connections: Connection[];
  layout: "horizontal" | "vertical" | "grid";
}

export interface Connection {
  from: string;
  to: string;
  protocol: string;
  color?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  interval: "one-time" | "monthly" | "yearly";
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface InquiryForm {
  name: string;
  email: string;
  company?: string;
  projectType: "hardware" | "software" | "integrated" | "consultation";
  budget: string;
  timeline: string;
  description: string;
  components: string[];
  attachments: File[];
}

export interface FirmwareRelease {
  id: string;
  version: string;
  product: string;
  date: string;
  changelog: string[];
  downloadUrl: string;
  size: string;
  checksum: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "platform" | "mobile" | "automation" | "hardware" | "saas" | "api";
  tech: string[];
  metrics: { label: string; value: string }[];
  color: string;
  icon: string;
  features: string[];
}
