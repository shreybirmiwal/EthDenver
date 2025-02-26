// src/components/Layout.tsx
import React, { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      <header>
        <h1>My App Header</h1>
      </header>
      <main>{children}</main>
      <footer>My Footer</footer>
    </div>
  );
}
