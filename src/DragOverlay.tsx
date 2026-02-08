import React, { useMemo } from "react";
import { useDragDropContext } from "./DragDropProvider";

interface DragOverlayProps {
    /** Content to render in the overlay (typically a clone of the dragged item) */
    children?: React.ReactNode;
    /** Custom render function that receives the dragged item's ID */
    render?: (draggedId: string | null) => React.ReactNode;
    /** Additional class names */
    className?: string;
    /** Custom styles */
    style?: React.CSSProperties;
    /** Z-index for the overlay */
    zIndex?: number;
    /** Whether to show a drop shadow */
    dropShadow?: boolean;
}

/**
 * Overlay component that follows the pointer during drag operations.
 * Use this to render a custom preview of the dragged item.
 */
export function DragOverlay({
    children,
    render,
    className = "",
    style,
    zIndex = 9999,
    dropShadow = true,
}: DragOverlayProps) {
    const { state } = useDragDropContext();
    const { isDragging, draggedId, currentPosition, offset } = state;

    const overlayStyle = useMemo((): React.CSSProperties => {
        if (!isDragging || !currentPosition) return { display: "none" };

        return {
            position: "fixed",
            top: 0,
            left: 0,
            transform: `translate3d(${
                currentPosition.x - (offset?.x || 0)
            }px, ${currentPosition.y - (offset?.y || 0)}px, 0)`,
            pointerEvents: "none",
            zIndex,
            boxShadow: dropShadow
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                : undefined,
            ...style,
        };
    }, [isDragging, currentPosition, offset, zIndex, dropShadow, style]);

    if (!isDragging) return null;

    const content = render ? render(draggedId) : children;

    return (
        <div className={className} style={overlayStyle}>
            {content}
        </div>
    );
}
