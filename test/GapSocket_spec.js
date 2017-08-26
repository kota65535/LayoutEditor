import {Joint, JointDirection} from "../src/lib/rails/parts/Joint";
import {Point} from "paper";
import {customMatchers, initCanvas} from "./spec_helper";
import {DetectablePart, DetectionState} from "../src/lib/rails/parts/primitives/DetectablePart";
import {CirclePart} from "../src/lib/rails/parts/primitives/CirclePart";
import {GapSocket} from "../src/lib/rails/parts/GapSocket";

beforeEach(() => {
    jasmine.addMatchers(customMatchers);
});

describe('GapSocket', function() {
    beforeAll(() => {
        initCanvas();
    })
    it('creates rectangle at specified position, angle and size.', () => {
        let joint = new Joint(new Point(100,100), 0, JointDirection.SAME_TO_ANGLE, null);
        let gapSocket = new GapSocket(joint);
    });
    it('shows detection area', () => {
        let joint = new Joint(new Point(100,200), 0, JointDirection.SAME_TO_ANGLE, null);
        joint.enabled = false;
        let gapSocket = new GapSocket(joint);
        gapSocket.enabled = true;
    });
    it("shows that it's OK to connect", () => {
        let joint = new Joint(new Point(200,200), 0, JointDirection.SAME_TO_ANGLE, null);
        joint.enabled = false;
        let gapSocket = new GapSocket(joint);
        gapSocket.enabled = true;
        gapSocket.connect(true);
    });
    it("shows that it's successfully connected", () => {
        let joint = new Joint(new Point(300,200), 0, JointDirection.SAME_TO_ANGLE, null);
        joint.enabled = false;
        let gapSocket = new GapSocket(joint);
        gapSocket.enabled = true;
        gapSocket.connect();
    });

});
