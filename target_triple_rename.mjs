import { execa } from "execa";
import fs from "fs/promises";
import path from "path";

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

  // Read the contents of the bin directory
  const files = await fs.readdir(binDir);

  // Prepare the content for binary_path_gen.rs
  let constantsContent = "// Auto-generated constants for copied binaries\n\n";
  const constantsMap = new Map();

  // Check existing binary_path_gen.rs for existing constants
  try {
    const existingContent = await fs.readFile("src-tauri/src/binary_path_gen.rs", "utf-8");
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

  // Copy each file and generate constants
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

    // Update or add the constant in the map
    constantsMap.set(constantBaseName, path.resolve(newPath));
  }

  // Build the new content for binary_path_gen.rs
  for (const [name, value] of constantsMap) {    
    // Format the value for Windows paths
    let formattedValue = value;
    if (process.platform === "win32") {
      formattedValue = value.replace(/\\/g, "\\\\");
    }

    // Add the constant path to the content
    constantsContent += `pub const ${name}_PATH: &str = "${formattedValue}";\n`;
  }

  // Write the binary_path_gen.rs file, overwriting existing content
  await fs.writeFile("src-tauri/src/binary_path_gen.rs", constantsContent);
}

main().catch((e) => { 
  throw e.message;
});
