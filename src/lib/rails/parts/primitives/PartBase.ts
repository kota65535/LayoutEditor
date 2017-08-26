import {Path, Point} from "paper";

export abstract class PartBase {

    protected _path: Path;
    protected _angle: number;

    get path(): Path { return this._path; }
    set path(_path: Path) { this._path = _path; }
    get position(): Point { return this.path.position; }
    set position(_position: Point) { this.path.position = _position; }
    get angle(): number { return this._angle; }
    set angle(_angle: number) { this._angle = _angle; }
    get name(): string { return this._path.name };
    set name(name: string) {  this._path.name = name };
    get visible(): boolean { return this._path.visible; }
    set visible(isVisible: boolean) { this._path.visible = isVisible; }
    get opacity(): number { return this._path.opacity; }
    set opacity(value: number) { this._path.opacity = value; }


    constructor() {
        // 角度だけ初期化。他は子クラスに任せる
        this._angle = 0;
    }

    /**
     * 現在位置からの相対座標で移動する。
     * @param difference
     */
    moveRelatively(difference: Point) {
        this.path.position = this.path.position.add(difference);
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

    scale(hor, ver, center = this.path.position) {
        this.path.scale(hor, ver, center);
    }
}
