# QuickArrays

QuickArrays is a web-based tool for visualizing and generating data structures and factorizations for stringology research. 
It provides an interactive interface for exploring various string algorithms, generating test strings (like Fibonacci and Tribonacci words), 
and computing data structures such as border arrays, suffix arrays, and various string factorizations.

The website is publicly available at [quickarrays.github.io](https://quickarrays.github.io/).

## Repository Structure

```
quickarrays-dev/
├── src/                      # Source files
│   ├── algorithm.ts          # String algorithm implementations
│   ├── generator.ts          # String generator implementations
│   ├── utility.ts            # Utility functions
│   ├── algorithm.py          # Build script for algorithm pipelines
│   ├── generator.py          # Build script for generator pipelines
│   ├── citation.py           # Build script for citations
│   ├── tutorial.py           # Build script for tutorials
│   ├── skeleton.py           # HTML skeleton builder
│   ├── standalone.py         # Standalone HTML builder
│   ├── compile_javascript.py # JavaScript concatenation script
│   ├── external.py           # External dependency downloader
│   ├── skeleton.html         # HTML template
│   ├── references.bib        # Bibliography
│   └── jest.test.ts          # Test file
├── assets/                   # Static assets
│   ├── qa.css                # Main stylesheet
│   ├── webpage.js            # Web page logic
│   ├── ds_list.js            # Data structure list
│   ├── counter_list.js       # Counter list
│   └── text_opt_element.js   # option element
├── build/                    # Build artifacts (generated)
│   ├── js/gen/               # Generated JavaScript from TypeScript
│   ├── js/ext/               # External JavaScript libraries
│   ├── js/                   # Asset JavaScript files
│   ├── css/                  # CSS files
│   └── index.html            # Standalone HTML with inlined resources
├── dist/                     # Development build output (generated)
│   └── index.html            # Parcel-built distribution
├── Makefile                  # Build system
├── package.json              # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
├── babel.config.json         # Babel configuration
└── jest.config.js            # Jest test configuration
```

## Requirements

### Required
- **Node.js 20+**: JavaScript runtime for build tools and development
- **Python 3.12+**: Required for build scripts that generate pipeline files
- **Make**: Build automation tool
- **npm**: Node package manager (comes with Node.js)

### Optional
- **pandoc**: Required only for generating citations from bibliography

## Building the Project

### Initial Setup

1. Install dependencies:
```bash
npm install
```

### Build Commands

Build everything (development + production):
```bash
make
```

This executes the following build pipeline:
1. **TypeScript → JavaScript**: Compiles TypeScript files (`src/*.ts`) to JavaScript using Babel
2. **Generate Pipeline Files**: Python scripts (`algorithm.py`, `generator.py`) parse TypeScript annotations to create algorithm and generator pipeline JavaScript
3. **Generate Tutorials**: Extracts tutorial information from TypeScript annotations
4. **Generate Citations**: Creates citation JavaScript from `references.bib` (requires pandoc, optional)
5. **Download External Libraries**: Fetches external JavaScript libraries (jQuery, MathJax, Sortable)
6. **Build HTML**: Assembles HTML by inlining generated fragments into `skeleton.html`
7. **Compile JavaScript**: Concatenates all JavaScript files into single `generated.js`
8. **Standalone Build**: Creates `build/index.html` with inlined CSS and JavaScript
9. **Production Build**: Uses Parcel to bundle and optimize into `dist/index.html`

### Development

#### Type Checking
```bash
make check
```
Runs TypeScript compiler in check mode to verify types without emitting files.

#### Testing
```bash
make test
```
Runs Jest tests on TypeScript source files.

#### Cleaning Build Artifacts
```bash
make clean
```
Removes `build/` and `dist/` directories.

### Build Outputs

- **`build/`**: Contains intermediate build artifacts and the standalone HTML file (`build/index.html`)
- **`dist/`**: Contains the final optimized production build created by Parcel (`dist/index.html`)

