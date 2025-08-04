# Draw.io Setup Instructions

## Common Issues and Solutions

### Blue Popup "Keep Undo History" When Opening .drawio Files

**Issue**: When opening `.drawio` files, VS Code shows a blue popup asking about undo history.

**Cause**: The draw.io extension modifies the file when opening, triggering VS Code's external change detection.

**Solutions**:
1. **Quick Fix**: Click "Reload from Disk" in the popup
2. **Automatic**: VS Code workspace settings are configured to handle this
3. **Manual**: You can always choose "Keep Undo History" if you've made recent changes

This is normal behavior and doesn't affect the functionality of your diagrams.

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
