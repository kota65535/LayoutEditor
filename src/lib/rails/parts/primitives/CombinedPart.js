
/**
 * 複合パーツクラス
 */
export class CombinedPart {

    /**
     * 複合パーツを作成する。
     *
     * @param {Point} position       複合パーツの位置
     * @param {Point} centerPosition 複合パーツの中心点とする位置
     * @param {number} angle         X軸に対する絶対角度
     * @param {Array<Part>} parts    複合パーツを構成するパーツ
     */
    constructor(position, centerPosition, angle, parts) {
        this.parts = parts;
        this.position = position;
        this.centerPosition = centerPosition;
        this.angle = 0;

        this.pathGroup = new paper.Group();
        this.parts.forEach(part => this.pathGroup.addChild(part.path));

        this.move(this.position, this.centerPosition);
        this.rotate(angle, this.centerPosition);
    }

    /**
     * 現在位置からの相対座標で移動する。
     * @param {Point} difference
     */
    moveRelatively(difference) {
        this.parts.forEach(part => part.moveRelatively(difference));
        this.position = this.position.add(difference);
        this.centerPosition = this.centerPosition.add(difference);
    }

    /**
     * 基準点の絶対座標で移動する。
     * @param {Point} position
     * @param {Point} anchor
     */
    move(position, anchor) {
        let difference = position.subtract(anchor);
        this.moveRelatively(difference);
    }

    /**
     * Y軸から時計回りで現在からの相対角度で回転する。
     * @param {number} difference
     * @param {Point} anchor
     */
    rotateRelatively(difference, anchor) {
        this.parts.forEach(part => part.rotateRelatively(difference, anchor));
        this.angle += difference;
        this.position = this.position.rotate(difference, anchor);
        this.centerPosition = this.centerPosition.rotate(difference, anchor);
    }

    /**
     * Y軸から時計回りの絶対角度で回転する。
     * @param {number} angle
     * @param {Point} anchor
     */
    rotate(angle, anchor) {
        let relAngle = angle - this.angle;
        this.rotateRelatively(relAngle, anchor);
    }

    /**
     * 現在位置(この矩形の中心点)を返す。
     *
     * @return {Point}
     */
    getPosition() {
        return this.path.position;
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

    /**
     * パスを削除する。
     */
    remove() {
        this.parts.forEach(part => part.remove());
    }

    /**
     * 指定されたパスがこのパーツに属するか否かを返す。
     * @param path
     * @returns {boolean}
     */
    containsPath(path) {
        return path.id === this.path.id;
    }
}
