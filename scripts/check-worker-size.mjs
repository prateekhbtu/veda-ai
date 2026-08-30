import { stat } from "node:fs/promises";

const worker = ".open-next/worker.js";
try {
  const { size } = await stat(worker);
  const megabytes = size / 1024 / 1024;
  console.log(`Worker: ${megabytes.toFixed(2)} MB`);
  if (megabytes > 10) process.exitCode = 1;
} catch {
  console.error("Build the OpenNext worker before checking its size.");
  process.exitCode = 1;
}
