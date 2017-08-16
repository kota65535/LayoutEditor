/**
 * Created by tozawa on 2017/07/03.
 */

import {RectPart} from "./primitives/RectPart";
import {CirclePart} from "./primitives/CirclePart";
import {CombinedPart} from "./primitives/CombinedPart";
import {sprintf} from "sprintf-js";
import logger from "../../../logging";

let log = logger("Joint", "DEBUG");

/**
 * レールのジョイントを表現するクラス
 */
export class Joint extends CombinedPart {

    static WIDTH = 8;
    static HEIGHT = 16;
    static HIT_RADIUS = 20;
    static FILL_COLOR_CONNECTED = "darkgray";
    static FILL_COLOR_CONNECTING = "deepskyblue";
    static FILL_COLOR_OPEN = "darkorange";

    /**
     * ジョイントの状態。
     * @type {{OPEN: Symbol, CONNECTING: Symbol, CONNECTED: Symbol}}
     */
    static State = {
        OPEN: Symbol("Open"),               // 未接続
        CONNECTING_FROM: Symbol("ConnectingFrom"),   // 接続試行中
        CONNECTING_TO: Symbol("ConnectingTo"),   // 接続試行中
        CONNECTED: Symbol("Connected")      // 接続中
    };

    /**
     * 接続方向とジョイントの向きの関係を指定するための識別子。
     * 同じならSAME_AS_ANGLE, 逆転しているならREVERSE_TO_ANGLE。
     * @type {{SAME_TO_ANGLE: Symbol, REVERSE_TO_ANGLE: Symbol}}
     */
    static Direction = {
        SAME_TO_ANGLE: Symbol("SameToAngle"),
        REVERSE_TO_ANGLE: Symbol("ReverseToAngle")
    };

    /**
     * ジョイントを指定の位置・角度で作成する。
     * @param {Point} position 位置
     * @param {number} angle X軸に対する絶対角度
     * @param {Direction} direction 接続方向
     * @param {Rail} rail ジョイントが属するレールオブジェクト
     */
    constructor(position, angle, direction, rail) {
        let rect = new RectPart(position, 0, Joint.WIDTH, Joint.HEIGHT, Joint.FILL_COLOR_OPEN);
        let circle = new CirclePart(position.subtract(new paper.Point(0, 0)), 0, Joint.HIT_RADIUS, Joint.FILL_COLOR_OPEN);

        if (direction === Joint.Direction.SAME_TO_ANGLE) {
            angle += 180;
        }

        super(position, rect.position, angle, [rect, circle]);

        this.direction = direction;
        this.connectedJoint = null;
        this.rail = rail;
        this.rendered = false;

        this.move(position);
        this.rotate(angle, this.getPosition());

        this.disconnect();
    }


    /**
     * 現在位置を取得する。
     * @return {Point}
     */
    getPosition() {
        return this.parts[0].path.segments[0].point;
        // switch(this.direction) {
        //     case Joint.Direction.SAME_TO_ANGLE:
        //         return this.parts[0].path.segments[3].point;
        //     case Joint.Direction.REVERSE_TO_ANGLE:
        //         return this.parts[0].path.segments[0].point;
        // }
    }

    /**
     * 基準点の絶対座標で移動する。
     * @param {Point} position
     * @param {Point} anchor
     */
    move(position, anchor=null) {
        if (!anchor) {
            anchor = this.getPosition();
        }
        let difference = position.subtract(anchor);
        this.moveRelatively(difference);
    }

    /**
     * 接続方向を取得する。
     * @returns {number}
     */
    getDirection() {
        return this.angle;
        // switch (this.direction) {
        //     case Joint.Direction.SAME_TO_ANGLE:
        //         return this.angle;
        //     case Joint.Direction.REVERSE_TO_ANGLE:
        //         return this.angle + 180;
        // }
    }

    /**
     * 指定のジョイントと接続する。
     * @param {Joint} joint
     */
    connect(joint, isDryRun=false) {
        this.connectedJoint = joint;
        joint.connectedJoint = this;
        if (isDryRun) {
            this._setState(Joint.State.CONNECTING_FROM);
            joint._setState(Joint.State.CONNECTING_TO);
        } else {
            this._setState(Joint.State.CONNECTED);
            joint._setState(Joint.State.CONNECTED);
        }
    }

    /**
     * 接続中のジョイントと切断する。
     */
    disconnect() {
        if (this.connectedJoint) {
            this.connectedJoint._setState(Joint.State.OPEN);
            this.connectedJoint.connectedJoint = null;
        }
        this._setState(Joint.State.OPEN);
        this.connectedJoint = null;
    }

    /**
     * ジョイントが接続中か否かを返す。
     * @returns {State}
     */
    getState() {
        return this.state;
    }


    showInfo() {
        log.debug(sprintf("joint: (%.3f, %.3f) | angle: %.3f, dir: %.3f",
            this.getPosition().x, this.getPosition().y, this.angle, this.getDirection()));
    }

    /**
     * 状態を設定し、ジョイントの色、サイズを変更する。
     * @param state
     * @private
     */
    _setState(state) {
        let angle = this.angle;
        switch(state) {
            case Joint.State.OPEN:
                // 透明でも当たり判定が存在
                this.parts.forEach(part => part.path.fillColor = Joint.FILL_COLOR_OPEN);
                this.parts[1].path.visible = true;
                this.parts[1].path.opacity = 0;
                break;
            case Joint.State.CONNECTING_FROM:
                this.parts.forEach(part => part.path.fillColor = Joint.FILL_COLOR_CONNECTING);
                this.parts[1].path.visible = false;
                break;
            case Joint.State.CONNECTING_TO:
                this.parts.forEach(part => part.path.fillColor = Joint.FILL_COLOR_CONNECTING);
                this.parts[1].path.visible = true;
                this.parts[1].path.opacity = 0.5;
                break;
            case Joint.State.CONNECTED:
                this.parts.forEach(part => part.path.fillColor = Joint.FILL_COLOR_CONNECTED);
                this.parts[1].path.visible = true;
                this.parts[1].path.opacity = 0;
                break;
        }
        this.state = state;
    }

    setOpacity(value) {
        this.parts[0].opacity = value;
        if (this.parts[1].opacity > value) {
            this.parts[1].opacity = value;
        }
    }
}
