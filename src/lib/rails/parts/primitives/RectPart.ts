/**
 * Created by tozawa on 2017/07/03.
 */

import {sprintf} from "sprintf-js";
import {PartBase} from "./PartBase";
import {Color, Path, Point} from "paper";

/**
 * 矩形パーツの基底クラス。
 */
export class RectPart implements PartBase {

    position: Point;
    angle: number;
    width: number;
    height: number;
    path: Path;

    /**
     * 矩形パーツを指定の位置・角度で作成する。
     * @param {Point} position  中心点の位置
     * @param {number} angle    X軸に対する絶対角度
     * @param {number} width    幅
     * @param {number} height   高さ
     * @param {Color} fillColor 色
     */
    constructor(position: Point, angle:number , width: number, height: number, fillColor: string) {
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

    // 現在位置はこの矩形の中心
    getPosition(): Point {
        return this.path.position;
    }

    getAngle(): number {
        return this.angle;
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

    /**
     * 上辺の中点を返す。
     * @returns {"paper".Point}
     */
    getCenterOfTop(): Point {
        return this.path.curves[1].getLocationAt(this.path.curves[1].length/2).point;
    }

    /**
     * 下辺の中点を返す。
     * @returns {"paper".Point}
     */
    getCenterOfBottom(): Point {
        return this.path.curves[4].getLocationAt(this.path.curves[4].length/2).point;
    }

    /**
     * 左辺の中点を返す。
     * @returns {"paper".Point}
     */
    getCenterOfLeft(): Point {
        return this.path.segments[0].point
    }

    /**
     * 右辺の中点を返す。
     * @returns {"paper".Point}
     */
    getCenterOfRight(): Point {
        return this.path.segments[3].point
    }
}
