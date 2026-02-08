import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type {
    DragDropContextConfig,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
    DragState,
    Position,
} from "./types";
import { useAutoScroll } from "./useAutoScroll";

// Check if we're running on Capacitor
const isCapacitor = typeof (window as any)?.Capacitor !== "undefined";

// Haptic feedback helper
const triggerHaptic = async (type: "light" | "medium" | "heavy" = "medium") => {
    if (!isCapacitor) return;

    try {
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
        const style = type === "light"
            ? ImpactStyle.Light
            : type === "heavy"
            ? ImpactStyle.Heavy
            : ImpactStyle.Medium;
        await Haptics.impact({ style });
    } catch {
        // Haptics not available
    }
};

interface DragDropContextValue {
    state: DragState;
    config: Required<DragDropContextConfig>;
    registerItem: (id: string, index: number, element: HTMLElement) => void;
    unregisterItem: (id: string) => void;
    startDrag: (
        id: string,
        index: number,
        position: Position,
        element: HTMLElement,
    ) => void;
    updateDrag: (position: Position) => void;
    endDrag: (cancelled?: boolean) => void;
    getItemElement: (id: string) => HTMLElement | undefined;
    getItemIndex: (id: string) => number;
    items: Map<string, { index: number; element: HTMLElement }>;
    scrollOffset: { x: number; y: number };
}

const DragDropContext = createContext<DragDropContextValue | null>(null);

export function useDragDropContext() {
    const context = useContext(DragDropContext);
    if (!context) {
        throw new Error(
            "useDragDropContext must be used within a DragDropProvider",
        );
    }
    return context;
}

interface DragDropProviderProps {
    children: React.ReactNode;
    config?: DragDropContextConfig;
    onDragStart?: (event: DragStartEvent) => void;
    onDragMove?: (event: DragMoveEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    onDragOver?: (event: DragOverEvent) => void;
}

const DEFAULT_CONFIG: Required<DragDropContextConfig> = {
    autoScroll: {
        enabled: true,
        threshold: 80,
        maxSpeed: 15,
        acceleration: 1.5,
    },
    activationDelay: 150,
    activationDistance: 5,
    hapticFeedback: true,
    lockAxis: null,
};

export function DragDropProvider({
    children,
    config: userConfig,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragOver,
}: DragDropProviderProps) {
    const config = useMemo(() => ({
        ...DEFAULT_CONFIG,
        ...userConfig,
        autoScroll: { ...DEFAULT_CONFIG.autoScroll, ...userConfig?.autoScroll },
    }), [userConfig]);

    const [state, setState] = useState<DragState>({
        isDragging: false,
        draggedId: null,
        draggedIndex: null,
        overIndex: null,
        initialPosition: null,
        currentPosition: null,
        offset: null,
    });

    const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });

    const itemsRef = useRef<
        Map<string, { index: number; element: HTMLElement }>
    >(new Map());
    const draggedElementRef = useRef<HTMLElement | null>(null);
    const initialIndexRef = useRef<number | null>(null);

    // Callback to handle scroll delta during auto-scroll
    const handleScrollDelta = useCallback((delta: { x: number; y: number }) => {
        // Accumulate scroll offset using state to trigger re-renders
        setScrollOffset((prev) => ({
            x: prev.x + delta.x,
            y: prev.y + delta.y,
        }));
    }, []);

    const { initScrollContainer, updateScroll, stopScroll } = useAutoScroll(
        config.autoScroll,
        handleScrollDelta,
    );

    const registerItem = useCallback(
        (id: string, index: number, element: HTMLElement) => {
            itemsRef.current.set(id, { index, element });
        },
        [],
    );

    const unregisterItem = useCallback((id: string) => {
        itemsRef.current.delete(id);
    }, []);

    const getItemElement = useCallback((id: string) => {
        return itemsRef.current.get(id)?.element;
    }, []);

    const getItemIndex = useCallback((id: string) => {
        return itemsRef.current.get(id)?.index ?? -1;
    }, []);

    const findItemAtPosition = useCallback(
        (position: Position): { id: string; index: number } | null => {
            for (const [id, { index, element }] of itemsRef.current) {
                if (id === state.draggedId) continue;

                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Check if position is within the element bounds
                if (
                    position.x >= rect.left &&
                    position.x <= rect.right &&
                    position.y >= rect.top &&
                    position.y <= rect.bottom
                ) {
                    return { id, index };
                }
            }
            return null;
        },
        [state.draggedId],
    );

    const startDrag = useCallback(async (
        id: string,
        index: number,
        position: Position,
        element: HTMLElement,
    ) => {
        draggedElementRef.current = element;
        initialIndexRef.current = index;

        // Reset scroll offset tracking
        setScrollOffset({ x: 0, y: 0 });

        // Initialize scroll container
        await initScrollContainer(element);

        // Trigger haptic feedback
        if (config.hapticFeedback) {
            triggerHaptic("medium");
        }

        const rect = element.getBoundingClientRect();
        const offset = {
            x: position.x - rect.left,
            y: position.y - rect.top,
        };

        setState({
            isDragging: true,
            draggedId: id,
            draggedIndex: index,
            overIndex: index,
            initialPosition: position,
            currentPosition: position,
            offset,
        });

        onDragStart?.({
            item: { id, index, data: null },
            event: null as any,
        });
    }, [config.hapticFeedback, initScrollContainer, onDragStart]);

    const updateDrag = useCallback((position: Position) => {
        if (!state.isDragging) return;

        // Apply axis lock if configured
        let finalPosition = position;
        if (config.lockAxis === "x" && state.initialPosition) {
            finalPosition = { ...position, y: state.initialPosition.y };
        } else if (config.lockAxis === "y" && state.initialPosition) {
            finalPosition = { ...position, x: state.initialPosition.x };
        }

        // Update auto-scroll
        updateScroll(finalPosition);

        // Find item at current position
        const overItem = findItemAtPosition(finalPosition);
        const newOverIndex = overItem?.index ?? state.overIndex;

        // Trigger haptic on index change
        if (newOverIndex !== state.overIndex && config.hapticFeedback) {
            triggerHaptic("light");
        }

        setState((prev) => ({
            ...prev,
            currentPosition: finalPosition,
            overIndex: newOverIndex,
        }));

        onDragMove?.({
            item: {
                id: state.draggedId!,
                index: state.draggedIndex!,
                data: null,
            },
            position: finalPosition,
            delta: state.initialPosition
                ? {
                    x: finalPosition.x - state.initialPosition.x,
                    y: finalPosition.y - state.initialPosition.y,
                }
                : { x: 0, y: 0 },
        });

        if (overItem) {
            onDragOver?.({
                item: {
                    id: state.draggedId!,
                    index: state.draggedIndex!,
                    data: null,
                },
                overIndex: overItem.index,
                overItem: {
                    id: overItem.id,
                    index: overItem.index,
                    data: null,
                },
            });
        }
    }, [
        state.isDragging,
        state.initialPosition,
        state.overIndex,
        state.draggedId,
        state.draggedIndex,
        config.lockAxis,
        config.hapticFeedback,
        updateScroll,
        findItemAtPosition,
        onDragMove,
        onDragOver,
    ]);

    const endDrag = useCallback((cancelled = false) => {
        if (!state.isDragging) return;

        stopScroll();

        // Trigger haptic feedback
        if (config.hapticFeedback) {
            triggerHaptic("medium");
        }

        const fromIndex = initialIndexRef.current ?? state.draggedIndex ?? 0;
        const toIndex = cancelled ? fromIndex : (state.overIndex ?? fromIndex);

        onDragEnd?.({
            item: { id: state.draggedId!, index: fromIndex, data: null },
            fromIndex,
            toIndex,
            cancelled,
        });

        setState({
            isDragging: false,
            draggedId: null,
            draggedIndex: null,
            overIndex: null,
            initialPosition: null,
            currentPosition: null,
            offset: null,
        });

        draggedElementRef.current = null;
        initialIndexRef.current = null;
    }, [state, config.hapticFeedback, stopScroll, onDragEnd]);

    // Global event handlers for pointer/touch up and cancel
    useEffect(() => {
        if (!state.isDragging) return;

        const handlePointerUp = () => endDrag(false);
        const handlePointerCancel = () => endDrag(true);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                endDrag(true);
            }
        };

        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerCancel);
        window.addEventListener("touchend", handlePointerUp);
        window.addEventListener("touchcancel", handlePointerCancel);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerCancel);
            window.removeEventListener("touchend", handlePointerUp);
            window.removeEventListener("touchcancel", handlePointerCancel);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [state.isDragging, endDrag]);

    const value = useMemo<DragDropContextValue>(() => ({
        state,
        config,
        registerItem,
        unregisterItem,
        startDrag,
        updateDrag,
        endDrag,
        getItemElement,
        getItemIndex,
        items: itemsRef.current,
        scrollOffset,
    }), [
        state,
        config,
        registerItem,
        unregisterItem,
        startDrag,
        updateDrag,
        endDrag,
        getItemElement,
        getItemIndex,
        scrollOffset,
    ]);

    return (
        <DragDropContext.Provider value={value}>
            {children}
        </DragDropContext.Provider>
    );
}
