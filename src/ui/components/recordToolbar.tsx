import { IonIcon, IonLabel, IonInput, IonButton } from "@ionic/react";
import { close, ellipse, helpCircle, musicalNotes, stop } from "ionicons/icons";
import React, { DetailedReactHTMLElement, HTMLAttributes } from "react";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { toast } from "./toast";
import { currentUser, onAuthStateChanged, User } from "../../business/user";
import { saveSong, NoteTime } from "../../business/song";
import "./recordToolbar.css";

export interface RecordToolbarProps {
    instructions: DetailedReactHTMLElement<
        HTMLAttributes<HTMLElement>,
        HTMLElement
    >;
}

export interface RecordToolbarState {
    instructionsIsOpen: boolean /* is the instructions modal open? */;
    saveIsOpen: boolean /* is the save song modal open? */;
    loginToRecordIsOpen: boolean /* is the modal open that tells the user they must be logged in to record? */;
    recording: boolean;
    user: User | null;
}

/* Where the user's song will be stored when the user clicks Record */
let song: NoteTime[] = [];
let title = "";
/* Get all the bells so their notes can be stored in the recorded song */
const bells = document.getElementsByClassName("fixedBell");

/* A toolbar of buttons relating to the 'Make music' activity */
export class RecordToolbar extends React.Component<
    RecordToolbarProps,
    RecordToolbarState
> {
    recordButtonLabel: string;
    constructor(props: RecordToolbarProps) {
        super(props);
        this.state = {
            instructionsIsOpen: false,
            saveIsOpen: false,
            loginToRecordIsOpen: false,
            recording: false,
            user: currentUser
        };
        this.recordButtonLabel = "Record";
        /* Send a callback to onAuthStateChanged that listens for a change of user, so we are
           informed when user changes, so onClickRecord can disable recording when user is not
           logged in */
        onAuthStateChanged(user => {
            this.setState({ user });
        });
    }

    openInstructions = () => {
        /* Triggers modal with instructions to be opened */
        this.setState({ instructionsIsOpen: true });
    };

    closeInstructions = () => {
        /* Triggers modal with instructions to be closed */
        this.setState({ instructionsIsOpen: false });
    };

    openSave = () => {
        /* Triggers modal inviting user to save their recorded song to be opened */
        this.setState({ saveIsOpen: true });
    };

    closeSave = () => {
        /* Triggers 'save' modal to be closed */
        this.setState({ saveIsOpen: false });
        /* reset song as empty ready for next recording */
        song = [];
        title = "";
        finishRecording(); /* garbage collection: remove eventListeners from bells */
    };

    openLoginToRecord = () => {
        /* Triggers modal telling user they must be logged in to record to be opened */
        this.setState({ loginToRecordIsOpen: true });
    };

    closeLoginToRecord = () => {
        /* Triggers 'loginToRecord' modal to be closed */
        this.setState({ loginToRecordIsOpen: false });
    };

    toggleRecordIcon() {
        if (this.state.recording) {
            this.recordButtonLabel = "Stop";
            return <IonIcon className="recordIcon" icon={stop} />;
        } else {
            this.recordButtonLabel = "Record";
            return <IonIcon className="recordIcon" icon={ellipse} />;
        }
    }

    /* Recording has been stopped or started */
    onClickRecord() {
        /* If no user is logged in, cause a modal to pop up that tells the user they must be logged
           in to record their songs */
        if (this.state.user == null) {
            this.openLoginToRecord();
            return;
        }
        if (this.state.recording) {
            // user has stopped recording
            if (song.length > 0) {
                // some notes have been recorded
                this.openSave(); // triggers modal to pop up, inviting user to save song
            } else {
                // the recording is empty/silent so no point in saving song
                toast(
                    `No notes were played during recording; there is no song to save.`
                );
            }
        } else {
            recordSong(); // start recording the bells that are tapped
        }
        this.setState({ recording: !this.state.recording });
    }

    /* The user clicked 'Save' button */
    saveSongAndClose = () => {
        /* call save song in the business layer so business layer can save song to the database */
        if (title === "") {
            title = "My song";
        }
        saveSong(title!, song);
        this.closeSave();
        toast("Your song has been saved.");
    };

    render() {
        return (
            <div id="recordToolbar">
                <button
                    onClick={() => {
                        this.onClickRecord();
                    }}
                >
                    {this.toggleRecordIcon()}
                    <IonLabel>{this.recordButtonLabel}</IonLabel>
                </button>

                <Modal
                    isOpen={this.state.loginToRecordIsOpen}
                    onRequestClose={this.closeLoginToRecord}
                    shouldCloseOnOverlayClick={true}
                >
                    <button id="closeModal" onClick={this.closeLoginToRecord}>
                        <IonIcon icon={close}></IonIcon>
                    </button>
                    <div id="instructions" onClick={this.closeLoginToRecord}>
                        To record your songs, please{" "}
                        <Link to="/login">log in</Link>.
                    </div>
                </Modal>

                <Modal
                    isOpen={this.state.saveIsOpen}
                    onRequestClose={this.closeSave}
                    shouldCloseOnOverlayClick={true}
                >
                    <button id="closeModal" onClick={this.closeSave}>
                        <IonIcon icon={close}></IonIcon>
                    </button>
                    <div id="save">
                        <form>
                            <IonInput
                                id="songTitle"
                                placeholder="song name"
                                onIonChange={e => (title = e.detail.value!)}
                            />
                            <IonButton onClick={this.closeSave}>
                                Discard
                            </IonButton>
                            <IonButton onClick={this.saveSongAndClose}>
                                Save
                            </IonButton>
                        </form>
                    </div>
                </Modal>

                <button onClick={this.openInstructions}>
                    <IonIcon icon={helpCircle} />
                    <IonLabel>Instructions</IonLabel>
                </button>

                <Modal
                    isOpen={this.state.instructionsIsOpen}
                    onRequestClose={this.closeInstructions}
                    shouldCloseOnOverlayClick={true}
                >
                    <button id="closeModal" onClick={this.closeInstructions}>
                        <IonIcon icon={close}></IonIcon>
                    </button>
                    <div id="instructions" onClick={this.closeInstructions}>
                        {this.props.instructions}
                    </div>
                </Modal>

                <NavLink className="button" to="/play_songs">
                    <IonIcon icon={musicalNotes} />
                    <IonLabel>My song</IonLabel>
                </NavLink>
            </div>
        );
    }
}

/* Bell has been tapped. Add its note and timepoint to song. */
const startBell = (ev: Event) => {
    const bell = ev.currentTarget as HTMLElement;
    song.push({ note: Number(bell.dataset.note), time: Date.now() });
};

/* Record the bells that are tapped, and the timepoint of each tap */
function recordSong() {
    for (let i = 0; i < bells.length; ++i) {
        bells[i].addEventListener("pointerdown", startBell, true);
    }
}

/* Song has been saved or discarded. Remove eventListeners from bells */
function finishRecording() {
    for (let i = 0; i < bells.length; ++i) {
        bells[i].removeEventListener("pointerdown", startBell, true);
    }
}
