"use client";

import React from "react";

function Error({ statusCode, error }: { statusCode: number; error: Error }) {
  return (
    <div>
      <h1>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : "An error occurred on client"}
      </h1>
      {error && process.env.NODE_ENV === "development" && (
        <pre>{error.stack}</pre>
      )}
    </div>
  );
}

export default Error;
