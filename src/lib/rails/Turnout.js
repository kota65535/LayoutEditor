/**
 * Created by tozawa on 2017/07/03.
 */
import { Rail } from "./Rail";
import { RailPart } from "./parts/RailPart";
import { StraightRailPart } from "./parts/StraightRailPart";
import { CurveRailPart } from "./parts/CurveRailPart";

/**
 * 分岐先の方向を指定するための識別子。
 * @type {{LEFT: Symbol, RIGHT: Symbol}}
 */
export const Direction = {
    LEFT: Symbol(),
    RIGHT: Symbol()
}


export class Turnout extends Rail {
    constructor(startPoint, angle) {
        super(startPoint, angle);
    }
}

/**
 * TODO: ジョイントオーダーは左回りで統一すべきか、分岐方向で統一すべきか決める。
 */


export class SimpleTurnout extends Rail {
    /**
     * 片開きのポイントを生成する。
     * @param {Point} startPoint
     * @param {number} length
     * @param {number} angle
     * @param {number} radius
     * @param {number} centerAngle
     * @param {Direction} direction
     */
    constructor(startPoint, angle, length, radius, centerAngle, direction) {
        super(startPoint, angle)

        this.length = length;
        this.radius = radius;
        this.centerAngle = centerAngle;
        this.flowDirection = direction;

        this.addRailPart(new StraightRailPart(startPoint, 0, length, RailPart.Anchor.START, false));
        switch (direction) {
            case Direction.LEFT:
                this.addRailPart(new CurveRailPart(startPoint, -180, radius, centerAngle, RailPart.Anchor.END, false));
                break;
            case Direction.RIGHT:
                this.addRailPart(new CurveRailPart(startPoint, 0, radius, centerAngle, RailPart.Anchor.START, false));
                break;
        }

        this.conductionMap = {
            0: 0,
            1: 1
        };

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();

        this.conductionState = 0;
    }


    /**
     * レールを複製する。
     * @returns {Object}
     */
    clone() {
        return eval(Rail.evalMeToClone(this));
    }
}

export class SymmetricalTurnout extends Rail {
    /**
     * Y字ポイントを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} radius
     * @param {number} centerAngle
     */
    constructor(startPoint, angle, radius, centerAngle) {
        super(startPoint, angle)

        this.radius = radius;
        this.centerAngle = centerAngle;

        this.addRailPart(new CurveRailPart(startPoint, 0, radius, centerAngle, RailPart.Anchor.START, false));
        this.addRailPart(new CurveRailPart(startPoint, 180, radius, centerAngle, RailPart.Anchor.END, false));

        this.conductionMap = {
            0: 0,
            1: 1
        };

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


export class CurvedTurnout extends Rail {
    /**
     * カーブポイントを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} outerRadius
     * @param {number} innerRadius
     * @param {number} centerAngle
     * @param {Direction} direction
     */
    constructor(startPoint, angle, outerRadius, innerRadius, centerAngle, direction) {
        super(startPoint, angle)

        this.angle = angle;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.centerAngle = centerAngle;
        this.flowDirection = direction;

        let anchorJoint;

        switch (direction) {
            case Direction.LEFT:
                this.addRailPart(new CurveRailPart(startPoint, 180, outerRadius, centerAngle, RailPart.Anchor.END, false));
                this.addRailPart(new CurveRailPart(startPoint, 180, innerRadius, centerAngle, RailPart.Anchor.END, false));
                this.angle = angle + 180;
                anchorJoint = this.joints[1];
                break;
            case Direction.RIGHT:
                this.addRailPart(new CurveRailPart(startPoint, 0, outerRadius, centerAngle, RailPart.Anchor.START, false));
                this.addRailPart(new CurveRailPart(startPoint, 0, innerRadius, centerAngle, RailPart.Anchor.START, false));
                this.angle = angle;
                anchorJoint = this.joints[0];
                break;
        }

        this.move(startPoint, anchorJoint);
        this.rotate(this.angle, anchorJoint);

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
