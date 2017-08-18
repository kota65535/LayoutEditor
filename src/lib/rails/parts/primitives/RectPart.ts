/**
 * Created by tozawa on 2017/07/03.
 */

import {sprintf} from "sprintf-js";
import {PartBase} from "./PartBase";
import {Color, Path, Point} from "paper";

/**
 * 矩形パーツの基底クラス。
 */
export class RectPart extends PartBase {

    width: number;
    height: number;

    /**
     * 矩形パーツを指定の位置・角度で作成する。
     * @param {Point} position  中心点の位置
     * @param {number} angle    X軸に対する絶対角度
     * @param {number} width    幅
     * @param {number} height   高さ
     * @param {Color} fillColor 色
     */
    constructor(position: Point, angle:number , width: number, height: number, fillColor: string) {
        super();
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

        this.move(position, this._path.position);
        this.rotate(angle, this._path.position);
    }

    /**
     * 上辺の中点を返す。
     * @returns point
     */
    getCenterOfTop(): Point {
        return this._path.curves[1].getLocationAt(this._path.curves[1].length/2).point;
    }

    /**
     * 下辺の中点を返す。
     * @returns point
     */
    getCenterOfBottom(): Point {
        return this._path.curves[4].getLocationAt(this._path.curves[4].length/2).point;
    }

    /**
     * 左辺の中点を返す。
     * @returns point
     */
    getCenterOfLeft(): Point {
        return this._path.segments[0].point
    }

    /**
     * 右辺の中点を返す。
     * @returns point
     */
    getCenterOfRight(): Point {
        return this._path.segments[3].point
    }
}
