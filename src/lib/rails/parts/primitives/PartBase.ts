import {Path, Point} from "paper";

export interface PartBase {

    path: Path;
    angle: number;

    /**
     * 現在位置からの相対座標で移動する。
     * @param {Point} difference
     */
    moveRelatively(difference: Point): void;

    /**
     * 基準点の絶対座標で移動する。
     * @param {Point} position
     * @param {Point} anchor
     */
    move(position: Point, anchor: Point): void;

    /**
     * Y軸から時計回りで現在からの相対角度で回転する。
     * @param {number} difference
     * @param {Point} anchor
     */
    rotateRelatively(difference: number, anchor: Point): void;

    /**
     * Y軸から時計回りの絶対角度で回転する。
     * @param {number} angle
     * @param {Point} anchor
     */
    rotate(angle: number, anchor: Point): void;

    /**
     * 現在位置を返す。
     * @return {Point}
     */
    getPosition(): Point;

    /**
     * 現在角度を返す。
     * @return {Point}
     */
    getAngle(): number;

    /**
     * パスを削除する。
     */
    remove(): void;

    /**
     * パスの可視・不可視を設定する。
     * @param {boolean} isVisible
     */
    setVisible(isVisible: boolean): void;

    /**
     * パスの透明度を設定する。
     * @param {number} value
     */
    setOpacity(value: number): void;

    /**
     * 指定されたパスがこのパーツに属するか否かを返す。
     * @param {Path} path
     * @returns {boolean}
     */
    containsPath(path: Path): boolean;
}




