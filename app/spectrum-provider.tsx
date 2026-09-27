"use client";

import { Provider } from "@react-spectrum/provider";
import { defaultTheme } from "@adobe/react-spectrum";

export default function SpectrumProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider theme={defaultTheme} colorScheme="light">
      {children}
    </Provider>
  );
}
