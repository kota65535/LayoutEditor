import {Group, Path, Point} from "paper";
import {PartBase} from "./PartBase";

export abstract class MultiPartBase extends PartBase {

    parts: PartBase[];
    pathGroup: Group;

    // このクラス自身が持つ _angle, _position は一切使われない
    get angle() { return this.parts[0].angle; }
    set angle(angle: number) { this.parts[0].angle = this.parts[0].angle; }
    get position() { return this.parts[0].position; }
    set position(position: Point) { this.parts[0].position = this.parts[0].position; }
    get visible(): boolean { return this.pathGroup.visible; }
    set visible(isVisible: boolean) { this.pathGroup.visible = isVisible; }
    get opacity(): number { return this.pathGroup.opacity; }
    set opacity(value: number) { this.pathGroup.opacity = value; }


    constructor(position: Point, angle: number, parts: PartBase[]) {
        super();
        this.parts = parts;

        this.pathGroup = new Group();
        this.parts.forEach(part => this.pathGroup.addChild(part.path));

        this.move(position, this.parts[0].position);
        this.rotate(angle, this.parts[0].position);

        this._path = this.parts[0].path;
    }

    moveRelatively(difference: Point) {
        this.parts.forEach(part => part.moveRelatively(difference));
    }

    move(position: Point, anchor: Point = this.position) {
        let difference = position.subtract(anchor);
        this.moveRelatively(difference);
    }

    rotateRelatively(difference: number, anchor: Point = this.position) {
        this.parts.forEach(part => part.rotateRelatively(difference, anchor));
    }

    rotate(angle: number, anchor: Point = this.position) {
        let relAngle = angle - this.parts[0].angle;
        this.rotateRelatively(relAngle, anchor);
    }

    /**
     * パスを削除する。
     */
    remove() {
        this.pathGroup.remove();
    }

    /**
     * 指定されたパスがこのパーツに属するか否かを返す。
     * @param path
     * @returns if this part contains given path
     */
    containsPath(path: Path): boolean {
        return this.parts.map(part => part.path.id).includes(path.id);
    }

    // TODO: RailクラスのgetBoundsともどもプロパティにして削除する
    getBounds() {
        return this.pathGroup.bounds;
    }

    scale(hor, ver, center = this.path.position) {
        this.pathGroup.scale(hor, ver, center);
    }
}
