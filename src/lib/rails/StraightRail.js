/**
 * Created by tozawa on 2017/07/03.
 */
import { Rail } from "./Rail";
import { StraightRailPart } from "./parts/StraightRailPart";


export class StraightRail extends Rail {

    /**
     * ストレートレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     */
    constructor(startPoint, angle, length) {
        super(startPoint, 0);

        this.length = length;

        this._addRailPart(new StraightRailPart(startPoint, 0, length));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }

    /**
     * レールを複製する。
     * @returns {Object}
     */
    clone() {
        return eval(Rail.evalMeToClone(this));
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
        super(startPoint, angle)

        this.length = length;

        this._addRailPart(new StraightRailPart(startPoint, 0, length));
        this._addRailPart(new StraightRailPart(new Point(startPoint.x, startPoint.y + Rail.SPACE), 0, length));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }

    /**
     * レールを複製する。
     * @returns {Object}
     */
    clone() {
        return eval(Rail.evalMeToClone(this));
    }
}
