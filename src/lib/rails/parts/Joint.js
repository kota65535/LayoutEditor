"use strict";
/**
 * Created by tozawa on 2017/07/03.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const RectPart_1 = require("./primitives/RectPart");
const CirclePart_1 = require("./primitives/CirclePart");
const sprintf_js_1 = require("sprintf-js");
const logging_1 = require("../../../logging");
const DetectablePart_1 = require("./primitives/DetectablePart");
const paper_1 = require("paper");
let log = logging_1.default("Joint");
/**
 * ジョイントの状態。
 * @type {{OPEN: Symbol, CONNECTING: Symbol, CONNECTED: Symbol}}
 */
var JointState;
(function (JointState) {
    JointState[JointState["OPEN"] = 0] = "OPEN";
    JointState[JointState["CONNECTING_FROM"] = 1] = "CONNECTING_FROM";
    JointState[JointState["CONNECTING_TO"] = 2] = "CONNECTING_TO";
    JointState[JointState["CONNECTED"] = 3] = "CONNECTED";
})(JointState = exports.JointState || (exports.JointState = {}));
/**
 * 接続方向とジョイントの向きの関係を指定するための識別子。
 * 同じならSAME_AS_ANGLE, 逆転しているならREVERSE_TO_ANGLE。
 * @type {{SAME_TO_ANGLE: Symbol, REVERSE_TO_ANGLE: Symbol}}
 */
var JointDirection;
(function (JointDirection) {
    JointDirection[JointDirection["SAME_TO_ANGLE"] = 0] = "SAME_TO_ANGLE";
    JointDirection[JointDirection["REVERSE_TO_ANGLE"] = 1] = "REVERSE_TO_ANGLE";
})(JointDirection = exports.JointDirection || (exports.JointDirection = {}));
/**
 * レールのジョイントを表現するクラス
 */
class Joint extends DetectablePart_1.DetectablePart {
    /**
     * ジョイントを指定の位置・角度で作成する。
     * @param {Point} position 位置
     * @param {number} angle X軸に対する絶対角度
     * @param {JointDirection} direction 接続方向
     * @param {Rail} rail ジョイントが属するレールオブジェクト
     */
    constructor(position, angle, direction, rail) {
        let rect = new RectPart_1.RectPart(position, 0, Joint.WIDTH, Joint.HEIGHT, Joint.FILL_COLOR_OPEN);
        let circle;
        switch (direction) {
            case JointDirection.SAME_TO_ANGLE:
                circle = new CirclePart_1.CirclePart(position.add(new paper_1.Point(Joint.WIDTH / 2, 0)), 0, Joint.HIT_RADIUS, Joint.FILL_COLOR_OPEN);
                break;
            case JointDirection.REVERSE_TO_ANGLE:
                circle = new CirclePart_1.CirclePart(position.subtract(new paper_1.Point(Joint.WIDTH / 2, 0)), 0, Joint.HIT_RADIUS, Joint.FILL_COLOR_OPEN);
                break;
            default:
                circle = new CirclePart_1.CirclePart(position.add(new paper_1.Point(Joint.WIDTH / 2, 0)), 0, Joint.HIT_RADIUS, Joint.FILL_COLOR_OPEN);
        }
        super(position, angle, rect, circle);
        this.direction = direction;
        this.connectedJoint = null;
        this.rail = rail;
        this.rendered = false;
        this.jointState = JointState.OPEN;
        this.move(position);
        this.rotate(angle, this.getPosition());
        this.disconnect();
    }
    // Angle = 0 の時、矩形の右辺中心がジョイント位置となる
    getPosition() {
        switch (this.direction) {
            case JointDirection.SAME_TO_ANGLE:
                return this.basePart.getCenterOfRight();
            case JointDirection.REVERSE_TO_ANGLE:
                return this.basePart.getCenterOfLeft();
        }
    }
    /**
     * 基準点の絶対座標で移動する。
     * @param {Point} position
     * @param {Point} anchor
     */
    move(position, anchor = null) {
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
            case JointDirection.SAME_TO_ANGLE:
                return this.basePart.getAngle();
            case JointDirection.REVERSE_TO_ANGLE:
                return this.basePart.getAngle() + 180;
        }
    }
    /**
     * 指定のジョイントと接続する。
     * @param {Joint} joint
     */
    connect(joint, isDryRun = false) {
        this.connectedJoint = joint;
        joint.connectedJoint = this;
        if (isDryRun) {
            this._setState(JointState.CONNECTING_FROM);
            joint._setState(JointState.CONNECTING_TO);
        }
        else {
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
        return this.jointState;
    }
    showInfo() {
        log.debug(sprintf_js_1.sprintf("joint: (%.3f, %.3f) | angle: %.3f, dir: %.3f", this.getPosition().x, this.getPosition().y, this.angle, this.getDirection()));
    }
    /**
     * 状態を設定し、ジョイントの色、サイズを変更する。
     * @param state
     * @private
     */
    _setState(state) {
        switch (state) {
            case JointState.OPEN:
                this.setDetectionState(DetectablePart_1.DetectionState.BEFORE_DETECT);
                break;
            case JointState.CONNECTING_FROM:
                this.setDetectionState(DetectablePart_1.DetectionState.AFTER_DETECT);
                break;
            case JointState.CONNECTING_TO:
                this.setDetectionState(DetectablePart_1.DetectionState.DETECTING);
                break;
            case JointState.CONNECTED:
                this.setDetectionState(DetectablePart_1.DetectionState.AFTER_DETECT);
                break;
        }
        this.jointState = state;
    }
    setOpacity(value) {
        this.basePart.setOpacity(value);
        if (this.detectionPart.path.opacity > value) {
            this.detectionPart.setOpacity(value);
        }
    }
}
Joint.WIDTH = 8;
Joint.HEIGHT = 16;
Joint.HIT_RADIUS = 20;
Joint.FILL_COLOR_CONNECTED = "darkgray";
Joint.FILL_COLOR_CONNECTING = "deepskyblue";
Joint.FILL_COLOR_OPEN = "darkorange";
exports.Joint = Joint;
//# sourceMappingURL=Joint.js.map