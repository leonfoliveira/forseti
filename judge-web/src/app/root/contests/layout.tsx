import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className="navbar px-3 bg-body-tertiary">
        <div
          className="d-flex justify-content-between m-auto w-100"
          style={{ maxWidth: "1024px" }}
        >
          <h3 className="m-0">Root</h3>
          <div className="d-flex gap-3 align-items-center">
            <button className="btn btn-outline-secondary">Sign out</button>
          </div>
        </div>
      </nav>
      <div className="w-100 m-auto p-3" style={{ maxWidth: "1024px" }}>
        {children}
      </div>
    </div>
  );
}
