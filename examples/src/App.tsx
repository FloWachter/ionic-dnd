import React from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

import Home from "./pages/Home";
import SimpleList from "./pages/SimpleList";
import MediaGrid from "./pages/MediaGrid";
import HandleExample from "./pages/HandleExample";

setupIonicReact();

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
            <IonRouterOutlet>
                <Route exact path="/home" component={Home} />
                <Route exact path="/simple-list" component={SimpleList} />
                <Route exact path="/media-grid" component={MediaGrid} />
                <Route exact path="/handle-example" component={HandleExample} />
                <Route exact path="/">
                    <Redirect to="/home" />
                </Route>
            </IonRouterOutlet>
        </IonReactRouter>
    </IonApp>
);

export default App;
