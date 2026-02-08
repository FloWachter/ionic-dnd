import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDragDropContext } from "./DragDropProvider";
import type { Position, UseSortableReturn } from "./types";

interface UseSortableOptions {
    /** Unique identifier for the sortable item */
    id: string;
    /** Index of the item in the list */
    index: number;
    /** Whether dragging is disabled */
    disabled?: boolean;
    /** Custom transition duration in ms */
    transitionDuration?: number;
}

export function useSortable({
    id,
    index,
    disabled = false,
    transitionDuration = 200,
}: UseSortableOptions): UseSortableReturn {
    const context = useDragDropContext();
    const {
        state,
        config,
        registerItem,
        unregisterItem,
        startDrag,
        updateDrag,
        scrollOffset,
    } = context;

    const elementRef = useRef<HTMLElement | null>(null);
    const handleElementRef = useRef<HTMLElement | null>(null);
    const activationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const startPositionRef = useRef<Position | null>(null);
    const isActivatedRef = useRef(false);

    const [localTransform, setLocalTransform] = useState<
        { x: number; y: number } | null
    >(null);

    const isDragging = state.draggedId === id;
    const isOver = state.overIndex === index && state.draggedId !== id;
    const isAnotherDragging = state.isDragging && state.draggedId !== id;

    // Register/unregister on mount/unmount
    useEffect(() => {
        if (elementRef.current) {
            registerItem(id, index, elementRef.current);
        }
        return () => {
            unregisterItem(id);
        };
    }, [id, index, registerItem, unregisterItem]);

    // Update registration when index changes
    useEffect(() => {
        if (elementRef.current) {
            registerItem(id, index, elementRef.current);
        }
    }, [id, index, registerItem]);

    // Calculate transform for displacement during drag
    useEffect(() => {
        if (!isAnotherDragging || !elementRef.current) {
            setLocalTransform(null);
            return;
        }

        const draggedIndex = state.draggedIndex!;
        const overIndex = state.overIndex ?? draggedIndex;

        // Determine if this item should be displaced
        let shouldDisplace = false;
        let direction = 0;

        if (draggedIndex < overIndex) {
            // Dragging down: items between dragged and over should move up
            if (index > draggedIndex && index <= overIndex) {
                shouldDisplace = true;
                direction = -1;
            }
        } else if (draggedIndex > overIndex) {
            // Dragging up: items between over and dragged should move down
            if (index >= overIndex && index < draggedIndex) {
                shouldDisplace = true;
                direction = 1;
            }
        }

        if (shouldDisplace && elementRef.current) {
            // Get height of dragged element for displacement
            const draggedElement = context.getItemElement(state.draggedId!);
            if (draggedElement) {
                const height = draggedElement.offsetHeight;
                setLocalTransform({ x: 0, y: direction * (height + 16) }); // 16px for gap
            }
        } else {
            setLocalTransform(null);
        }
    }, [
        isAnotherDragging,
        state.draggedIndex,
        state.overIndex,
        state.draggedId,
        index,
        context,
    ]);

    // Calculate transform for the dragged element
    const dragTransform = useMemo(() => {
        if (!isDragging || !state.currentPosition || !state.initialPosition) {
            return null;
        }
        // Apply scroll offset compensation to keep the element under the pointer
        return {
            x: state.currentPosition.x - state.initialPosition.x +
                scrollOffset.x,
            y: state.currentPosition.y - state.initialPosition.y +
                scrollOffset.y,
        };
    }, [
        isDragging,
        state.currentPosition,
        state.initialPosition,
        scrollOffset,
    ]);

    const transform = isDragging ? dragTransform : localTransform;

    const transition = useMemo(() => {
        if (isDragging) {
            return undefined; // No transition while dragging for responsiveness
        }
        if (isAnotherDragging) {
            return `transform ${transitionDuration}ms ease`;
        }
        return undefined;
    }, [isDragging, isAnotherDragging, transitionDuration]);

    // Pointer/touch handlers
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (disabled) return;

        // Only handle primary button or touch
        if (e.pointerType === "mouse" && e.button !== 0) return;

        const position = { x: e.clientX, y: e.clientY };
        startPositionRef.current = position;
        isActivatedRef.current = false;

        // Set up activation with delay
        activationTimeoutRef.current = setTimeout(() => {
            if (elementRef.current && startPositionRef.current) {
                isActivatedRef.current = true;
                startDrag(
                    id,
                    index,
                    startPositionRef.current,
                    elementRef.current,
                );
            }
        }, config.activationDelay);

        // Prevent text selection and context menu
        e.preventDefault();
    }, [disabled, id, index, config.activationDelay, startDrag]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        const position = { x: e.clientX, y: e.clientY };

        // Check for early activation via distance
        if (
            startPositionRef.current && !isActivatedRef.current &&
            activationTimeoutRef.current
        ) {
            const distance = Math.sqrt(
                Math.pow(position.x - startPositionRef.current.x, 2) +
                    Math.pow(position.y - startPositionRef.current.y, 2),
            );

            if (distance >= config.activationDistance) {
                clearTimeout(activationTimeoutRef.current);
                activationTimeoutRef.current = null;
                isActivatedRef.current = true;

                if (elementRef.current) {
                    startDrag(
                        id,
                        index,
                        startPositionRef.current,
                        elementRef.current,
                    );
                }
            }
        }

        if (isActivatedRef.current) {
            updateDrag(position);
        }
    }, [id, index, config.activationDistance, startDrag, updateDrag]);

    const handlePointerUp = useCallback(() => {
        if (activationTimeoutRef.current) {
            clearTimeout(activationTimeoutRef.current);
            activationTimeoutRef.current = null;
        }
        startPositionRef.current = null;
        isActivatedRef.current = false;
    }, []);

    // Touch handlers for better mobile support
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled || e.touches.length !== 1) return;

        const touch = e.touches[0];
        const position = { x: touch.clientX, y: touch.clientY };
        startPositionRef.current = position;
        isActivatedRef.current = false;

        activationTimeoutRef.current = setTimeout(() => {
            if (elementRef.current && startPositionRef.current) {
                isActivatedRef.current = true;
                startDrag(
                    id,
                    index,
                    startPositionRef.current,
                    elementRef.current,
                );
            }
        }, config.activationDelay);
    }, [disabled, id, index, config.activationDelay, startDrag]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (activationTimeoutRef.current) {
                clearTimeout(activationTimeoutRef.current);
            }
        };
    }, []);

    // Global pointer move handler when dragging
    useEffect(() => {
        if (!isDragging) return;

        const handleGlobalPointerMove = (e: PointerEvent) => {
            updateDrag({ x: e.clientX, y: e.clientY });
        };

        const handleGlobalTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                updateDrag({ x: touch.clientX, y: touch.clientY });
            }
        };

        window.addEventListener("pointermove", handleGlobalPointerMove);
        window.addEventListener("touchmove", handleGlobalTouchMove, {
            passive: false,
        });

        return () => {
            window.removeEventListener("pointermove", handleGlobalPointerMove);
            window.removeEventListener("touchmove", handleGlobalTouchMove);
        };
    }, [isDragging, updateDrag]);

    // Keyboard handler for accessibility
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (disabled) return;
        // TODO: Implement keyboard navigation
    }, [disabled]);

    const ref = useCallback((node: HTMLElement | null) => {
        elementRef.current = node;
        if (node) {
            registerItem(id, index, node);
        }
    }, [id, index, registerItem]);

    const handleRef = useCallback((node: HTMLElement | null) => {
        handleElementRef.current = node;
    }, []);

    const attributes = useMemo(() => ({
        role: "listitem",
        tabIndex: disabled ? -1 : 0,
        "aria-roledescription": "sortable",
        "aria-describedby": `sortable-${id}-description`,
        "data-sortable-id": id,
    }), [id, disabled]);

    const listeners = useMemo(() => ({
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerUp,
        onTouchStart: handleTouchStart,
        onKeyDown: handleKeyDown,
    }), [
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleTouchStart,
        handleKeyDown,
    ]);

    return {
        ref,
        handleRef,
        isDragging,
        isOver,
        transform,
        transition,
        attributes,
        listeners,
    };
}
