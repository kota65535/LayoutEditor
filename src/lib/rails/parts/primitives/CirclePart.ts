/**
 * Created by tozawa on 2017/07/03.
 */

import {sprintf} from "sprintf-js";
import {Color, Path, Point} from "paper";
import {PartBase} from "./PartBase";

/**
 * 円形パーツの基底クラス。
 */
export class CirclePart implements PartBase {

    position: Point;
    angle: number;
    radius: number;
    path: Path;

    /**
     * 円形パーツを指定の位置・角度で作成する。
     * @param {Point} position  中心点の位置
     * @param {number} angle    X軸に対する絶対角度
     * @param {number} radius   半径
     * @param {Color} fillColor 色
     */
    constructor(position: Point, angle: number, radius: number, fillColor: string) {
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

    moveRelatively(difference: Point) {
        this.path.position = this.path.position.add(difference);
        this.position = this.path.position;
    }

    move(position: Point, anchor: Point) {
        let difference = position.subtract(anchor);
        this.moveRelatively(difference);
    }

    rotateRelatively(difference: number, anchor: Point) {
        this.angle += difference;
        this.path.rotate(difference, anchor);
    }

    rotate(angle: number, anchor: Point) {
        let relAngle = angle - this.angle;
        this.rotateRelatively(relAngle, anchor);
    }

    getPosition(): Point {
        return this.path.position;
    }

    getAngle(): number {
        return this.angle;
    }

    setAngle(angle: number) {
        this.angle = angle;
    }

    remove() {
        this.path.remove();
    }

    setOpacity(value: number) {
        this.path.opacity = value;
    }

    setVisible(isVisible: boolean) {
        this.path.visible = isVisible;
    }

    containsPath(path: Path): boolean {
        return path.id === this.path.id;
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
