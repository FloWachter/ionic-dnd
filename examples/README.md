# Ionic DnD Examples

This folder contains example applications demonstrating how to use the
`@oyfora/ionic-dnd` library.

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. First, make sure the parent library is built:

```bash
cd ..
npm install
npm run build
```

2. Install the example dependencies:

```bash
cd examples
npm install
```

### Running the Examples

Start the development server:

```bash
npm run dev
```

The app will open at **http://localhost:3000**

## Available Examples

### 1. Simple Sortable List

**Route:** `/simple-list`

A basic drag and drop list showing how to reorder items. Demonstrates:

- `DragDropProvider` setup
- `useSortable` hook usage
- `arrayMove` utility for reordering

### 2. Media Grid

**Route:** `/media-grid`

A profile photo grid with different sized items. Demonstrates:

- Grid layout with drag and drop
- Multiple item sizes (small, medium, large)
- Resize mode toggle

### 3. Drag Handle Example

**Route:** `/handle-example`

Cards that can only be dragged via a specific handle button. Demonstrates:

- Separating `ref` from `listeners` for handle-based dragging
- Resize button with size cycling
- Action sheet integration for more options

## Development

The examples are set up to use the library source directly (not the built
version). This means any changes you make to the library in `../src` will be
immediately reflected in the examples with hot reload.

This is configured in `vite.config.ts`:

```ts
resolve: {
  alias: {
    '@oyfora/ionic-dnd': path.resolve(__dirname, '../src'),
  },
},
```

## Project Structure

```
examples/
├── src/
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   ├── styles.css        # Custom styles
│   └── pages/
│       ├── Home.tsx          # Landing page with example list
│       ├── SimpleList.tsx    # Basic sortable list
│       ├── MediaGrid.tsx     # Photo grid example
│       └── HandleExample.tsx # Drag handle example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Troubleshooting

### Port already in use

If port 3000 is in use, Vite will automatically try the next available port
(3001, 3002, etc.).

### Module not found errors

Make sure you've built the parent library first:

```bash
cd ..
npm run build
```

### Touch/drag not working on mobile

Ensure you're testing in a touch-enabled environment. Use Chrome DevTools device
emulation for testing on desktop.
