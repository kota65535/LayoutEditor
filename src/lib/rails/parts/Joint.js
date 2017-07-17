/**
 * Created by tozawa on 2017/07/03.
 */

import {RectPart} from "./RectPart";
import {sprintf} from "sprintf-js";
import logger from "../../../logging";

let log = logger("Joint", "DEBUG");

/**
 * レールのジョイントを表現するクラス
 */
export class Joint extends RectPart {

    static WIDTH = 8;
    static HEIGHT = 16;
    static FILL_COLOR_CONNECTED = "darkgray";
    static FILL_COLOR_CONNECTING = "deepskyblue";
    static FILL_COLOR_OPEN = "darkorange";

    /**
     * ジョイントの状態。
     * @type {{OPEN: Symbol, CONNECTING: Symbol, CONNECTED: Symbol}}
     */
    static State = {
        OPEN: Symbol(),         // 未接続
        CONNECTING: Symbol(),   // 接続試行中
        CONNECTED: Symbol()     // 接続中
    };

    /**
     * 接続方向とジョイントの向きの関係を指定するための識別子。
     * 同じならSAME_AS_ANGLE, 逆転しているならREVERSE_TO_ANGLE。
     * @type {{SAME_TO_ANGLE: Symbol, REVERSE_TO_ANGLE: Symbol}}
     */
    static Direction = {
        SAME_TO_ANGLE: Symbol(),
        REVERSE_TO_ANGLE: Symbol()
    };

    /**
     * ジョイントを指定の位置・角度で作成する。
     * @param {Point} position 位置
     * @param {number} angle X軸に対する絶対角度
     * @param {Direction} direction 接続方向
     * @param {Rail} rail ジョイントが属するレールオブジェクト
     */
    constructor(position, angle, direction, rail) {
        super(position, angle, Joint.WIDTH, Joint.HEIGHT, Joint.FILL_COLOR_OPEN);

        this.direction = direction;
        this.connectedJoint = null;
        this.rail = rail;

        this.move(position);
        this.rotate(angle, this.getPosition());

        this.disconnect();
    }


    /**
     * 現在位置を取得する。
     * @return {Point}
     */
    getPosition() {
        switch(this.direction) {
            case Joint.Direction.SAME_TO_ANGLE:
                return this.path.segments[3].point;
            case Joint.Direction.REVERSE_TO_ANGLE:
                return this.path.segments[0].point;
        }
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
        switch (this.direction) {
            case Joint.Direction.SAME_TO_ANGLE:
                return this.angle;
            case Joint.Direction.REVERSE_TO_ANGLE:
                return this.angle + 180;
        }
    }

    /**
     * 指定のジョイントと接続する。
     * @param {Joint} joint
     */
    connect(joint, isDryRun=false) {
        this.connectedJoint = joint;
        joint.connectedJoint = this;
        if (isDryRun) {
            this._setState(Joint.State.CONNECTING);
            joint._setState(Joint.State.CONNECTING);
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

    /**
     * 指定されたパスがこのジョイントに属するか否かを返す。
     * @param path
     * @returns {boolean}
     */
    containsPath(path) {
        return path.id === this.path.id;
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
                this.path.fillColor = Joint.FILL_COLOR_OPEN;
                // this.path.rotate(0);
                // this.path.scale(1, 1, this.getPosition());
                // this.path.rotate(angle);
                this.state = state;
                break;
            case Joint.State.CONNECTING:
                this.path.fillColor = Joint.FILL_COLOR_CONNECTING;
                // this.path.rotate(0);
                // this.path.scale(1, 1, this.getPosition());
                // this.path.rotate(angle);
                this.state = state;
                break;
            case Joint.State.CONNECTED:
                this.path.fillColor = Joint.FILL_COLOR_CONNECTED;
                // this.path.rotate(0);
                // this.path.scale(0.5, 1, this.getPosition());
                // this.path.rotate(angle);
                this.state = state;
                break;
        }
    }

}
