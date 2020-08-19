import {
    IonContent,
    IonHeader,
    IonPage,
    IonInput,
    IonButton
} from "@ionic/react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Topbar } from "../components/topbar";
import { loginUser } from "../../business/user";
import "./login.css";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function login() {
        await loginUser(email, password);
    }

    return (
        <IonPage>
            <IonHeader>
                <Topbar title="Log in" />
            </IonHeader>
            <IonContent className="ion-padding">
                <IonInput
                    type="email"
                    placeholder="email"
                    onIonChange={(e: any) => setEmail(e.target.value)}
                />
                <IonInput
                    type="password"
                    placeholder="password"
                    onIonChange={(e: any) => setPassword(e.target.value)}
                />
                <Link to="/home">
                    <IonButton onClick={login}>Log in</IonButton>
                </Link>
                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </IonContent>
        </IonPage>
    );
};

export default Login;
