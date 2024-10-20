import fs from "fs/promises";
import path from "path";

// Set the current directory to the root of the workspace
const currentDirectory = path.resolve();

// Function to log messages to the log file
async function logMessage(message) {
  const logFilePath = path.join(currentDirectory, "log.txt");
  const timestamp = new Date().toISOString();
  await fs.appendFile(logFilePath, `[${timestamp}] ${message}\n`, "utf8");
}

async function updateToml() {
  try {
    // Read the TOML file
    const tomlFilePath = path.join(currentDirectory, "src-tauri", "diesel.toml");
    let data = await fs.readFile(tomlFilePath, "utf8");

    // Modify the specific line containing the migrations directory
    const migrationsDir = path.join(currentDirectory, "src-tauri", "migrations");
    const configLines = data.split("\n").map(line => {
      if (line.startsWith("dir =")) {
        // Ensure the path is correctly formatted for the OS
        return `dir = "${migrationsDir.replace(/\\/g, "/")}"`; // Use forward slashes for TOML
      }
      return line;
    });

    const modifiedContent = configLines.join("\n");

    // Log the modified content (optional)
    await logMessage("Modified content:\n" + modifiedContent);

    // Write the modified content back to the TOML file
    await fs.writeFile(tomlFilePath, modifiedContent);
    await logMessage("File updated successfully.");

  } catch (err) {
    await logMessage(`Error: ${err.message}`);
  }
}

updateToml();
