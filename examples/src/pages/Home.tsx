import React from "react";
import {
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import {
    gridOutline,
    handLeftOutline,
    imagesOutline,
    listOutline,
} from "ionicons/icons";

const Home: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Ionic DnD Examples</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Examples</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <div style={{ padding: "16px" }}>
                    <p
                        style={{
                            color: "var(--ion-color-medium)",
                            marginBottom: "24px",
                        }}
                    >
                        Choose an example to see ionic-dnd in action. Each
                        example demonstrates different features of the library.
                    </p>
                </div>

                <IonList inset>
                    <IonItem routerLink="/simple-list" detail>
                        <IonIcon
                            icon={listOutline}
                            slot="start"
                            color="primary"
                        />
                        <IonLabel>
                            <h2>Simple Sortable List</h2>
                            <p>Basic drag and drop reordering</p>
                        </IonLabel>
                    </IonItem>

                    <IonItem routerLink="/media-grid" detail>
                        <IonIcon
                            icon={imagesOutline}
                            slot="start"
                            color="primary"
                        />
                        <IonLabel>
                            <h2>Media Grid</h2>
                            <p>Profile photo grid with different sizes</p>
                        </IonLabel>
                    </IonItem>

                    <IonItem routerLink="/handle-example" detail>
                        <IonIcon
                            icon={handLeftOutline}
                            slot="start"
                            color="primary"
                        />
                        <IonLabel>
                            <h2>Drag Handle Example</h2>
                            <p>Drag only via handle button, tap to resize</p>
                        </IonLabel>
                    </IonItem>
                </IonList>

                <div style={{ padding: "16px", marginTop: "24px" }}>
                    <IonNote>
                        <strong>Tip:</strong>{" "}
                        Try these examples on a touch device or use Chrome
                        DevTools device emulation for the best experience.
                    </IonNote>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Home;
