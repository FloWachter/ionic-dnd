import React, { useCallback, useState } from "react";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { reorderThreeOutline } from "ionicons/icons";
import {
    arrayMove,
    DragDropProvider,
    DragEndEvent,
    useSortable,
} from "@oyfora/ionic-dnd";

interface ListItem {
    id: string;
    title: string;
    description: string;
}

const initialItems: ListItem[] = [
    { id: "1", title: "First Item", description: "Drag me to reorder" },
    { id: "2", title: "Second Item", description: "Hold and drag" },
    { id: "3", title: "Third Item", description: "Works on touch devices" },
    { id: "4", title: "Fourth Item", description: "Smooth animations" },
    { id: "5", title: "Fifth Item", description: "Auto-scroll enabled" },
    {
        id: "6",
        title: "Sixth Item",
        description: "Try scrolling while dragging",
    },
    { id: "7", title: "Seventh Item", description: "Native-like feel" },
    { id: "8", title: "Eighth Item", description: "Optimized for Ionic" },
];

interface SortableListItemProps {
    item: ListItem;
    index: number;
}

const SortableListItem: React.FC<SortableListItemProps> = ({ item, index }) => {
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
    };

    return (
        <div
            ref={ref}
            style={style}
            className={`simple-list-item ${isDragging ? "dragging" : ""} ${
                isOver ? "over" : ""
            }`}
            {...attributes}
            {...listeners}
        >
            <IonIcon
                icon={reorderThreeOutline}
                style={{ fontSize: "24px", color: "var(--ion-color-medium)" }}
            />
            <div>
                <div style={{ fontWeight: 500 }}>{item.title}</div>
                <div
                    style={{
                        fontSize: "14px",
                        color: "var(--ion-color-medium)",
                    }}
                >
                    {item.description}
                </div>
            </div>
        </div>
    );
};

const SimpleList: React.FC = () => {
    const [items, setItems] = useState<ListItem[]>(initialItems);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { activeIndex, overIndex } = event;
        if (activeIndex !== overIndex && overIndex !== undefined) {
            setItems((prev) => arrayMove(prev, activeIndex, overIndex));
        }
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>Simple List</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <DragDropProvider onDragEnd={handleDragEnd}>
                    <div className="simple-list">
                        {items.map((item, index) => (
                            <SortableListItem
                                key={item.id}
                                item={item}
                                index={index}
                            />
                        ))}
                    </div>
                </DragDropProvider>
            </IonContent>
        </IonPage>
    );
};

export default SimpleList;
