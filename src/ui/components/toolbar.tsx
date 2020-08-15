import { IonButton, IonButtons, IonIcon, IonLabel } from "@ionic/react";
import { close, bulb, helpCircle, play } from "ionicons/icons";
import React from "react";
import Modal from "react-modal";
import "./toolbar.css";

export interface ToolbarProps {
    instructions: string;
    onPlayAgain(): void;
    answersShow: {
        reset(): void;
    };
}

export interface ToolbarState {
    instructionsIsOpen: boolean;
    answersShow: boolean;
}

/* A toolbar of buttons relating to the activities with the bells */
export class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
    constructor(props: ToolbarProps) {
        super(props);
        this.state = { instructionsIsOpen: false, answersShow: false };
        /* props.answersShow.reset() is called from Bells when the activity is refreshed to ensure
        that the answers are not showing when the activity is refreshed*/
        props.answersShow.reset = () => {
            this.setState({ answersShow: false });
        };
    }

    openInstructions = () => {
        this.setState({ instructionsIsOpen: true });
    };

    closeInstructions = () => {
        this.setState({ instructionsIsOpen: false });
    };

    getAnswersLabel = (showing: boolean) => {
        return showing ? "Hide answers" : "Show answers";
    };

    render() {
        /* Add the answersShow class to body so that css knows when to display and when to hide the
        coloured borders around the bells that tell users what the correct answers are for the
        activity */
        window.document.body.classList.toggle(
            "answersShow",
            this.state.answersShow
        );
        return (
            <IonButtons>
                <IonButton
                    onClick={() => {
                        this.props.onPlayAgain();
                    }}
                >
                    <IonIcon icon={play} />
                    <IonLabel>Play again</IonLabel>
                </IonButton>

                <IonButton onClick={this.openInstructions}>
                    <IonIcon icon={helpCircle} />
                    <IonLabel>Instructions</IonLabel>
                </IonButton>

                <Modal
                    isOpen={this.state.instructionsIsOpen}
                    onRequestClose={this.closeInstructions}
                    shouldCloseOnOverlayClick={true}
                >
                    <div onClick={this.closeInstructions}>
                        {this.props.instructions}
                    </div>
                    <IonButton onClick={this.closeInstructions}>
                        <IonIcon icon={close}></IonIcon>
                    </IonButton>
                </Modal>

                <IonButton
                    onClick={() => {
                        this.setState({ answersShow: !this.state.answersShow });
                    }}
                >
                    <IonIcon icon={bulb} />
                    <IonLabel>
                        {this.getAnswersLabel(this.state.answersShow)}
                    </IonLabel>
                </IonButton>
            </IonButtons>
        );
    }
}
