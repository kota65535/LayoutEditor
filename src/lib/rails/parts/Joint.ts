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
    DISABLED,
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
    static FILL_COLOR_CONNECTED = "grey";
    static FILL_COLOR_CONNECTING = "deepskyblue";
    static FILL_COLOR_OPEN = "darkorange";


    private _direction: JointDirection;
    private _jointState: JointState;
    connectedJoint: Joint | null;

    _currentScale: number;
    rail: any;
    rendered: false;
    _isEnabled: boolean;


    get basePart() {
        return <RectPart>this.parts[0]
    }

    get position() {
        switch (this._direction) {
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
        let circlePosition = new Point(Joint.WIDTH/2, 0);
        switch (direction) {
            case JointDirection.SAME_TO_ANGLE:
                circlePosition = new Point(Joint.WIDTH/2, 0);
                break;
            case JointDirection.REVERSE_TO_ANGLE:
                circlePosition = new Point(-Joint.WIDTH/2, 0);
                break;
        }
        let circle = new CirclePart(position.add(circlePosition), 0, Joint.HIT_RADIUS, Joint.FILL_COLOR_OPEN);
        super(position, angle, rect, circle, [Joint.FILL_COLOR_OPEN, Joint.FILL_COLOR_CONNECTING, Joint.FILL_COLOR_CONNECTED]);


        this._direction = direction;
        this.connectedJoint = null;
        this.rail = rail;
        this.rendered = false;
        this._jointState = JointState.OPEN;
        this._isEnabled = true;
        this._currentScale = 1;

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
            this.setState(JointState.CONNECTING_FROM);
            joint.setState(JointState.CONNECTING_TO);
        } else {
            this.setState(JointState.CONNECTED);
            joint.setState(JointState.CONNECTED);
        }
    }

    /**
     * 接続中のジョイントと切断する。
     */
    disconnect() {
        if (this.connectedJoint) {
            this.connectedJoint.setState(JointState.OPEN);
            this.connectedJoint.connectedJoint = null;
        }
        this.setState(JointState.OPEN);
        this.connectedJoint = null;
    }

    /**
     * ジョイントを削除する。
     */
    remove() {
        this.disconnect();
        super.remove();
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
    setState(state: JointState) {
        switch(state) {
            case JointState.OPEN:
                this.setDetectionState(DetectionState.BEFORE_DETECT);
                this.unshrink();
                break;
            case JointState.CONNECTING_FROM:
                this.setDetectionState(DetectionState.DETECTING);
                this.unshrink();
                break;
            case JointState.CONNECTING_TO:
                this.setDetectionState(DetectionState.DETECTING);
                this.unshrink();
                break;
            case JointState.CONNECTED:
                this.setDetectionState(DetectionState.AFTER_DETECT);
                this.shrink();
                break;
        }
        this._jointState = state;
    }

    setEnabled(isEnabled) {
        if (isEnabled) {
            this.setState(this._jointState);
            this._isEnabled = true;
        } else {
            this.setDetectionState(DetectionState.DISABLED);
            this._isEnabled = false;
        }
    }

    /**
     * 本体への透明度設定を行う。
     * 当たり判定の透明度は状態の混乱を招くので今の所は変更しない。
     * @param {number} value
     */
    setOpacity(value: number) {
        this.basePart.setOpacity(value);
    }

    /**
     * ジョイントに接続後、お互い接続方向に幅を縮める（合体するようなイメージ）
     */
    shrink() {
        if (this._currentScale === 1) {
            this._scaleHorizontally(7/10);
            this._currentScale = 7/10;
        }
    }

    unshrink() {
        if (this._currentScale !== 1) {
            this._scaleHorizontally(10/7);
            this._currentScale = 1;
        }
    }

    /**
     * angle=0 時の水平方向に拡大・縮小する。
     */
    _scaleHorizontally(value: number) {
        let angle = this.basePart.angle;
        this.basePart.rotate(0);
        this.basePart.scale(value, 1, this.position);
        this.basePart.rotate(angle);
    }

    showInfo() {
        log.debug(sprintf("joint: (%.3f, %.3f) | angle: %.3f, dir: %.3f",
            this.position.x, this.position.y, this.angle, this.direction));
    }
}
