/**
 * Created by tozawa on 2017/07/03.
 */

import {sprintf} from "sprintf-js";
import {Color, Path, Point} from "paper";
import {PartBase} from "./PartBase";

/**
 * 円形パーツの基底クラス。
 */
export class CirclePart extends PartBase {

    radius: number;

    /**
     * 円形パーツを指定の位置・角度で作成する。
     * @param {Point} position  中心点の位置
     * @param {number} angle    X軸に対する絶対角度
     * @param {number} radius   半径
     * @param {Color} fillColor 色
     */
    constructor(position: Point, angle: number, radius: number, fillColor: string) {
        super();
        this.angle = 0;
        this.radius = radius;

        let pathData = sprintf("M 0 0 A %f,%f 0 0,1 %f %f A %f %f 0 0,1 %f %f Z",
            radius, radius,
            2 * radius, 0,
            radius, radius,
            0, 0);
        this.path = new Path(pathData);
        this.path.fillColor = fillColor;

        this.move(position, this.path.position);
        this.rotate(angle, this.path.position);
    }

    // getCenterOfTop() {
    //     return this.path.curves[1].getLocationAt(this.path.curves[1].length/2).point;
    // }
    //
    // getCenterOfBottom() {
    //     return this.path.curves[4].getLocationAt(this.path.curves[4].length/2).point;
    // }
    //
    // getCenterOfLeft() {
    //     return this.path.segments[0].point
    // }
    //
    // getCenterOfRight() {
    //     return this.path.segments[3].point
    // }
}
