import { execa } from "execa";
import fs from "fs/promises";
import path from "path";

let extension = "";
if (process.platform === "win32") {
  extension = ".exe";
}

async function main() {
  let targetTriple;

  const rustInfo = (await execa("rustc", ["-vV"])).stdout;
  const match = /host: (\S+)/.exec(rustInfo);

  if (match) {
    targetTriple = match[1];
  } else {
    throw new Error("Failed to determine platform target triple");
  }

  // List of files to rename
  const filesToRename = [
    `src-tauri/static/bin/ffmpeg${extension}`,
    `src-tauri/static/bin/yt-dlp${extension}`
  ];

  // Check for each file's existence and rename if necessary
  for (const oldPath of filesToRename) {
    const newFileName = `src-tauri/static/bin/${path.basename(oldPath, extension)}-${targetTriple}${extension}`;

    try {
      await fs.access(newFileName);
    } catch (err) {
      if (err.code === "ENOENT") {
        // Rename only if the new name doesn't exist
        await fs.rename(oldPath, newFileName);
      } else {
        throw err; // Re-throw unexpected errors
      }
    }
  }
}

main().catch((e) => { throw e; });
