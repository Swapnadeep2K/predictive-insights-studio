"use client";

import type { TruncateTextProps } from "../../types";

export default function TruncateText({ text, className = "", as = "span" }: TruncateTextProps) {
  const Component = as;
  return (
    <Component className={`truncate ${className}`.trim()} title={text}>
      {text}
    </Component>
  );
}
