# QuickArrays

QuickArrays is a web-based tool for visualizing and generating data structures and factorizations for stringology research.

## Repository Structure

...

## Build System

 - call `npm install` and then `make`

### Build Workflow

1. **TypeScript → JavaScript**: Compile TypeScript files using Babel
2. **Generate Pipeline Files**: Python scripts process TypeScript to create algorithm/generator pipelines
3. **Generate Tutorials**: Extract tutorial information from TypeScript annotations
4. **Generate Citations**: Create citation JavaScript (requires pandoc, optional)
5. **Build HTML**: Inline generated HTML fragments into skeleton template
6. **Compile JavaScript**: Concatenate all JavaScript into single file
7. **Development Build**: Copy files to `dist/` directory
8. **Production Build**: Inline all CSS and JavaScript into standalone HTML in `docs/`

## Development

### Prerequisites
- Node.js 20+
- Python 3.12+
- Make

### Testing

```bash
# Run type checking
make check

# Run tests
make test
```

### Cleaning

```bash
# Clean build artifacts (keeps docs/)
make clean
```

