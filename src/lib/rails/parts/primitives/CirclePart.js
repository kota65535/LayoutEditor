"use strict";
/**
 * Created by tozawa on 2017/07/03.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sprintf_js_1 = require("sprintf-js");
const paper_1 = require("paper");
/**
 * 円形パーツの基底クラス。
 */
class CirclePart {
    /**
     * 円形パーツを指定の位置・角度で作成する。
     * @param {Point} position  中心点の位置
     * @param {number} angle    X軸に対する絶対角度
     * @param {number} radius   半径
     * @param {Color} fillColor 色
     */
    constructor(position, angle, radius, fillColor) {
        this.angle = 0;
        this.radius = radius;
        let pathData = sprintf_js_1.sprintf("M 0 0 A %f,%f 0 0,1 %f %f A %f %f 0 0,1 %f %f Z", radius, radius, 2 * radius, 0, radius, radius, 0, 0);
        this.path = new paper_1.Path(pathData);
        this.path.fillColor = fillColor;
        this.move(position, this.path.position);
        this.rotate(angle, this.path.position);
    }
    moveRelatively(difference) {
        this.path.position = this.path.position.add(difference);
        this.position = this.path.position;
    }
    move(position, anchor) {
        let difference = position.subtract(anchor);
        this.moveRelatively(difference);
    }
    rotateRelatively(difference, anchor) {
        this.angle += difference;
        this.path.rotate(difference, anchor);
    }
    rotate(angle, anchor) {
        let relAngle = angle - this.angle;
        this.rotateRelatively(relAngle, anchor);
    }
    getPosition() {
        return this.path.position;
    }
    getAngle() {
        return this.angle;
    }
    remove() {
        this.path.remove();
    }
    setOpacity(value) {
        this.path.opacity = value;
    }
    setVisible(isVisible) {
        this.path.visible = isVisible;
    }
    containsPath(path) {
        return path.id === this.path.id;
    }
}
exports.CirclePart = CirclePart;
//# sourceMappingURL=CirclePart.js.map