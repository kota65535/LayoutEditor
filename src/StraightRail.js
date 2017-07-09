/**
 * Created by tozawa on 2017/07/03.
 */
import { Rail } from "./Rail";
import { StraightRailPart } from "./StraightRailPart";


export class StraightRail extends Rail {

    /**
     * ストレートレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     */
    constructor(startPoint, angle, length) {
        super(angle);

        this.length = length;

        this._addRailPart(new StraightRailPart(startPoint, 0, length));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}

export class DoubleStraightRail extends Rail {

    /**
     * 複線のダブルストレートレールを作成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     */
    constructor(startPoint, angle, length) {
        super(angle);

        this.length = length;

        this._addRailPart(new StraightRailPart(startPoint, 0, length));
        this._addRailPart(new StraightRailPart(new Point(startPoint.x, startPoint.y + this.RAIL_SPACE), 0, length));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}
