"use client";

/**
 * Displays a 404 Not Found error page.
 */
export default function Error404Page() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="font-mono text-8xl font-bold" data-testid="code">
        404
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        The page you are looking for could not be found.
      </h2>
    </div>
  );
}
