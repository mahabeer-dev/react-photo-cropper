import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(rootDir, "../src/styles.css");
const destinationPath = resolve(rootDir, "../dist/styles.css");

await mkdir(dirname(destinationPath), { recursive: true });
await copyFile(sourcePath, destinationPath);
