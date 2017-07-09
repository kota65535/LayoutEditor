/**
 * Created by tozawa on 2017/07/03.
 */
import { Rail } from "./Rail";
import { CurveRailPart } from "./CurveRailPart";


export class CurveRail extends Rail {

    /**
     * カーブレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} radius
     * @param {number} centerAngle
     */
    constructor(startPoint, angle, radius, centerAngle) {
        super(angle);

        this.radius = radius;
        this.centerAngle = centerAngle;

        this._addRailPart(new CurveRailPart(startPoint, 0, radius, centerAngle));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}
export class DoubleCurveRail extends Rail {

    /**
     * 複線のダブルカーブレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} outerRadius
     * @param {number} innerRadius
     * @param {number} centerAngle
     */
    constructor(startPoint, angle, outerRadius, innerRadius, centerAngle) {
        super(angle);

        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.centerAngle = centerAngle;

        this._addRailPart(new CurveRailPart(startPoint, 0, outerRadius, centerAngle));
        this._addRailPart(new CurveRailPart(new Point(startPoint.x, startPoint.y + this.RAIL_SPACE), 0, innerRadius, centerAngle));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}

