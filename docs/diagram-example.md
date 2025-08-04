# StOP Architecture Example

This document demonstrates how to use draw.io diagrams in your documentation.

## Overview

State Oriented Programming (StOP) is a paradigm that focuses on explicit state management and transformation. The following diagram illustrates the core architecture:

## Architecture Diagram

![StOP Architecture](./images/test.png)

*Figure 1: StOP Architecture Overview showing the flow from State Container through State Processor to State Transformer, with implementations in TypeScript and Kotlin*

> **Note**: If the image doesn't appear in VS Code's markdown preview, try:
> 1. Opening the markdown preview with `Cmd+Shift+V` (macOS) or `Ctrl+Shift+V` (Windows/Linux)
> 2. Right-clicking in the preview and selecting "Reload"
> 3. Using an absolute path or opening the image file directly to verify it exists

## Components

### Core Components

1. **State Container**: Holds the current state with metadata and timestamp
2. **State Processor**: Processes states according to StOP rules  
3. **State Transformer**: Transforms states using provided functions

### Implementations

- **TypeScript Implementation**: Located in `ts/packages/ts-stop/`
- **Kotlin Implementation**: Located in `kotlin/kotlin-stop/`

### Examples

Both implementations include working examples that demonstrate:
- Basic state processing
- State transformations
- Multiple instance management
- Cross-language compatibility (Java with Kotlin)

## Working with Draw.io Diagrams

### Creating Diagrams

1. Open the `.drawio` file in VS Code
2. The draw.io editor will launch automatically
3. Edit your diagram and save
4. Export as PNG to the `docs/images/` directory

### Embedding in Markdown

Use standard markdown image syntax with the correct relative path:

```markdown
![Alt text](./images/diagram-name.png)
```

**Path Notes:**
- From `docs/*.md` files: use `./images/filename.png`
- From root-level files: use `docs/images/filename.png`
- For subdirectories: adjust the relative path accordingly

### File Organization

- **Source diagrams**: `docs/diagrams/*.drawio`
- **Exported images**: `docs/images/*.png` 
- **Documentation**: `docs/*.md`

**Current Status:**
- ✅ Exported image: `docs/images/test.png` 
- ✅ Documentation: `docs/diagram-example.md`
- 🔄 Draw.io plugin: Reinstalled correctly

## Best Practices

1. **Naming**: Use descriptive names for both `.drawio` files and exported images
2. **Resolution**: Export at appropriate resolution for documentation needs
3. **Updates**: Always re-export images when updating diagrams
4. **Alt Text**: Provide meaningful alt text for accessibility

## Example Workflow

1. Create/edit diagram: `docs/diagrams/my-diagram.drawio`
2. Export as PNG: `docs/images/my-diagram.png`
3. Reference in docs: `![My Diagram](../images/my-diagram.png)`
4. Commit both files to git

This ensures your documentation stays synchronized with your diagrams.
