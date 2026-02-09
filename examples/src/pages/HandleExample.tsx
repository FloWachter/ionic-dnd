import React, { useCallback, useState } from "react";
import {
    IonActionSheet,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import {
    ellipsisVertical,
    moveOutline,
    resizeOutline,
    trashOutline,
} from "ionicons/icons";
import {
    arrayMove,
    DragDropProvider,
    DragEndEvent,
    useSortable,
} from "@oyfora/ionic-dnd";

interface CardItem {
    id: string;
    title: string;
    description: string;
    color: string;
    size: "small" | "medium" | "large";
}

const initialItems: CardItem[] = [
    {
        id: "1",
        title: "Project Alpha",
        description: "Design phase complete",
        color: "#FF6B6B",
        size: "medium",
    },
    {
        id: "2",
        title: "Project Beta",
        description: "In development",
        color: "#4ECDC4",
        size: "small",
    },
    {
        id: "3",
        title: "Project Gamma",
        description: "Testing in progress",
        color: "#45B7D1",
        size: "large",
    },
    {
        id: "4",
        title: "Project Delta",
        description: "Ready for review",
        color: "#96CEB4",
        size: "small",
    },
    {
        id: "5",
        title: "Project Epsilon",
        description: "Deployed to production",
        color: "#FFEAA7",
        size: "medium",
    },
];

const sizeLabels = {
    small: "S",
    medium: "M",
    large: "L",
};

interface SortableCardProps {
    item: CardItem;
    index: number;
    onSizeChange: (id: string, size: CardItem["size"]) => void;
    onDelete: (id: string) => void;
}

const SortableCard: React.FC<SortableCardProps> = (
    { item, index, onSizeChange, onDelete },
) => {
    const [showActions, setShowActions] = useState(false);

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
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 999 : 1,
    };

    const cardHeight = item.size === "small"
        ? "100px"
        : item.size === "medium"
        ? "150px"
        : "200px";

    const cycleSizeNext = () => {
        const sizes: CardItem["size"][] = ["small", "medium", "large"];
        const currentIndex = sizes.indexOf(item.size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        onSizeChange(item.id, nextSize);
    };

    return (
        <div
            ref={ref}
            style={style}
            className={`handle-card ${isDragging ? "dragging" : ""} ${
                isOver ? "over" : ""
            }`}
            {...attributes}
        >
            <div
                className="handle-card-inner"
                style={{
                    background:
                        `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                    height: cardHeight,
                }}
            >
                {/* Card Content - NOT draggable */}
                <div className="handle-card-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                </div>

                {/* Action Buttons Row */}
                <div className="handle-card-actions">
                    {/* Drag Handle - ONLY this triggers drag */}
                    <button
                        className="handle-button drag-handle"
                        {...listeners}
                    >
                        <IonIcon icon={moveOutline} />
                        <span>Drag</span>
                    </button>

                    {/* Resize Button */}
                    <button
                        className="handle-button resize-handle"
                        onClick={cycleSizeNext}
                    >
                        <IonIcon icon={resizeOutline} />
                        <span>{sizeLabels[item.size]}</span>
                    </button>

                    {/* More Actions */}
                    <button
                        className="handle-button more-handle"
                        onClick={() => setShowActions(true)}
                    >
                        <IonIcon icon={ellipsisVertical} />
                    </button>
                </div>
            </div>

            <IonActionSheet
                isOpen={showActions}
                onDidDismiss={() => setShowActions(false)}
                header={item.title}
                buttons={[
                    {
                        text: "Small",
                        handler: () => onSizeChange(item.id, "small"),
                    },
                    {
                        text: "Medium",
                        handler: () => onSizeChange(item.id, "medium"),
                    },
                    {
                        text: "Large",
                        handler: () => onSizeChange(item.id, "large"),
                    },
                    {
                        text: "Delete",
                        role: "destructive",
                        icon: trashOutline,
                        handler: () => onDelete(item.id),
                    },
                    {
                        text: "Cancel",
                        role: "cancel",
                    },
                ]}
            />
        </div>
    );
};

const HandleExample: React.FC = () => {
    const [items, setItems] = useState<CardItem[]>(initialItems);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { activeIndex, overIndex } = event;
        if (activeIndex !== overIndex && overIndex !== undefined) {
            setItems((prev) => arrayMove(prev, activeIndex, overIndex));
        }
    }, []);

    const handleSizeChange = useCallback(
        (id: string, size: CardItem["size"]) => {
            setItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, size } : item))
            );
        },
        [],
    );

    const handleDelete = useCallback((id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>Handle Example</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <div className="handle-example-info">
                    <p>
                        <strong>Drag:</strong> Use the{" "}
                        <IonIcon icon={moveOutline} /> button to reorder
                    </p>
                    <p>
                        <strong>Resize:</strong> Tap{" "}
                        <IonIcon icon={resizeOutline} />{" "}
                        to cycle sizes (S → M → L)
                    </p>
                    <p>
                        <strong>More:</strong> Tap{" "}
                        <IonIcon icon={ellipsisVertical} /> for more options
                    </p>
                </div>

                <DragDropProvider onDragEnd={handleDragEnd}>
                    <div className="handle-card-list">
                        {items.map((item, index) => (
                            <SortableCard
                                key={item.id}
                                item={item}
                                index={index}
                                onSizeChange={handleSizeChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </DragDropProvider>
            </IonContent>
        </IonPage>
    );
};

export default HandleExample;
