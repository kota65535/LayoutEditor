"use strict";
/**
 * Created by tozawa on 2017/07/03.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sprintf_js_1 = require("sprintf-js");
const paper_1 = require("paper");
/**
 * 三角形パーツの基底クラス
 */
class TrianglePart {
    /**
     * 三角形パーツを指定の位置・角度で作成する。
     * @param {Point} position  中心点の位置
     * @param {number} angle    X軸に対する絶対角度
     * @param {number} width    幅
     * @param {number} height   高さ
     * @param {Color} fillColor 色
     */
    constructor(position, angle, width, height, fillColor) {
        this.angle = 0;
        this.width = width;
        this.height = height;
        // パスの生成
        let pathData = sprintf_js_1.sprintf("M 0 0 L %f %f L %f %f Z", this.width / 2, this.height, -this.width / 2, this.height);
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
    /**
     * 上部の頂点を返す。
     * @returns {"paper".Point}
     */
    getCenterOfTop() {
        return this.path.segments[0].point;
    }
    /**
     * 底辺の中点を返す。
     * @returns {"paper".Point}
     */
    getCenterOfBottom() {
        return this.path.curves[1].getLocationAt(this.path.curves[1].length / 2).point;
    }
}
exports.TrianglePart = TrianglePart;
//# sourceMappingURL=TrianglePart.js.map