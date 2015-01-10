interface IInput {
    timeScaleDown():void;
    timeScaleNormal(): void;
    timeScaleUp(): void;
    timeScaleStop(): void;
    activateAction(action: Action): void;
    cancelAction(action: Action): void;

}  