/**
 * Created by tozawa on 2017/07/03.
 */

import {sprintf} from "sprintf-js";
import {Color, Path, Point} from "paper";
import {PartBase} from "./PartBase";

/**
 * 三角形パーツの基底クラス
 */
export class TrianglePart extends PartBase {

    width: number;
    height: number;

    /**
     * 三角形パーツを指定の位置・角度で作成する。
     * @param {Point} position  中心点の位置
     * @param {number} angle    X軸に対する絶対角度
     * @param {number} width    幅
     * @param {number} height   高さ
     * @param {Color} fillColor 色
     */
    constructor(position: Point, angle: number, width: number, height: number, fillColor: Color) {
        super();
        this.angle = 0;
        this.width = width;
        this.height = height;

        // パスの生成
        let pathData = sprintf("M 0 0 L %f %f L %f %f Z",
            this.width/2, this.height,
            -this.width/2, this.height,
        );

        this.path = new Path(pathData);
        this.path.fillColor = fillColor;

        this.move(position, this.path.position);
        this.rotate(angle, this.path.position);
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
        return this.path.curves[1].getLocationAt(this.path.curves[1].length/2).point;
    }
}
