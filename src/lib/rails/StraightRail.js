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
        let part = new StraightRailPart_1.StraightRailPart(startPoint, 0, length, RailPart_1.RailPartAnchor.START, hasFeederSocket);
        super(startPoint, 0, [part]);
        this.length = length;
        this.hasFeederSocket = hasFeederSocket;
        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);
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
        let parts = [
            new StraightRailPart_1.StraightRailPart(startPoint, 0, length, RailPart_1.RailPartAnchor.START, true),
            new StraightRailPart_1.StraightRailPart(new paper_1.Point(startPoint.x, startPoint.y + Rail_1.Rail.SPACE), 0, length, RailPart_1.RailPartAnchor.START, true)
        ];
        super(startPoint, angle, parts);
        this.length = length;
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
        let parts = [
            new StraightRailPart_1.StraightRailPart(startPoint, 0, length, RailPart_1.RailPartAnchor.START, false)
        ];
        super(startPoint, 0, parts);
        this.length = length;
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