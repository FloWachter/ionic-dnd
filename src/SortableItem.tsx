import React, { forwardRef, useMemo } from "react";
import { useSortable } from "./useSortable";

interface SortableItemProps {
    /** Unique identifier for the item */
    id: string;
    /** Index of the item in the list */
    index: number;
    /** Whether dragging is disabled for this item */
    disabled?: boolean;
    /** Content to render */
    children: React.ReactNode;
    /** Additional class names */
    className?: string;
    /** Custom styles */
    style?: React.CSSProperties;
    /** Render prop for custom rendering */
    render?: (props: {
        isDragging: boolean;
        isOver: boolean;
        transform: { x: number; y: number } | null;
        listeners: Record<string, any>;
        attributes: Record<string, any>;
    }) => React.ReactNode;
}

/**
 * Pre-built sortable item component.
 * Can be used directly or as a reference for custom implementations.
 */
export const SortableItem = forwardRef<HTMLDivElement, SortableItemProps>(({
    id,
    index,
    disabled = false,
    children,
    className = "",
    style,
    render,
}, forwardedRef) => {
    const {
        ref,
        handleRef,
        isDragging,
        isOver,
        transform,
        transition,
        attributes,
        listeners,
    } = useSortable({ id, index, disabled });

    const combinedRef = (node: HTMLDivElement | null) => {
        ref(node);
        if (typeof forwardedRef === "function") {
            forwardedRef(node);
        } else if (forwardedRef) {
            forwardedRef.current = node;
        }
    };

    const itemStyle = useMemo((): React.CSSProperties => ({
        ...style,
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 999 : 1,
        cursor: disabled ? "default" : isDragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
    }), [style, transform, transition, isDragging, disabled]);

    if (render) {
        return (
            <div
                ref={combinedRef}
                style={itemStyle}
                className={className}
                {...attributes}
                {...listeners}
            >
                {render({
                    isDragging,
                    isOver,
                    transform,
                    listeners,
                    attributes,
                })}
            </div>
        );
    }

    return (
        <div
            ref={combinedRef}
            style={itemStyle}
            className={`${className} ${
                isDragging ? "shadow-lg ring-2 ring-blue-400" : ""
            } ${isOver ? "ring-2 ring-green-400" : ""}`}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    );
});

SortableItem.displayName = "SortableItem";
