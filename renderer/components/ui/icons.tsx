"use client"

import {
  LayoutDashboard,
  FileText,
  BarChart,
  Bell,
  Settings,
  Shield,
  Circle,
  ChevronDown,
  PanelLeftClose,
  type LucideIcon
} from "lucide-react";

export const Icons = {
  LayoutDashboard,
  FileText,
  BarChart,
  Bell,
  Settings,
  Shield,
  Circle,
  ChevronDown,
  PanelLeftClose
} as const;

export type Icon = keyof typeof Icons;
export type IconComponent = LucideIcon; 