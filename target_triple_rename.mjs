import { execa } from "execa";
import fs from "fs/promises";
import path from "path";

async function copyBinaries(binDir, outputDir, targetTriple, constantsMap) {
  const files = await fs.readdir(binDir);

  for (const file of files) {
    const oldPath = path.join(binDir, file);
    const newFileName = `${path.basename(file)}-${targetTriple}${process.platform === "win32" ? ".exe" : ""}`;
    const newPath = path.join(outputDir, newFileName);

    // Copy the file to the new location if it doesn't exist
    try {
      await fs.access(newPath);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.copyFile(oldPath, newPath);
      } else {
        throw err; // Re-throw unexpected errors
      }
    }

    // Determine the constant name
    const constantBaseName = path.basename(file, path.extname(file)).toUpperCase().replace(/[-.]/g, "_");
    constantsMap.set(constantBaseName, path.resolve(newPath));

    // Handle ffmpeg and yt-dlp for Unix
    if (file === "ffmpeg" || file === "yt-dlp") {
      const nonExeNewFileName = `${path.basename(file)}-${targetTriple}`;
      const nonExeNewPath = path.join(outputDir, nonExeNewFileName);

      // Check if the non-exe version exists and copy if needed
      try {
        await fs.access(nonExeNewPath);
      } catch (err) {
        if (err.code === "ENOENT") {
          await fs.copyFile(oldPath, nonExeNewPath);
        } else {
          throw err; // Re-throw unexpected errors
        }
      }

      constantsMap.set(`${constantBaseName}_NO_EXT`, path.resolve(nonExeNewPath));
    }
  }
}

async function writeConstantsUnix(constantsMap, outputPath) {
  let constantsContent = "// Auto-generated constants for copied binaries\n\n";

  for (const [name, value] of constantsMap) {
    constantsContent += `pub const ${name}_PATH: &str = "${value}";\n`;
  }

  await fs.writeFile(outputPath, constantsContent);
}

async function writeConstantsWindows(constantsMap, outputPath) {
  let constantsContent = "// Auto-generated constants for copied binaries\n\n";

  for (const [name, value] of constantsMap) {
    const formattedValue = value.replace(/\\/g, "\\\\");
    constantsContent += `pub const ${name}_PATH: &str = "${formattedValue}";\n`;
  }

  await fs.writeFile(outputPath, constantsContent);
}

async function main() {
  let targetTriple;

  // Get Rust target triple
  const rustInfo = (await execa("rustc", ["-vV"])).stdout;
  const match = /host: (\S+)/.exec(rustInfo);

  if (match) {
    targetTriple = match[1];
  } else {
    throw new Error("Failed to determine platform target triple");
  }

  const binDir = "src-tauri/static/bin";
  const outputDir = "src-tauri/release_sidecar";

  // Create the target directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  const constantsMap = new Map();

  // Copy binaries and generate constants
  await copyBinaries(binDir, outputDir, targetTriple, constantsMap);

  // Write the binary_path_gen.rs file based on the platform
  const outputPath = "src-tauri/src/binary_path_gen.rs";
  if (process.platform === "win32") {
    await writeConstantsWindows(constantsMap, outputPath);
  } else {
    await writeConstantsUnix(constantsMap, outputPath);
  }
}

main().catch((e) => { 
  throw e.message;
});
