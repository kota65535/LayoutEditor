/**
 * Created by tozawa on 2017/07/03.
 */

import {sprintf} from "sprintf-js";

/**
 * 円形パーツの基底クラス。
 */
export class CirclePart {

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

        let pathData = sprintf("M 0 0 A %f,%f 0 0,1 %f %f A %f %f 0 0,1 %f %f Z",
            radius, radius,
            2 * radius, 0,
            radius, radius,
            0, 0);
        this.path = new paper.Path(pathData);
        this.path.fillColor = fillColor;

        this.move(position, this.path.position);
        this.rotate(angle, this.path.position);
    }

    /**
     * 現在位置からの相対座標で移動する。
     * @param {Point} difference
     */
    moveRelatively(difference) {
        this.path.position = this.path.position.add(difference);
        this.position = this.path.position;
    }

    /**
     * 基準点の絶対座標で移動する。
     * @param {Point} position
     * @param {Point} anchor
     */
    move(position, anchor) {
        let difference = position.subtract(anchor);
        this.moveRelatively(difference);
    }

    /**
     * Y軸から時計回りで現在からの相対角度で回転する。
     * @param {number} difference
     * @param {Point} anchor
     */
    rotateRelatively(difference, anchor) {
        this.angle += difference;
        this.path.rotate(difference, anchor);
    }

    /**
     * Y軸から時計回りの絶対角度で回転する。
     * @param {number} angle
     * @param {Point} anchor
     */
    rotate(angle, anchor) {
        let relAngle = angle - this.angle;
        this.rotateRelatively(relAngle, anchor);
    }

    /**
     * 現在位置(この矩形の中心点)を返す。
     *
     * @return {Point}
     */
    getPosition() {
        return this.path.position;
    }

    getCenterOfTop() {
        return this.path.curves[1].getLocationAt(this.path.curves[1].length/2).point;
    }

    getCenterOfBottom() {
        return this.path.curves[4].getLocationAt(this.path.curves[4].length/2).point;
    }

    getCenterOfLeft() {
        return this.path.segments[0].point
    }

    getCenterOfRight() {
        return this.path.segments[3].point
    }

    /**
     * パスを削除する。
     */
    remove() {
        this.path.remove();
    }

    /**
     * 指定されたパスがこのパーツに属するか否かを返す。
     * @param path
     * @returns {boolean}
     */
    containsPath(path) {
        return path.id === this.path.id;
    }
}
