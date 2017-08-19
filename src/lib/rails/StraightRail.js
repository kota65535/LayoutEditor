"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by tozawa on 2017/07/03.
 */
const Rail_1 = require("./Rail");
const RailPart_1 = require("./parts/RailPart");
const StraightRailPart_1 = require("./parts/StraightRailPart");
const paper_1 = require("paper");
class StraightRail extends Rail_1.Rail {
    /**
     * ストレートレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     * @param {boolean} hasFeederSocket
     */
    constructor(startPoint, angle, length, hasFeederSocket) {
        super(startPoint, 0);
        this.length = length;
        this.hasFeederSocket = hasFeederSocket;
        this.addRailPart(new StraightRailPart_1.StraightRailPart(startPoint, 0, length, RailPart_1.RailPartAnchor.START, hasFeederSocket));
        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);
        this.showJoints();
    }
}
exports.StraightRail = StraightRail;
class DoubleStraightRail extends Rail_1.Rail {
    /**
     * 複線のダブルストレートレールを作成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     */
    constructor(startPoint, angle, length) {
        super(startPoint, angle);
        this.length = length;
        this.addRailPart(new StraightRailPart_1.StraightRailPart(startPoint, 0, length, RailPart_1.RailPartAnchor.START, true));
        this.addRailPart(new StraightRailPart_1.StraightRailPart(new paper_1.Point(startPoint.x, startPoint.y + Rail_1.Rail.SPACE), 0, length, RailPart_1.RailPartAnchor.START, true));
        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);
        this.showJoints();
    }
}
exports.DoubleStraightRail = DoubleStraightRail;
class GappedStraightRail extends Rail_1.Rail {
    /**
     * 両ギャップレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     */
    constructor(startPoint, angle, length) {
        super(startPoint, 0);
        this.length = length;
        this.addRailPart(new StraightRailPart_1.StraightRailPart(startPoint, 0, length, RailPart_1.RailPartAnchor.START, false));
        this.conductionMap = {
            0: []
        };
        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);
        this.showJoints();
    }
}
exports.GappedStraightRail = GappedStraightRail;
//# sourceMappingURL=StraightRail.js.map