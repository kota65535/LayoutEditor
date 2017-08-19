/**
 * Created by tozawa on 2017/07/03.
 */
import { Rail } from "./Rail";
import { RailPartAnchor } from "./parts/RailPart";
import { CurveRailPart } from "./parts/CurveRailPart";
import {Point} from "paper";


export class CurveRail extends Rail {

    radius: number;
    centerAngle: number;

    /**
     * カーブレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} radius
     * @param {number} centerAngle
     */
    constructor(startPoint: Point, angle: number, radius: number, centerAngle: number) {
        super(startPoint, 0);

        this.radius = radius;
        this.centerAngle = centerAngle;

        this.angle = 0;
        this.addRailPart(new CurveRailPart(startPoint, 0, radius, centerAngle, RailPartAnchor.START, true));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}


export class DoubleCurveRail extends Rail {

    innerRadius: number;
    outerRadius: number;
    centerAngle: number;

    /**
     * 複線のダブルカーブレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} outerRadius
     * @param {number} innerRadius
     * @param {number} centerAngle
     */
    constructor(startPoint, angle, outerRadius, innerRadius, centerAngle) {
        super(startPoint, angle)

        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.centerAngle = centerAngle;

        this.addRailPart(new CurveRailPart(startPoint, 0, outerRadius, centerAngle, RailPartAnchor.START, true));
        this.addRailPart(new CurveRailPart(new Point(startPoint.x, startPoint.y + Rail.SPACE), 0, innerRadius, centerAngle, RailPartAnchor.START, true));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}

