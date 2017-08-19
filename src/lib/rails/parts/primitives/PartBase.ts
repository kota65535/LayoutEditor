import {Path, Point} from "paper";

export class PartBase {

    protected _path: Path;
    protected _angle: number;
    protected _position: Point;

    get path() { return this._path; }
    set path(_path: Path) { this._path = _path; }
    get position() { return this._position; }
    set position(_position: Point) { this._position = _position; }
    get angle() { return this._angle; }
    set angle(_angle: number) { this._angle = _angle; }

    /**
     * 現在位置からの相対座標で移動する。
     * @param difference
     */
    moveRelatively(difference: Point) {
        this.path.position = this.path.position.add(difference);
        this._position = this.path.position;
    }

    /**
     * 基準点の絶対座標で移動する。
     * @param position 移動先の座標
     * @param anchor 基準点。デフォルトは現在位置
     */
    move(position: Point, anchor: Point = this.position): void {
        let difference = position.subtract(anchor);
        this.moveRelatively(difference);
    }

    /**
     * Y軸から時計回りで現在からの相対角度で回転する。
     * @param difference
     * @param anchor 回転の中心点。デフォルトは現在位置
     */
    rotateRelatively(difference: number, anchor: Point = this.position) {
        this.angle += difference;
        this.path.rotate(difference, anchor);
    }

    /**
     * Y軸から時計回りの絶対角度で回転する。
     * @param angle
     * @param anchor 回転の中心点。デフォルトは現在位置
     */
    rotate(angle: number, anchor: Point = this.position) {
        let relAngle = angle - this.angle;
        this.rotateRelatively(relAngle, anchor);
    }

    /**
     * パスを削除する。
     */
    remove() {
        this.path.remove();
    }

    /**
     * パスの可視・不可視を設定する。
     * @param isVisible
     */
    setVisible(isVisible: boolean) {
        this.path.visible = isVisible;
    }

    /**
     * パスの透明度を設定する。
     * @param value
     */
    setOpacity(value: number) {
        this.path.opacity = value;
    }

    /**
     * 指定されたパスがこのパーツに属するか否かを返す。
     * @param path
     * @returns if this part contains given path
     */
    containsPath(path: Path): boolean {
        return path.id === this.path.id;
    }

    // TODO: RailクラスのgetBoundsともどもプロパティにして削除する
    getBounds() {
        return this.path.bounds;
    }

    scale(hor, ver) {
        this.path.scale(hor, ver);
    }
}
