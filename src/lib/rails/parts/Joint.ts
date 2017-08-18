/**
 * Created by tozawa on 2017/07/03.
 */

import {RectPart} from "./primitives/RectPart";
import {CirclePart} from "./primitives/CirclePart";
import {sprintf} from "sprintf-js";
import logger from "../../../logging";
import {DetectionState, DetectablePart} from "./primitives/DetectablePart";
import {Point} from "paper";

let log = logger("Joint");

/**
 * ジョイントの状態。
 * @type {{OPEN: Symbol, CONNECTING: Symbol, CONNECTED: Symbol}}
 */
export enum JointState {
    OPEN,
    CONNECTING_FROM,
    CONNECTING_TO,
    CONNECTED
}

/**
 * 接続方向とジョイントの向きの関係を指定するための識別子。
 * 同じならSAME_AS_ANGLE, 逆転しているならREVERSE_TO_ANGLE。
 * @type {{SAME_TO_ANGLE: Symbol, REVERSE_TO_ANGLE: Symbol}}
 */
export enum JointDirection {
    SAME_TO_ANGLE,
    REVERSE_TO_ANGLE
}

/**
 * レールのジョイントを表現するクラス
 */
export class Joint extends DetectablePart {

    static WIDTH = 8;
    static HEIGHT = 16;
    static HIT_RADIUS = 20;
    static FILL_COLOR_CONNECTED = "darkgray";
    static FILL_COLOR_CONNECTING = "deepskyblue";
    static FILL_COLOR_OPEN = "darkorange";


    basePart: RectPart;
    detectionPart: CirclePart;
    private _direction: JointDirection;
    private _jointState: JointState;
    connectedJoint: Joint | null;
    rail: any;
    rendered: false;


    get position() {
        switch (this.direction) {
            case JointDirection.SAME_TO_ANGLE:
                return this.basePart.getCenterOfRight();
            case JointDirection.REVERSE_TO_ANGLE:
                return this.basePart.getCenterOfLeft();
        }
        return this.basePart.getCenterOfRight();
    }

    /**
     * 接続方向の角度を取得する。
     */
    get direction(): number {
        switch (this._direction) {
            case JointDirection.SAME_TO_ANGLE:
                return this.basePart.angle;
            case JointDirection.REVERSE_TO_ANGLE:
                return this.basePart.angle + 180;
        }
        return this.basePart.angle;
    }

    get jointState(): number {
        return this._jointState;
    }

    /**
     * ジョイントを指定の位置・角度で作成する。
     * @param {Point} position 位置
     * @param {number} angle X軸に対する絶対角度
     * @param {JointDirection} direction 接続方向
     * @param {Rail} rail ジョイントが属するレールオブジェクト
     */
    constructor(position: Point, angle: number, direction: JointDirection, rail: any) {
        let rect = new RectPart(position, 0, Joint.WIDTH, Joint.HEIGHT, Joint.FILL_COLOR_OPEN);
        let circle: CirclePart;
        switch (direction) {
            case JointDirection.SAME_TO_ANGLE:
                circle = new CirclePart(position.add(new Point(Joint.WIDTH/2, 0)), 0, Joint.HIT_RADIUS, Joint.FILL_COLOR_OPEN);
                break;
            case JointDirection.REVERSE_TO_ANGLE:
                circle = new CirclePart(position.subtract(new Point(Joint.WIDTH/2, 0)), 0, Joint.HIT_RADIUS, Joint.FILL_COLOR_OPEN);
                break;
            default:
                circle = new CirclePart(position.add(new Point(Joint.WIDTH/2, 0)), 0, Joint.HIT_RADIUS, Joint.FILL_COLOR_OPEN);
        }
        super(position, angle, rect, circle);


        this._direction = direction;
        this.connectedJoint = null;
        this.rail = rail;
        this.rendered = false;
        this._jointState = JointState.OPEN;

        this.move(position);
        this.rotate(angle, this.position);

        this.disconnect();
    }

    /**
     * 指定のジョイントと接続する。
     * @param joint
     * @param isDryRun
     */
    connect(joint: Joint, isDryRun: boolean = false) {
        this.connectedJoint = joint;
        joint.connectedJoint = this;
        if (isDryRun) {
            this._setState(JointState.CONNECTING_FROM);
            joint._setState(JointState.CONNECTING_TO);
        } else {
            this._setState(JointState.CONNECTED);
            joint._setState(JointState.CONNECTED);
        }
    }

    /**
     * 接続中のジョイントと切断する。
     */
    disconnect() {
        if (this.connectedJoint) {
            this.connectedJoint._setState(JointState.OPEN);
            this.connectedJoint.connectedJoint = null;
        }
        this._setState(JointState.OPEN);
        this.connectedJoint = null;
    }

    /**
     * ジョイントが接続中か否かを返す。
     * @returns {State}
     */
    getState() {
        return this._jointState;
    }


    /**
     * 状態を設定し、ジョイントの色、サイズを変更する。
     * @param state
     * @private
     */
    _setState(state: JointState) {
        switch(state) {
            case JointState.OPEN:
                this.setDetectionState(DetectionState.BEFORE_DETECT);
                break;
            case JointState.CONNECTING_FROM:
                this.setDetectionState(DetectionState.AFTER_DETECT);
                break;
            case JointState.CONNECTING_TO:
                this.setDetectionState(DetectionState.DETECTING);
                break;
            case JointState.CONNECTED:
                this.setDetectionState(DetectionState.AFTER_DETECT);
                break;
        }
        this._jointState = state;
    }


    setOpacity(value: number) {
        this.basePart.setOpacity(value);
        if (this.detectionPart.path.opacity > value) {
            this.detectionPart.setOpacity(value);
        }
    }


    showInfo() {
        log.debug(sprintf("joint: (%.3f, %.3f) | angle: %.3f, dir: %.3f",
            this.position.x, this.position.y, this.angle, this.direction));
    }
}
