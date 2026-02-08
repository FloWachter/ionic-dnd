/**
 * Example: Using ionic-dnd with your EditMyProfileGrid
 *
 * This example shows how to migrate from @dnd-kit to @oyfora/ionic-dnd
 * for the media grid in your profile editor.
 */

import React, { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    arrayMove,
    DragDropProvider,
    DragEndEvent,
    useSortable,
} from "@oyfora/ionic-dnd";

// Your existing types
interface MediaItem {
    media_id: string;
    title: string;
    sub_title: string;
    img_url: string;
    size: "small" | "medium" | "large";
    media_index: number;
    // ... other properties
}

// Size configuration
const sizeConfig = {
    small: "col-span-2",
    medium: "col-span-4",
    large: "col-span-8",
};

// Individual grid item component
interface GridItemProps {
    item: MediaItem;
    index: number;
    onSizeChange: (id: string, size: "small" | "medium" | "large") => void;
    onEdit: (item: MediaItem) => void;
}

const EditMediaGridItem = memo(function EditMediaGridItem({
    item,
    index,
    onSizeChange,
    onEdit,
}: GridItemProps) {
    const {
        ref,
        handleRef,
        isDragging,
        isOver,
        transform,
        transition,
        listeners,
        attributes,
    } = useSortable({
        id: item.media_id,
        index,
    });

    const sizeClasses = sizeConfig[item.size] || sizeConfig.medium;

    const style: React.CSSProperties = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 999 : 1,
        touchAction: "none",
    };

    return (
        <div
            ref={ref}
            style={style}
            data-media-id={item.media_id}
            className={`${sizeClasses} rounded-lg relative overflow-hidden transition-opacity duration-200`}
            {...attributes}
            {...listeners}
        >
            <motion.div
                layout={!isDragging}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
            >
                {/* Your media content */}
                <div className="absolute inset-0 bg-gray-800 rounded-lg">
                    {item.img_url && (
                        <img
                            src={item.img_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Control panel with drag handle */}
                <div className="absolute top-2 right-2 flex gap-2">
                    {/* Drag handle */}
                    <button
                        ref={handleRef}
                        className="p-2 bg-black/50 rounded-full cursor-grab active:cursor-grabbing"
                    >
                        ⋮⋮
                    </button>

                    {/* Edit button */}
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2 bg-black/50 rounded-full"
                    >
                        ✏️
                    </button>

                    {/* Size toggle */}
                    <button
                        onClick={() => {
                            const sizes: ("small" | "medium" | "large")[] = [
                                "small",
                                "medium",
                                "large",
                            ];
                            const currentIndex = sizes.indexOf(item.size);
                            const nextSize =
                                sizes[(currentIndex + 1) % sizes.length];
                            onSizeChange(item.media_id, nextSize);
                        }}
                        className="p-2 bg-black/50 rounded-full"
                    >
                        {item.size[0].toUpperCase()}
                    </button>
                </div>

                {/* Drag overlay indicator */}
                {isDragging && (
                    <motion.div
                        className="absolute inset-0 bg-blue-500/20 border-2 border-blue-400 rounded-lg pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                )}

                {/* Drop target indicator */}
                {isOver && !isDragging && (
                    <div className="absolute inset-0 bg-green-500/20 border-2 border-green-400 rounded-lg pointer-events-none" />
                )}
            </motion.div>
        </div>
    );
});

// Main grid component
interface EditMyProfileGridProps {
    mediaItems: MediaItem[];
    onItemsReorder: (items: MediaItem[]) => void;
    onSizeChange: (id: string, size: "small" | "medium" | "large") => void;
    onItemEdit: (item: MediaItem) => void;
}

export function EditMyProfileGrid({
    mediaItems,
    onItemsReorder,
    onSizeChange,
    onItemEdit,
}: EditMyProfileGridProps) {
    const [items, setItems] = useState(mediaItems);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (event.cancelled || event.fromIndex === event.toIndex) {
            return;
        }

        setItems((prevItems) => {
            const newItems = arrayMove(
                prevItems,
                event.fromIndex,
                event.toIndex,
            )
                .map((item, idx) => ({ ...item, media_index: idx }));

            onItemsReorder(newItems);
            return newItems;
        });
    }, [onItemsReorder]);

    return (
        <DragDropProvider
            config={{
                autoScroll: {
                    enabled: true,
                    threshold: 80,
                    maxSpeed: 15,
                    acceleration: 1.5,
                },
                activationDelay: 200,
                activationDistance: 5,
                hapticFeedback: true,
            }}
            onDragEnd={handleDragEnd}
        >
            <motion.div
                className="grid grid-cols-8 gap-4 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {items.map((item, index) => (
                    <EditMediaGridItem
                        key={item.media_id}
                        item={item}
                        index={index}
                        onSizeChange={onSizeChange}
                        onEdit={onItemEdit}
                    />
                ))}
            </motion.div>
        </DragDropProvider>
    );
}
