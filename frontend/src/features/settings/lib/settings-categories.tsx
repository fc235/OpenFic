import {
  Brain,
  Bot,
  Cable,
  Database,
  FileText,
  Globe,
  Palette,
  Package,
  Summary as SummaryIcon,
  Settings as SettingsIcon,
  ShieldAlert,
} from "lucide-react";
import type { ReactNode } from "react";

export type SettingsCategory =
  | "general"
  | "personalization"
  | "editor"
  | "connections"
  | "models"
  | "index"
  | "context"
  | "summary"
  | "agent-tools"
  | "web-search"
  | "rules"
  | "skills"
  | "agents"
  | "advanced";

interface SettingsCategoryItem {
  id: SettingsCategory;
  icon: ReactNode;
  labelKey: string;
}

export const SETTINGS_CATEGORY_ITEMS: SettingsCategoryItem[] = [
  {
    id: "general",
    icon: <SettingsIcon size={16} />,
    labelKey: "settings.general",
  },
  {
    id: "personalization",
    icon: <Palette size={16} />,
    labelKey: "settings.personalization",
  },
  {
    id: "connections",
    icon: <Cable size={16} />,
    labelKey: "settings.connections",
  },
  {
    id: "models",
    icon: <Brain size={16} />,
    labelKey: "settings.models",
  },
  {
    id: "index",
    icon: <Database size={16} />,
    labelKey: "settings.index",
  },
  {
    id: "summary",
    icon: <SummaryIcon size={16} />,
    labelKey: "settings.summary",
  },
  {
    id: "agent-tools",
    icon: <ShieldAlert size={16} />,
    labelKey: "settings.agentTools",
  },
  {
    id: "web-search",
    icon: <Globe size={16} />,
    labelKey: "settings.webSearch",
  },
  {
    id: "rules",
    icon: <FileText size={16} />,
    labelKey: "settings.rules",
  },
  {
    id: "skills",
    icon: <Package size={16} />,
    labelKey: "settings.skills",
  },
  {
    id: "agents",
    icon: <Bot size={16} />,
    labelKey: "settings.agents",
  },
];
