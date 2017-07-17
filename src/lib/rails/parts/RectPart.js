/**
 * Created by tozawa on 2017/07/03.
 */

import {sprintf} from "sprintf-js";

/**
 * 矩形のパーツの基底クラス
 */
export class RectPart {

    /**
     * 矩形パーツを指定の位置・角度で作成する。
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
        let pathData = sprintf("M 0 0 L %f %f L %f %f L %f %f L %f %f L %f %f Z",
            0, -this.height/2,
            this.width, -this.height/2,
            this.width, 0,
            this.width, this.height/2,
            0, this.height/2
        );
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
     * 現在位置を返す。
     * @return {Point}
     */
    getPosition() {
        return this.path.position;
    }

    remove() {
        this.path.remove();
    }
}
