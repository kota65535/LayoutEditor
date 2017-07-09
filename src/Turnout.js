/**
 * Created by tozawa on 2017/07/03.
 */
import { Rail } from "./Rail";
import { AnchorType } from "./RailPart";
import { StraightRailPart } from "./StraightRailPart";
import { CurveRailPart } from "./CurveRailPart";

/**
 * 分岐先の方向を指定するための識別子。
 * @type {{LEFT: Symbol, RIGHT: Symbol}}
 */
export const Direction = {
    LEFT: Symbol(),
    RIGHT: Symbol()
}

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
        super(angle);

        this.length = length;
        this.radius = radius;
        this.centerAngle = centerAngle;

        this._addRailPart(new StraightRailPart(startPoint, 0, length));
        switch (direction) {
            case Direction.LEFT:
                this._addRailPart(new CurveRailPart(startPoint, -180, radius, centerAngle, AnchorType.END));
                break;
            case Direction.RIGHT:
                this._addRailPart(new CurveRailPart(startPoint, 0, radius, centerAngle));
                break;
        }

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
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
        super(angle);

        this.radius = radius;
        this.centerAngle = centerAngle;

        this._addRailPart(new CurveRailPart(startPoint, 0, radius, centerAngle));
        this._addRailPart(new CurveRailPart(startPoint, 180, radius, centerAngle, AnchorType.END));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
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
        super(angle);

        this.angle = angle;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.centerAngle = centerAngle;
        let anchorJoint;

        switch (direction) {
            case Direction.LEFT:
                this._addRailPart(new CurveRailPart(startPoint, 180, outerRadius, centerAngle, AnchorType.END));
                this._addRailPart(new CurveRailPart(startPoint, 180, innerRadius, centerAngle, AnchorType.END));
                this.angle = angle + 180;
                anchorJoint = this.joints[1];
                break;
            case Direction.RIGHT:
                this._addRailPart(new CurveRailPart(startPoint, 0, outerRadius, centerAngle));
                this._addRailPart(new CurveRailPart(startPoint, 0, innerRadius, centerAngle));
                this.angle = angle;
                anchorJoint = this.joints[0];
                break;
        }

        this.move(startPoint, anchorJoint);
        this.rotate(this.angle, anchorJoint);

        this.showJoints();
    }

}
