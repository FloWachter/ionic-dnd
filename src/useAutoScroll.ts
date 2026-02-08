import { useCallback, useEffect, useRef } from "react";
import type { AutoScrollConfig, Position } from "./types";

// Type for IonContent element with getScrollElement method
interface IonContentElement extends HTMLElement {
    getScrollElement(): Promise<HTMLElement>;
}

const DEFAULT_CONFIG: AutoScrollConfig = {
    enabled: true,
    threshold: 80,
    maxSpeed: 15,
    acceleration: 1.5,
};

interface ScrollableElement {
    element: HTMLElement | null;
    scrollElement: HTMLElement | Element | null;
}

/**
 * Hook to handle auto-scrolling during drag operations.
 * Specifically designed to work with IonContent's shadow DOM.
 */
export function useAutoScroll(
    config: Partial<AutoScrollConfig> = {},
    onScrollDelta?: (delta: { x: number; y: number }) => void,
) {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const scrollableRef = useRef<ScrollableElement>({
        element: null,
        scrollElement: null,
    });
    const animationFrameRef = useRef<number | null>(null);
    const isScrollingRef = useRef(false);
    const scrollSpeedRef = useRef({ x: 0, y: 0 });
    const lastScrollPositionRef = useRef({ x: 0, y: 0 });

    /**
     * Find the scrollable element, including IonContent's shadow DOM scroll container
     */
    const findScrollableElement = useCallback(
        (element: HTMLElement | null): ScrollableElement => {
            if (!element) return { element: null, scrollElement: null };

            let current: HTMLElement | null = element;

            while (current) {
                // Check for IonContent specifically
                if (current.tagName === "ION-CONTENT") {
                    // IonContent uses shadow DOM, try to get the scroll element
                    const ionContent = current as IonContentElement;

                    // Use getScrollElement() if available (async but we'll handle it)
                    if (typeof ionContent.getScrollElement === "function") {
                        return { element: current, scrollElement: null }; // Will be resolved async
                    }

                    // Fallback: try to find scroll container in shadow root
                    const shadowRoot = current.shadowRoot;
                    if (shadowRoot) {
                        const scrollContainer =
                            shadowRoot.querySelector(".inner-scroll") ||
                            shadowRoot.querySelector('[part="scroll"]') ||
                            shadowRoot.querySelector("main");
                        if (scrollContainer) {
                            return {
                                element: current,
                                scrollElement: scrollContainer,
                            };
                        }
                    }

                    return { element: current, scrollElement: current };
                }

                // Check for regular scrollable elements
                const style = window.getComputedStyle(current);
                const overflowY = style.overflowY;
                const overflowX = style.overflowX;

                if (
                    (overflowY === "auto" || overflowY === "scroll" ||
                        overflowX === "auto" || overflowX === "scroll") &&
                    (current.scrollHeight > current.clientHeight ||
                        current.scrollWidth > current.clientWidth)
                ) {
                    return { element: current, scrollElement: current };
                }

                current = current.parentElement;
            }

            // Fallback to document
            return {
                element: document.documentElement,
                scrollElement: document.documentElement,
            };
        },
        [],
    );

    /**
     * Initialize the scroll container for a given element
     */
    const initScrollContainer = useCallback(
        async (element: HTMLElement | null) => {
            const result = findScrollableElement(element);

            // Handle IonContent async scroll element
            if (
                result.element?.tagName === "ION-CONTENT" &&
                !result.scrollElement
            ) {
                try {
                    const ionContent = result.element as IonContentElement;
                    const scrollElement = await ionContent.getScrollElement();
                    scrollableRef.current = {
                        element: result.element,
                        scrollElement,
                    };
                    // Track initial scroll position
                    lastScrollPositionRef.current = {
                        x: scrollElement.scrollLeft,
                        y: scrollElement.scrollTop,
                    };
                } catch {
                    scrollableRef.current = result;
                }
            } else {
                scrollableRef.current = result;
                // Track initial scroll position
                if (
                    result.scrollElement && "scrollTop" in result.scrollElement
                ) {
                    lastScrollPositionRef.current = {
                        x: (result.scrollElement as HTMLElement).scrollLeft,
                        y: (result.scrollElement as HTMLElement).scrollTop,
                    };
                }
            }
        },
        [findScrollableElement],
    );

    /**
     * Calculate scroll speed based on pointer position
     */
    const calculateScrollSpeed = useCallback(
        (position: Position): { x: number; y: number } => {
            const scrollElement = scrollableRef.current.scrollElement;
            if (!scrollElement || !mergedConfig.enabled) return { x: 0, y: 0 };

            const htmlElement = scrollElement as HTMLElement;
            const rect = htmlElement.getBoundingClientRect?.() ||
                {
                    top: 0,
                    left: 0,
                    bottom: window.innerHeight,
                    right: window.innerWidth,
                };

            let speedX = 0;
            let speedY = 0;
            const { threshold, maxSpeed, acceleration } = mergedConfig;

            // Use the visible area of the scroll container (clamped to viewport)
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(window.innerHeight, rect.bottom);
            const visibleLeft = Math.max(0, rect.left);
            const visibleRight = Math.min(window.innerWidth, rect.right);

            // Check if we can actually scroll in each direction
            const canScrollUp = htmlElement.scrollTop > 0;
            const canScrollDown =
                htmlElement.scrollTop <
                    (htmlElement.scrollHeight - htmlElement.clientHeight);
            const canScrollLeft = htmlElement.scrollLeft > 0;
            const canScrollRight =
                htmlElement.scrollLeft <
                    (htmlElement.scrollWidth - htmlElement.clientWidth);

            // Top edge - check distance from the visible top of the scroll container
            const distanceFromTop = position.y - visibleTop;
            if (distanceFromTop < threshold && canScrollUp) {
                // Use max(0, distance) for intensity calc but allow triggering even when negative
                const intensity = distanceFromTop <= 0
                    ? 1
                    : 1 - (distanceFromTop / threshold);
                speedY = -Math.min(
                    maxSpeed,
                    Math.max(0.1, intensity) * maxSpeed * acceleration,
                );
            }

            // Bottom edge
            const distanceFromBottom = visibleBottom - position.y;
            if (distanceFromBottom < threshold && canScrollDown) {
                const intensity = distanceFromBottom <= 0
                    ? 1
                    : 1 - (distanceFromBottom / threshold);
                speedY = Math.min(
                    maxSpeed,
                    Math.max(0.1, intensity) * maxSpeed * acceleration,
                );
            }

            // Left edge
            const distanceFromLeft = position.x - visibleLeft;
            if (distanceFromLeft < threshold && canScrollLeft) {
                const intensity = distanceFromLeft <= 0
                    ? 1
                    : 1 - (distanceFromLeft / threshold);
                speedX = -Math.min(
                    maxSpeed,
                    Math.max(0.1, intensity) * maxSpeed * acceleration,
                );
            }

            // Right edge
            const distanceFromRight = visibleRight - position.x;
            if (distanceFromRight < threshold && canScrollRight) {
                const intensity = distanceFromRight <= 0
                    ? 1
                    : 1 - (distanceFromRight / threshold);
                speedX = Math.min(
                    maxSpeed,
                    Math.max(0.1, intensity) * maxSpeed * acceleration,
                );
            }

            return { x: speedX, y: speedY };
        },
        [mergedConfig],
    );

    /**
     * Perform the scroll animation and notify about scroll delta
     */
    const performScroll = useCallback(() => {
        const scrollElement = scrollableRef.current.scrollElement;
        if (!scrollElement || !isScrollingRef.current) return;

        const { x, y } = scrollSpeedRef.current;

        if (x !== 0 || y !== 0) {
            if ("scrollBy" in scrollElement) {
                const htmlElement = scrollElement as HTMLElement;
                const beforeScrollX = htmlElement.scrollLeft;
                const beforeScrollY = htmlElement.scrollTop;

                htmlElement.scrollBy({ left: x, top: y });

                // Calculate actual scroll delta (might be less if hitting bounds)
                const actualDeltaX = htmlElement.scrollLeft - beforeScrollX;
                const actualDeltaY = htmlElement.scrollTop - beforeScrollY;

                // Notify about scroll delta so drag position can compensate
                if (
                    (actualDeltaX !== 0 || actualDeltaY !== 0) && onScrollDelta
                ) {
                    onScrollDelta({ x: actualDeltaX, y: actualDeltaY });
                }

                lastScrollPositionRef.current = {
                    x: htmlElement.scrollLeft,
                    y: htmlElement.scrollTop,
                };
            }
            animationFrameRef.current = requestAnimationFrame(performScroll);
        } else {
            animationFrameRef.current = null;
        }
    }, [onScrollDelta]);

    /**
     * Update scroll based on current pointer position
     */
    const updateScroll = useCallback((position: Position) => {
        if (!mergedConfig.enabled) return;

        const speed = calculateScrollSpeed(position);
        scrollSpeedRef.current = speed;

        if ((speed.x !== 0 || speed.y !== 0) && !animationFrameRef.current) {
            isScrollingRef.current = true;
            animationFrameRef.current = requestAnimationFrame(performScroll);
        } else if (speed.x === 0 && speed.y === 0) {
            isScrollingRef.current = false;
        }
    }, [mergedConfig.enabled, calculateScrollSpeed, performScroll]);

    /**
     * Stop auto-scrolling
     */
    const stopScroll = useCallback(() => {
        isScrollingRef.current = false;
        scrollSpeedRef.current = { x: 0, y: 0 };

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScroll();
        };
    }, [stopScroll]);

    return {
        initScrollContainer,
        updateScroll,
        stopScroll,
        scrollableRef,
    };
}
