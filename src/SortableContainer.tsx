import React, { createContext, useCallback, useContext, useMemo } from "react";

interface SortableContainerContextValue {
    items: string[];
    strategy: "vertical" | "horizontal" | "grid";
    columns?: number;
}

const SortableContainerContext = createContext<
    SortableContainerContextValue | null
>(null);

export function useSortableContainer() {
    return useContext(SortableContainerContext);
}

interface SortableContainerProps {
    children: React.ReactNode;
    /** Array of item IDs in order */
    items: string[];
    /** Layout strategy */
    strategy?: "vertical" | "horizontal" | "grid";
    /** Number of columns for grid layout */
    columns?: number;
    /** Additional class names */
    className?: string;
    /** Custom styles */
    style?: React.CSSProperties;
}

/**
 * Container component for sortable items.
 * Provides context for layout strategy and item order.
 */
export function SortableContainer({
    children,
    items,
    strategy = "vertical",
    columns,
    className = "",
    style,
}: SortableContainerProps) {
    const value = useMemo(() => ({
        items,
        strategy,
        columns,
    }), [items, strategy, columns]);

    const containerStyle = useMemo((): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            position: "relative",
            ...style,
        };

        if (strategy === "grid" && columns) {
            return {
                ...baseStyle,
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
            };
        }

        if (strategy === "horizontal") {
            return {
                ...baseStyle,
                display: "flex",
                flexDirection: "row",
            };
        }

        return {
            ...baseStyle,
            display: "flex",
            flexDirection: "column",
        };
    }, [strategy, columns, style]);

    return (
        <SortableContainerContext.Provider value={value}>
            <div className={className} style={containerStyle}>
                {children}
            </div>
        </SortableContainerContext.Provider>
    );
}

/**
 * Utility function to reorder items after a drag operation
 */
export function arrayMove<T>(
    array: T[],
    fromIndex: number,
    toIndex: number,
): T[] {
    const newArray = [...array];
    const [removed] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, removed);
    return newArray;
}

/**
 * Utility function to insert an item at a specific index
 */
export function arrayInsert<T>(array: T[], index: number, item: T): T[] {
    const newArray = [...array];
    newArray.splice(index, 0, item);
    return newArray;
}

/**
 * Utility function to remove an item at a specific index
 */
export function arrayRemove<T>(array: T[], index: number): T[] {
    const newArray = [...array];
    newArray.splice(index, 1);
    return newArray;
}
