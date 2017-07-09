/**
 * Created by tozawa on 2017/07/03.
 */

import {sprintf} from "sprintf-js";

/**
 * 接続方向とジョイントの向きの関係を指定するための識別子。
 * 同じならSAME_AS_ANGLE, 逆転しているならREVERSE_TO_ANGLE。
 * @type {{SAME_TO_ANGLE: Symbol, REVERSE_TO_ANGLE: Symbol}}
 */
export const Direction = {
    SAME_TO_ANGLE: Symbol(),
    REVERSE_TO_ANGLE: Symbol
}

/**
 * レールのジョイントを表現するクラス
 */
export class Joint {

    /**
     * ジョイントを指定の位置・角度で作成する。
     * @param {Point} position 位置
     * @param {number} angle X軸に対する絶対角度
     * @param {Direction} direction 接続方向
     */
    constructor(position, angle, direction=Direction.SAME_TO_ANGLE) {
        this.WIDTH = 4;
        this.HEIGHT = 10;

        this.angle = 0;
        this.direction = direction;

        // パスの生成
        this.path = new paper.Path.Rectangle(new Point(position.x - this.WIDTH/2, position.y - this.HEIGHT/2), new Size(this.WIDTH, this.HEIGHT));
        this.path.fillColor = "red";

        this.move(position);
        this.rotate(angle, this.getPosition());
    }

    /**
     * 絶対座標で移動する。
     * @param {Point} point
     */
    move(position) {
        this.path.position = position;
    }

    /**
     * 現在からの相対座標で移動する。
     * @param {Point} difference
     */
    moveRelatively(difference) {
        let absPoint = this.getPosition().add(difference);
        this.move(absPoint);
    }

    /**
     * Y軸から時計回りの絶対角度で回転する。
     * @param {number} angle
     * @param {Point} center
     */
    rotate(angle, center) {
        let relAngle = angle - this.angle;
        this.rotateRelatively(relAngle, center);
    }

    /**
     * Y軸から時計回りで現在からの相対角度で回転する。
     * @param {number} difference
     * @param {Point} center
     */
    rotateRelatively(difference, center) {
        this.angle += difference;
        this.path.rotate(difference, center);
    }

    /**
     * 現在位置を取得する。
     * @returns {Point}
     */
    getPosition() {
        return this.path.position;
    }

    /**
     * 接続方向を取得する。
     * @returns {number}
     */
    getDirection() {
        let direction;
        switch (this.direction) {
            case Direction.SAME_TO_ANGLE:
                direction = this.angle;
                break;
            case Direction.REVERSE_TO_ANGLE:
                direction = this.angle + 180;
                break;
            default:
                direction = this.angle;
        }
        return direction;
    }

    showInfo() {
        console.log(sprintf("joint: (%.3f, %.3f) | angle: %.3f, dir: %.3f",
            this.getPosition().x, this.getPosition().y, this.angle, this.getDirection()));
    }

}
