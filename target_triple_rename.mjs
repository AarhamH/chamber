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

  // List of files to copy
  const filesToCopy = [
    "src-tauri/static/bin/ffmpeg.exe",
    "src-tauri/static/bin/yt-dlp.exe",
    "src-tauri/static/bin/ffmpeg", // Non-executable version
    "src-tauri/static/bin/yt-dlp"    // Non-executable version
  ];

  // Prepare a string to write to constants.rs
  let constantsContent = "// Auto-generated constants for copied binaries\n\n";
  const constantsMap = new Map();

  // Read existing constants.rs if it exists
  try {
    const existingContent = await fs.readFile("src/constants.rs", "utf-8");
    const lines = existingContent.split("\n");
    
    for (const line of lines) {
      const line_match = line.match(/pub const (\w+)_PATH: &str = "(.+)";/);
      if (line_match) {
        constantsMap.set(line_match[1], line_match[2]); // Store existing constants
      }
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err; // Re-throw unexpected errors
    }
  }

  // Create the target directory if it doesn't exist
  const outputDir = "src-tauri/release_sidecar";
  await fs.mkdir(outputDir, { recursive: true });

  // Check for each file's existence and copy if necessary
  for (const oldPath of filesToCopy) {
    const newFileName = `${outputDir}/${path.basename(oldPath, extension)}-${targetTriple}${extension}`;
    
    try {
      await fs.access(newFileName);
    } catch (err) {
      if (err.code === "ENOENT") {
        // Copy the file to the new location
        await fs.copyFile(oldPath, newFileName);
      } else {
        throw err; // Re-throw unexpected errors
      }
    }

    // Determine the constant name
    const constantName = path.basename(oldPath, extension).toUpperCase().replace(/[-.]/g, "_");

    // Update or add the constant in the map
    constantsMap.set(constantName, path.resolve(newFileName));
  }

  // Build the new content for constants.rs
  for (const [name, value] of constantsMap) {
    constantsContent += `pub const ${name}_PATH: &str = "${value}";\n`;
  }

  // Write the constants.rs file, overwriting existing content
  await fs.writeFile("src-tauri/src/binary_path_gen.rs", constantsContent);
}

main().catch((e) => { 
  throw e; 
});
