import os

# Set the current directory to the root of the workspace
# Assuming this script is located somewhere under the workspace
current_directory = os.path.abspath(os.path.join(os.path.dirname(__file__)))

# Read the TOML file
with open('src-tauri/diesel.toml', 'r') as file:
    config_content = file.readlines()

# Modify the specific line containing the migrations directory
for i, line in enumerate(config_content):
    if line.startswith('dir ='):
        # Replace the static path with the dynamic current directory path
        config_content[i] = f'dir = "{os.path.join(current_directory, "src-tauri", "migrations")}"\n'

# Optionally, print the modified content or save it back to a file
print(''.join(config_content))

with open('src-tauri/diesel.toml', 'w') as file:
    file.writelines(config_content)