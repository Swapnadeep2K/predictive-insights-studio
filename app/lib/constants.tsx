"use client";

import React from "react";
import { LayoutGrid, Target } from "lucide-react";
import SpectrumHome from "@spectrum-icons/workflow/Home";
import SpectrumCampaign from "@spectrum-icons/workflow/Campaign";
import SpectrumJourney from "@spectrum-icons/workflow/Journey";
import SpectrumReport from "@spectrum-icons/workflow/Report";
import SpectrumAsset from "@spectrum-icons/workflow/Asset";
import SpectrumFileTemplate from "@spectrum-icons/workflow/FileTemplate";
import SpectrumDocumentFragment from "@spectrum-icons/workflow/DocumentFragment";
import SpectrumForm from "@spectrum-icons/workflow/Form";
import SpectrumHomepage from "@spectrum-icons/workflow/Homepage";
import SpectrumGlobe from "@spectrum-icons/workflow/Globe";
import SpectrumPlatformDataMapping from "@spectrum-icons/workflow/PlatformDataMapping";
import SpectrumSQLQuery from "@spectrum-icons/workflow/SQLQuery";
import SpectrumMonitoring from "@spectrum-icons/workflow/Monitoring";
import SpectrumUserGroup from "@spectrum-icons/workflow/UserGroup";
import SpectrumSubscribe from "@spectrum-icons/workflow/Subscribe";
import SpectrumRealTimeCustomerProfile from "@spectrum-icons/workflow/RealTimeCustomerProfile";
import SpectrumIdentityService from "@spectrum-icons/workflow/IdentityService";
import SpectrumCalculator from "@spectrum-icons/workflow/Calculator";
import SpectrumShield from "@spectrum-icons/workflow/Shield";
import SpectrumSettings from "@spectrum-icons/workflow/Settings";
import SpectrumBranch1 from "@spectrum-icons/workflow/Branch1";
import SpectrumAlert from "@spectrum-icons/workflow/Alert";
import SpectrumSandbox from "@spectrum-icons/workflow/Sandbox";
import SpectrumChannel from "@spectrum-icons/workflow/Channel";
import SpectrumViewAllTags from "@spectrum-icons/workflow/ViewAllTags";
import SpectrumOffer from "@spectrum-icons/workflow/Offer";
import SpectrumCollection from "@spectrum-icons/workflow/Collection";
import SpectrumData from "@spectrum-icons/workflow/Data";
import SpectrumImport from "@spectrum-icons/workflow/Import";
import SpectrumExport from "@spectrum-icons/workflow/Export";
import SpectrumLockClosed from "@spectrum-icons/workflow/LockClosed";
import SpectrumDataCheck from "@spectrum-icons/workflow/DataCheck";
import SpectrumDataRefresh from "@spectrum-icons/workflow/DataRefresh";
import SpectrumDocument from "@spectrum-icons/workflow/Document";
import type { SidebarItem, SidebarGroup } from "../types";

// Theme tokens
export const VIOLET = {
  accent: "#0265dc",
  tint: "#eaf2ff",
};

// Wraps a Spectrum workflow icon so it accepts a className prop (matches lucide's API)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function si(Icon: React.ComponentType<any>) {
  return function SpectrumIconWrapper({ className }: { className?: string }) {
    return <Icon UNSAFE_className={className} size="S" aria-hidden />;
  };
}

export const SIDEBAR_HOME: SidebarItem = { label: "Home", icon: si(SpectrumHome) };

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: "Journey Management",
    collapsible: true,
    items: [
      { label: "Campaigns", icon: si(SpectrumCampaign) },
      { label: "Journeys", icon: si(SpectrumJourney) },
      { label: "Reports", icon: si(SpectrumReport) },
    ],
  },
  {
    title: "Use Case Playbooks",
    collapsible: true,
    items: [
      { label: "Playbooks", icon: si(SpectrumOffer) },
      { label: "Predictive Insights Studio", icon: LayoutGrid, clickable: true, active: true },
    ],
  },
  {
    title: "Decisioning",
    collapsible: true,
    items: [
      { label: "Catalogs", icon: si(SpectrumCollection) },
      { label: "Strategy setup", icon: Target },
    ],
  },
  {
    title: "Content Management",
    collapsible: true,
    items: [
      { label: "Assets", icon: si(SpectrumAsset) },
      { label: "Content templates", icon: si(SpectrumFileTemplate) },
      { label: "Fragments", icon: si(SpectrumDocumentFragment) },
      { label: "Forms", icon: si(SpectrumForm) },
      { label: "Landing pages", icon: si(SpectrumHomepage) },
      { label: "Translations", icon: si(SpectrumGlobe) },
    ],
  },
  {
    title: "Data Management",
    collapsible: true,
    items: [
      { label: "Schemas", icon: si(SpectrumPlatformDataMapping) },
      { label: "Datasets", icon: si(SpectrumData) },
      { label: "Queries", icon: si(SpectrumSQLQuery) },
      { label: "Monitoring", icon: si(SpectrumMonitoring) },
    ],
  },
  {
    title: "Connections",
    collapsible: true,
    items: [
      { label: "Sources", icon: si(SpectrumImport) },
      { label: "Destinations", icon: si(SpectrumExport) },
    ],
  },
  {
    title: "Customer",
    collapsible: true,
    items: [
      { label: "Audiences", icon: si(SpectrumUserGroup) },
      { label: "Subscription lists", icon: si(SpectrumSubscribe) },
      { label: "Profiles", icon: si(SpectrumRealTimeCustomerProfile) },
      { label: "Identities", icon: si(SpectrumIdentityService) },
      { label: "Sample Size Calculator", icon: si(SpectrumCalculator) },
    ],
  },
  {
    title: "Privacy",
    collapsible: true,
    items: [
      { label: "Policies", icon: si(SpectrumShield) },
      { label: "Requests", icon: si(SpectrumLockClosed) },
      { label: "Audits", icon: si(SpectrumDataCheck) },
      { label: "Data Lifecycle", icon: si(SpectrumDataRefresh) },
    ],
  },
  {
    title: "Administration",
    collapsible: true,
    items: [
      { label: "Configurations", icon: si(SpectrumSettings) },
      { label: "Business rules", icon: si(SpectrumBranch1) },
      { label: "Alerts", icon: si(SpectrumAlert) },
      { label: "Sandboxes", icon: si(SpectrumSandbox) },
      { label: "Channels", icon: si(SpectrumChannel) },
      { label: "Tags", icon: si(SpectrumViewAllTags) },
      { label: "License Usage", icon: si(SpectrumDocument) },
    ],
  },
];
