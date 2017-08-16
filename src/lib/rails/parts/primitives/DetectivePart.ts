
import {PartBase} from "./PartBase";
import {Group, Path, Point} from "paper";

const enum State {
    BEFORE_DETECT = 1,
    DETECTING,
    AFTER_DETECT
}

export class DetectivePart implements PartBase {

    basePart: PartBase;
    detectionPart: PartBase;
    pathGroup: Group;
    path: Path;
    angle: number;


    /**
     * 当たり判定付きパーツを作成する。
     */
    constructor(position: Point, angle: number, basePart: PartBase, detectionPart: PartBase) {
        this.basePart = basePart;
        this.detectionPart = detectionPart;

        this.pathGroup = new Group();
        this.pathGroup.addChild(this.basePart.path);
        this.pathGroup.addChild(this.detectionPart.path);

        this.move(position, this.basePart.getPosition());
        this.rotate(angle, this.basePart.getPosition());

        this.path = this.basePart.path;
        this.angle = this.basePart.angle;
    }

    moveRelatively(difference: Point) {
        this.basePart.moveRelatively(difference);
        this.detectionPart.moveRelatively(difference);
    }

    move(position: Point, anchor: Point) {
        let difference = position.subtract(anchor);
        this.moveRelatively(difference);
    }

    rotateRelatively(difference: number, anchor: Point) {
        this.basePart.rotateRelatively(difference, anchor);
        this.detectionPart.rotateRelatively(difference, anchor);
    }

    rotate(angle: number, anchor: Point) {
        let relAngle = angle - this.basePart.getAngle();
        this.rotateRelatively(relAngle, anchor);
    }

    getPosition(): Point {
        return this.basePart.getPosition();
    }

    getAngle(): number {
        return this.basePart.getAngle();
    }

    remove() {
        this.basePart.remove();
        this.detectionPart.remove();
    }

    setOpacity(value: number) {
        this.basePart.setOpacity(value);
        this.detectionPart.setOpacity(value);
    }

    setVisible(isVisible: boolean) {
        this.basePart.setVisible(isVisible);
        this.detectionPart.setVisible(isVisible);
    }

    containsPath(path: Path): boolean {
        return this.basePart.containsPath(path) || this.detectionPart.containsPath(path);
    }

    /**
     * 当たり判定領域の状態を変更する。
     * @param {State} state
     */
    setState(state: State) {
        switch(state) {
            case State.BEFORE_DETECT:
                // 当たり判定領域を透明化
                this.detectionPart.setVisible(true);
                this.detectionPart.setOpacity(0);
                break;
            case State.DETECTING:
                // 当たり判定領域を半透明化
                this.detectionPart.setVisible(true);
                this.detectionPart.setOpacity(0.5);
                break;
            case State.AFTER_DETECT:
                // 当たり判定領域を不可視（無効化）
                this.detectionPart.setVisible(false);
                this.detectionPart.setOpacity(0);
                break;
        }
    }


    // /**
    //  * 指定されたパスがこのパーツに属するか否かを返す。
    //  * @param path
    //  * @returns {boolean}
    //  */
    // equals(group) {
    //     return this.pathGroup.id === group.id;
    // }

    // getCenterOfTop() {
    //     return this.path.curves[1].getLocationAt(this.path.curves[1].length/2).point;
    // }
    //
    // getCenterOfBottom() {
    //     return this.path.curves[4].getLocationAt(this.path.curves[4].length/2).point;
    // }
    //
    // getCenterOfLeft() {
    //     return this.path.segments[0].point
    // }
    //
    // getCenterOfRight() {
    //     return this.path.segments[3].point
    // }

}
