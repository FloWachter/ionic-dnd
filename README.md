# @oyfora/ionic-dnd

A lightweight, performant drag and drop library specifically designed for
**Ionic React** applications with **Capacitor** support. Features include
auto-scrolling that works with IonContent's shadow DOM, haptic feedback on
mobile, and smooth animations.

## Features

- 🚀 **Optimized for Ionic** - Works seamlessly with IonContent, IonList, and
  other Ionic components
- 📱 **Capacitor Ready** - Built-in haptic feedback and touch optimization for
  mobile apps
- 🎨 **Tailwind Friendly** - Designed to work with Tailwind CSS classes
- 📜 **Auto-Scroll** - Intelligent auto-scrolling that works with IonContent's
  shadow DOM
- ⚡ **Performant** - Uses CSS transforms and requestAnimationFrame for smooth
  60fps animations
- 🎯 **TypeScript First** - Full TypeScript support with comprehensive types
- 🔧 **Flexible** - Use pre-built components or hooks for custom implementations

## Installation

```bash
npm install @oyfora/ionic-dnd
# or
yarn add @oyfora/ionic-dnd
# or
pnpm add @oyfora/ionic-dnd
```

### Peer Dependencies

```bash
npm install react react-dom @ionic/react
```

### Optional (for haptic feedback)

```bash
npm install @capacitor/haptics
npx cap sync
```

## Quick Start

### Basic Sortable List

```tsx
import React, { useState } from "react";
import { IonContent, IonList, IonPage } from "@ionic/react";
import {
    arrayMove,
    DragDropProvider,
    DragEndEvent,
    SortableItem,
} from "@oyfora/ionic-dnd";

function SortableList() {
    const [items, setItems] = useState([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
        { id: "3", name: "Item 3" },
    ]);

    const handleDragEnd = (event: DragEndEvent) => {
        if (!event.cancelled && event.fromIndex !== event.toIndex) {
            setItems(arrayMove(items, event.fromIndex, event.toIndex));
        }
    };

    return (
        <IonPage>
            <IonContent>
                <DragDropProvider onDragEnd={handleDragEnd}>
                    <IonList>
                        {items.map((item, index) => (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                index={index}
                                className="p-4 bg-white border-b"
                            >
                                {item.name}
                            </SortableItem>
                        ))}
                    </IonList>
                </DragDropProvider>
            </IonContent>
        </IonPage>
    );
}
```

### Custom Sortable with useSortable Hook

```tsx
import React from "react";
import { useSortable } from "@oyfora/ionic-dnd";

interface MyItemProps {
    id: string;
    index: number;
    children: React.ReactNode;
}

function MyItem({ id, index, children }: MyItemProps) {
    const {
        ref,
        handleRef,
        isDragging,
        isOver,
        transform,
        transition,
        attributes,
        listeners,
    } = useSortable({ id, index });

    const style: React.CSSProperties = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: "none",
    };

    return (
        <div
            ref={ref}
            style={style}
            className={`p-4 rounded-lg ${isDragging ? "shadow-xl" : ""}`}
            {...attributes}
            {...listeners}
        >
            {/* Optional: Separate drag handle */}
            <div ref={handleRef} className="cursor-grab">
                ☰
            </div>
            {children}
        </div>
    );
}
```

### Grid Layout

```tsx
import {
    arrayMove,
    DragDropProvider,
    SortableContainer,
    SortableItem,
} from "@oyfora/ionic-dnd";

function SortableGrid() {
    const [items, setItems] = useState(["1", "2", "3", "4", "5", "6"]);

    return (
        <DragDropProvider
            onDragEnd={(e) => {
                if (!e.cancelled) {
                    setItems(arrayMove(items, e.fromIndex, e.toIndex));
                }
            }}
        >
            <SortableContainer
                items={items}
                strategy="grid"
                columns={3}
                className="gap-4 p-4"
            >
                {items.map((id, index) => (
                    <SortableItem
                        key={id}
                        id={id}
                        index={index}
                        className="aspect-square bg-blue-500 rounded-lg flex items-center justify-center text-white"
                    >
                        {id}
                    </SortableItem>
                ))}
            </SortableContainer>
        </DragDropProvider>
    );
}
```

## Configuration

### DragDropProvider Options

```tsx
<DragDropProvider
    config={{
        // Auto-scroll settings
        autoScroll: {
            enabled: true, // Enable/disable auto-scroll
            threshold: 80, // Pixels from edge to start scrolling
            maxSpeed: 15, // Maximum scroll speed
            acceleration: 1.5, // Speed acceleration factor
        },
        // Activation settings
        activationDelay: 150, // ms delay before drag starts (prevents accidental drags)
        activationDistance: 5, // pixels to move before drag starts
        // Features
        hapticFeedback: true, // Enable haptic feedback on Capacitor
        lockAxis: null, // Lock to 'x', 'y', or null for free movement
    }}
    onDragStart={(event) => console.log("Started", event)}
    onDragMove={(event) => console.log("Moving", event)}
    onDragEnd={(event) => console.log("Ended", event)}
    onDragOver={(event) => console.log("Over", event)}
>
    {/* Your sortable content */}
</DragDropProvider>;
```

### useSortable Options

```tsx
const sortable = useSortable({
    id: "unique-id", // Required: unique identifier
    index: 0, // Required: position in list
    disabled: false, // Optional: disable dragging
    transitionDuration: 200, // Optional: animation duration in ms
});
```

## API Reference

### Hooks

#### `useSortable(options)`

Main hook for creating sortable items.

Returns:

- `ref` - Ref to attach to the sortable element
- `handleRef` - Ref for optional drag handle
- `isDragging` - Whether this item is being dragged
- `isOver` - Whether another item is being dragged over this one
- `transform` - Current transform offset `{ x, y }`
- `transition` - CSS transition string
- `attributes` - Accessibility attributes
- `listeners` - Event listeners to spread on the element

#### `useDragDropMonitor()`

Monitor drag state without being a draggable.

Returns:

- `isDragging` - Whether any drag is in progress
- `draggedId` - ID of the dragged item
- `draggedIndex` - Index of the dragged item
- `overIndex` - Index being hovered over
- `currentPosition` - Current pointer position

#### `useDragControls()`

Imperatively control drag operations.

Returns:

- `cancel()` - Cancel the current drag
- `complete()` - Complete the current drag

#### `useAutoScroll(config)`

Low-level hook for auto-scroll functionality.

### Components

#### `<DragDropProvider>`

Context provider for drag and drop functionality.

#### `<SortableContainer>`

Container component for sortable items with layout options.

#### `<SortableItem>`

Pre-built sortable item component.

#### `<DragOverlay>`

Overlay component for custom drag previews.

### Utilities

#### `arrayMove(array, fromIndex, toIndex)`

Reorder items in an array.

#### `arrayInsert(array, index, item)`

Insert an item at a specific index.

#### `arrayRemove(array, index)`

Remove an item at a specific index.

## TypeScript

All types are exported and fully documented:

```tsx
import type {
    AutoScrollConfig,
    DragDropContextConfig,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
    UseSortableReturn,
} from "@oyfora/ionic-dnd";
```

## Browser Support

- Chrome/Edge 80+
- Safari 13+
- Firefox 75+
- iOS Safari 13+
- Chrome for Android 80+

## License

MIT © Oyfora
