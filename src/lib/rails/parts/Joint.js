/**
 * Created by tozawa on 2017/07/03.
 */

import {RectPart} from "./RectPart";
import {sprintf} from "sprintf-js";


/**
 * レールのジョイントを表現するクラス
 */
export class Joint extends RectPart {

    static WIDTH = 4;
    static HEIGHT = 12;
    static FILL_COLOR_CONNECTED = "deepskyblue";
    static FILL_COLOR_OPEN = "darkorange";

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
     */
    constructor(position, angle, direction=Joint.Direction.SAME_TO_ANGLE) {
        super(position, angle, Joint.WIDTH, Joint.HEIGHT, Joint.FILL_COLOR_OPEN);

        this.direction = direction;
        this.connectedJoint = null;

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
    connect(joint) {
        this.connectedJoint = joint;
        joint.connectedJoint = this;
        this.path.fillColor = Joint.FILL_COLOR_CONNECTED;
        joint.path.fillColor = Joint.FILL_COLOR_CONNECTED;
    }

    /**
     * 接続中のジョイントと切断する。
     */
    disconnect() {
        if (this.connectedJoint) {
            this.connectedJoint.connectedJoint = null;
            this.connectedJoint.path.fillColor = Joint.FILL_COLOR_OPEN;
        }
        this.connectedJoint = null;
        this.path.fillColor = Joint.FILL_COLOR_OPEN;
    }

    /**
     * ジョイントが接続中か否かを返す。
     * @returns {boolean}
     */
    isConnected() {
        return this.connectedJoint !== null;
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
        console.log(sprintf("joint: (%.3f, %.3f) | angle: %.3f, dir: %.3f",
            this.getPosition().x, this.getPosition().y, this.angle, this.getDirection()));
    }

}
