// Types for the ionic-dnd library

export interface Position {
    x: number;
    y: number;
}

export interface DragItem<T = unknown> {
    id: string;
    index: number;
    data: T;
}

export interface DragState {
    isDragging: boolean;
    draggedId: string | null;
    draggedIndex: number | null;
    overIndex: number | null;
    initialPosition: Position | null;
    currentPosition: Position | null;
    offset: Position | null;
}

export interface AutoScrollConfig {
    /** Enable auto-scrolling (default: true) */
    enabled: boolean;
    /** Threshold in pixels from edge to start scrolling (default: 80) */
    threshold: number;
    /** Maximum scroll speed in pixels per frame (default: 15) */
    maxSpeed: number;
    /** Acceleration factor (default: 1.5) */
    acceleration: number;
}

export interface DragDropContextConfig {
    /** Auto-scroll configuration */
    autoScroll?: Partial<AutoScrollConfig>;
    /** Delay in ms before drag starts (for touch) */
    activationDelay?: number;
    /** Distance in pixels before drag starts */
    activationDistance?: number;
    /** Enable haptic feedback on Capacitor (default: true) */
    hapticFeedback?: boolean;
    /** Lock axis during drag ('x' | 'y' | null) */
    lockAxis?: "x" | "y" | null;
}

export interface SortableItemConfig {
    /** Unique identifier for the item */
    id: string;
    /** Index of the item in the list */
    index: number;
    /** Whether the item is disabled */
    disabled?: boolean;
    /** Custom drag handle selector */
    handleSelector?: string;
}

export interface DragStartEvent<T = unknown> {
    item: DragItem<T>;
    event: PointerEvent | TouchEvent;
}

export interface DragMoveEvent<T = unknown> {
    item: DragItem<T>;
    position: Position;
    delta: Position;
}

export interface DragEndEvent<T = unknown> {
    item: DragItem<T>;
    fromIndex: number;
    toIndex: number;
    cancelled: boolean;
    /** Alias for fromIndex - the index of the dragged item */
    activeIndex: number;
    /** Alias for toIndex - the index where the item was dropped */
    overIndex: number;
}

export interface DragOverEvent<T = unknown> {
    item: DragItem<T>;
    overIndex: number;
    overItem: DragItem<T> | null;
}

export interface SortableContextValue {
    items: string[];
    activeId: string | null;
    activeIndex: number | null;
    overIndex: number | null;
    registerItem: (id: string, index: number, element: HTMLElement) => void;
    unregisterItem: (id: string) => void;
    getItemIndex: (id: string) => number;
}

export interface UseSortableReturn {
    /** Ref to attach to the sortable element */
    ref: React.RefCallback<HTMLElement>;
    /** Ref for the drag handle (optional, defaults to the element) */
    handleRef: React.RefCallback<HTMLElement>;
    /** Whether this item is currently being dragged */
    isDragging: boolean;
    /** Whether another item is being dragged over this one */
    isOver: boolean;
    /** Transform to apply during drag */
    transform: { x: number; y: number } | null;
    /** Transition style for animations */
    transition: string | undefined;
    /** Attributes to spread on the element */
    attributes: {
        role: string;
        tabIndex: number;
        "aria-roledescription": string;
        "aria-describedby": string;
        "data-sortable-id": string;
    };
    /** Listeners for drag events */
    listeners: {
        onPointerDown?: (e: React.PointerEvent) => void;
        onTouchStart?: (e: React.TouchEvent) => void;
        onKeyDown?: (e: React.KeyboardEvent) => void;
    };
}
