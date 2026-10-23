
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

export default function ApiTestPage() {
  const [result, setResult] = useState("Testing connection...");

  useEffect(() => {
    apiRequest("/api/health")
      .then((data: unknown) => {
        setResult(JSON.stringify(data));
      })
      .catch((error: unknown) => {
        setResult(
          "Error: " +
            (error instanceof Error ? error.message : String(error))
        );
      });
  }, []);

  return (
    <main style={{ padding: "30px" }}>
      <h1>StudyFlow API Test</h1>
      <p>{result}</p>
    </main>
  );
}
