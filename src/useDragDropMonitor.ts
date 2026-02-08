import { useCallback } from "react";
import { useDragDropContext } from "./DragDropProvider";
import type {
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
} from "./types";

interface UseDragDropMonitorOptions {
    onDragStart?: (event: DragStartEvent) => void;
    onDragMove?: (event: DragMoveEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    onDragOver?: (event: DragOverEvent) => void;
}

/**
 * Hook to monitor drag and drop events without being a draggable item.
 * Useful for updating external state based on drag operations.
 */
export function useDragDropMonitor(_options?: UseDragDropMonitorOptions) {
    const context = useDragDropContext();

    return {
        isDragging: context.state.isDragging,
        draggedId: context.state.draggedId,
        draggedIndex: context.state.draggedIndex,
        overIndex: context.state.overIndex,
        currentPosition: context.state.currentPosition,
    };
}

/**
 * Hook to get the current drag state.
 * Lighter weight than useDragDropMonitor when you don't need callbacks.
 */
export function useDragState() {
    const { state } = useDragDropContext();
    return state;
}

/**
 * Hook to imperatively control drag operations.
 */
export function useDragControls() {
    const { endDrag } = useDragDropContext();

    const cancel = useCallback(() => {
        endDrag(true);
    }, [endDrag]);

    const complete = useCallback(() => {
        endDrag(false);
    }, [endDrag]);

    return {
        cancel,
        complete,
    };
}
