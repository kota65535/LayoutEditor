import {Joint, JointDirection} from "../src/lib/rails/parts/Joint";
import {Point} from "paper";
import {customMatchers, initCanvas} from "./spec_helper";
import {DetectablePart, DetectionState} from "../src/lib/rails/parts/primitives/DetectablePart";
import {CirclePart} from "../src/lib/rails/parts/primitives/CirclePart";
import {FeederSocket, FlowDirection} from "../src/lib/rails/parts/FeederSocket";
import {StraightRailPart} from "../src/lib/rails/parts/StraightRailPart";
import {RailPartAnchor} from "../src/lib/rails/parts/RailPart";

beforeEach(() => {
    jasmine.addMatchers(customMatchers);
});

describe('FeederSocket', function() {
    beforeAll(() => {
        initCanvas();
    })
    it('creates rectangle at specified position, angle and size.', () => {
        let part = new StraightRailPart(new Point(100,100), 0, 100, RailPartAnchor.START, true);
        let feederSocket = new FeederSocket(part, FlowDirection.START_TO_END);
    });
    it('shows detection area', () => {
        let part = new StraightRailPart(new Point(200,100), 0, 100, RailPartAnchor.START, true);
        let feederSocket = new FeederSocket(part, FlowDirection.START_TO_END);
        feederSocket.enabled = true;
    });
    it("shows that it's OK to connect", () => {
        let part = new StraightRailPart(new Point(300,100), 0, 100, RailPartAnchor.START, true);
        let feederSocket = new FeederSocket(part, FlowDirection.START_TO_END);
        feederSocket.enabled = true;
        feederSocket.connect(true);
    });
    // it("shows that it's OK to connect", () => {
    //     let joint = new Joint(new Point(200,200), 0, JointDirection.SAME_TO_ANGLE, null);
    //     joint.enabled = false;
    //     let gapSocket = new GapSocket(joint);
    //     gapSocket.enabled = true;
    //     gapSocket.connect(true);
    // });
    it("shows that it's successfully connected", () => {
        let part = new StraightRailPart(new Point(400,100), 0, 100, RailPartAnchor.START, true);
        let feederSocket = new FeederSocket(part, FlowDirection.START_TO_END);
        feederSocket.enabled = true;
        feederSocket.connect();
    });

});
