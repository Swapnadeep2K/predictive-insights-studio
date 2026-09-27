import React from "react";

export type RoiResult = {
  estimated_roi: number;
  confidence_score: number;
  expected_conversion_lift?: number;
  predicted_segment_metrics?: Record<string, number>;
};

export type WhatToShow = {
  type?: string;
  message?: string;
  explanation?: string;
};

export type WhereToShow = {
  channel?: string;
  surface?: string;
  explanation?: string;
};

export type WhenToShow = {
  trigger?: string;
  frequency?: string;
  duration?: string;
  explanation?: string;
};

export type UseCase = {
  use_case_id: string;
  use_case_title: string;
  use_case_type: string; // upsell | retention | etc.
  what_to_show?: WhatToShow;
  where_to_show?: WhereToShow;
  when_to_show?: WhenToShow;
  hypothesis?: string;
  target_criteria?: string;
  roi_result?: RoiResult;
};

export type SegmentAttributes = Record<string, string>;

export type Segment = {
  segment_name: string;
  segment_description?: string;
  segment_attributes?: SegmentAttributes;
  use_cases?: UseCase[];
};

export type SegmentsPayload = Record<string, Segment>;

export type SidebarItem = {
  label: string;
  icon: React.ElementType;
  clickable?: boolean;
  active?: boolean;
};

export type SidebarGroup = {
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
};

export type TruncateTextProps = {
  text: string;
  className?: string;
  as?: "span" | "div";
};

export type UseCaseSortField = "name" | "type" | "channel" | "trigger" | "roi" | "confidence";
export type SortDirection = "asc" | "desc";
