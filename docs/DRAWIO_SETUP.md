# Draw.io Setup Instructions

## Common Issues and Solutions

### Blue Popup "Keep Undo History" When Opening .drawio Files

**Issue**: When opening `.drawio` files, VS Code shows a blue popup asking about undo history.

**What the popup looks like**:
- Blue notification bar at the top of the editor
- Text: "The file has been changed outside of the editor..."
- Buttons: Usually "Reload from Disk" and "Keep Undo History"

**If you don't see "Reload from Disk" button**:
1. **Look for these alternatives**:
   - "Reload" button
   - "Discard Changes" button
   - "Revert File" option
   
2. **Alternative solutions**:
   ```bash
   # Close VS Code completely
   # Restart VS Code
   # Or use Command Palette:
   ```
   - Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "File: Revert File" and press Enter
   - Or type "Developer: Reload Window" and press Enter

3. **Manual file refresh**:
   - Close the `.drawio` file tab
   - Reopen the file from the file explorer
   - This should refresh the file content

**Cause**: The draw.io extension modifies the file when opening, triggering VS Code's external change detection.

**Prevention**: The workspace settings are now configured to automatically reload draw.io files.

## How to Export Diagrams to Images

Since VS Code's draw.io extension requires manual export, here are the steps:

### Method 1: VS Code Extension Export

1. Open the `.drawio` file in VS Code
2. The draw.io editor should open automatically
3. Use the export function in the draw.io editor:
   - Click the export icon (📤) or use File > Export
   - Choose PNG format
   - Set appropriate resolution (300 DPI recommended)
   - Save to `docs/images/` directory

### Method 2: Command Line Export (if you have draw.io desktop)

```bash
# Install draw.io desktop app first, then:
drawio --export --format png --output docs/images/stop-architecture.png docs/diagrams/stop-architecture.drawio
```

### Method 3: Online Export

1. Open https://app.diagrams.net/
2. Open the `.drawio` file
3. File > Export as > PNG
4. Download and save to `docs/images/`

## Current Status

- ✅ Draw.io extension installed
- ✅ Directory structure created:
  - `docs/diagrams/` - for .drawio source files
  - `docs/images/` - for exported PNG images
- ✅ Example diagram created: `stop-architecture.drawio`
- ✅ Example documentation: `diagram-example.md`
- ⏳ PNG export needed (manual step)

## Next Steps

1. Open `docs/diagrams/stop-architecture.drawio` in VS Code
2. Export as PNG to `docs/images/stop-architecture.png`
3. The markdown file will then display the diagram correctly
