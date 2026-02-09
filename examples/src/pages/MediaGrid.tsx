import React, { useCallback, useState } from "react";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonLabel,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import {
    arrayMove,
    DragDropProvider,
    DragEndEvent,
    useSortable,
} from "@oyfora/ionic-dnd";

interface MediaItem {
    id: string;
    label: string;
    color: string;
    size: "small" | "medium" | "large";
}

const initialItems: MediaItem[] = [
    { id: "1", label: "1", color: "#FF6B6B", size: "large" },
    { id: "2", label: "2", color: "#4ECDC4", size: "small" },
    { id: "3", label: "3", color: "#45B7D1", size: "small" },
    { id: "4", label: "4", color: "#96CEB4", size: "medium" },
    { id: "5", label: "5", color: "#FFEAA7", size: "medium" },
    { id: "6", label: "6", color: "#DDA0DD", size: "small" },
    { id: "7", label: "7", color: "#98D8C8", size: "small" },
    { id: "8", label: "8", color: "#F7DC6F", size: "small" },
    { id: "9", label: "9", color: "#BB8FCE", size: "small" },
];

const sizeClasses = {
    small: "col-span-2",
    medium: "col-span-4",
    large: "col-span-8",
};

interface SortableMediaItemProps {
    item: MediaItem;
    index: number;
    onSizeChange?: (id: string, size: MediaItem["size"]) => void;
}

const SortableMediaItem: React.FC<SortableMediaItemProps> = (
    { item, index },
) => {
    const {
        ref,
        isDragging,
        isOver,
        transform,
        transition,
        listeners,
        attributes,
    } = useSortable({
        id: item.id,
        index,
    });

    const style: React.CSSProperties = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 999 : 1,
    };

    return (
        <div
            ref={ref}
            style={style}
            className={`media-item ${sizeClasses[item.size]} ${
                isDragging ? "dragging" : ""
            } ${isOver ? "over" : ""}`}
            {...attributes}
            {...listeners}
        >
            <div
                className="media-item-placeholder"
                style={{ background: item.color }}
            >
                {item.label}
            </div>
        </div>
    );
};

const MediaGrid: React.FC = () => {
    const [items, setItems] = useState<MediaItem[]>(initialItems);
    const [editMode, setEditMode] = useState<"reorder" | "resize">("reorder");

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { activeIndex, overIndex } = event;
        if (activeIndex !== overIndex && overIndex !== undefined) {
            setItems((prev) => arrayMove(prev, activeIndex, overIndex));
        }
    }, []);

    const handleSizeChange = useCallback(
        (id: string, size: MediaItem["size"]) => {
            setItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, size } : item))
            );
        },
        [],
    );

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>Media Grid</IonTitle>
                </IonToolbar>
                <IonToolbar>
                    <IonSegment
                        value={editMode}
                        onIonChange={(e) =>
                            setEditMode(e.detail.value as "reorder" | "resize")}
                    >
                        <IonSegmentButton value="reorder">
                            <IonLabel>Reorder</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="resize">
                            <IonLabel>Resize</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {editMode === "reorder"
                    ? (
                        <DragDropProvider onDragEnd={handleDragEnd}>
                            <div className="media-grid">
                                {items.map((item, index) => (
                                    <SortableMediaItem
                                        key={item.id}
                                        item={item}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </DragDropProvider>
                    )
                    : (
                        <div className="media-grid">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`media-item ${
                                        sizeClasses[item.size]
                                    }`}
                                    onClick={() => {
                                        const sizes: MediaItem["size"][] = [
                                            "small",
                                            "medium",
                                            "large",
                                        ];
                                        const currentIndex = sizes.indexOf(
                                            item.size,
                                        );
                                        const nextSize =
                                            sizes[
                                                (currentIndex + 1) %
                                                sizes.length
                                            ];
                                        handleSizeChange(item.id, nextSize);
                                    }}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div
                                        className="media-item-placeholder"
                                        style={{ background: item.color }}
                                    >
                                        <div style={{ textAlign: "center" }}>
                                            <div>{item.label}</div>
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {item.size}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                {editMode === "resize" && (
                    <div
                        style={{
                            padding: "16px",
                            textAlign: "center",
                            color: "var(--ion-color-medium)",
                        }}
                    >
                        Tap an item to cycle through sizes: small → medium →
                        large
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default MediaGrid;
