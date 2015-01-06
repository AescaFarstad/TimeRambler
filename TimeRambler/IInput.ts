interface IInput {
    timeScaleDown();
    timeScaleNormal();
    timeScaleUp();
    timeScaleStop();
    activateAction(action:Action);
    cancelAction(action:Action);

}  