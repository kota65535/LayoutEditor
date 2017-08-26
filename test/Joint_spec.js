import {Joint, JointDirection} from "../src/lib/rails/parts/Joint";
import {Point} from "paper";
import {customMatchers, initCanvas} from "./spec_helper";
import {DetectablePart, DetectionState} from "../src/lib/rails/parts/primitives/DetectablePart";
import {CirclePart} from "../src/lib/rails/parts/primitives/CirclePart";

beforeEach(() => {
    jasmine.addMatchers(customMatchers);
});

describe('Joint', function() {
    beforeAll(() => {
        initCanvas();
    })
    it('creates rectangle at specified position, angle and size.', () => {
        new Joint(new Point(100,100), 0, JointDirection.SAME_TO_ANGLE, null);
        new Joint(new Point(200,100), 90, JointDirection.SAME_TO_ANGLE, null);
        new Joint(new Point(300,100), 45, JointDirection.REVERSE_TO_ANGLE, null);
    });
    it('connects with specified joint when they are the same direction', () => {
        let joint1 = new Joint(new Point(100,200), 0, JointDirection.SAME_TO_ANGLE, null);
        let joint2 = new Joint(new Point(100,200), 0, JointDirection.REVERSE_TO_ANGLE, null);
        joint1.connect(joint2, true);
    });
    it('connects with specified joint when they are the same direction 2', () => {
        let joint1 = new Joint(new Point(200,200), 90, JointDirection.SAME_TO_ANGLE, null);
        let joint2 = new Joint(new Point(200,200), 270, JointDirection.SAME_TO_ANGLE, null);
        joint1.connect(joint2);
    });
    it('connects with specified joint when they are the same direction 3', () => {
        let joint1 = new Joint(new Point(300,200), 180, JointDirection.REVERSE_TO_ANGLE, null);
        let joint2 = new Joint(new Point(300,200), 0, JointDirection.REVERSE_TO_ANGLE, null);
        joint1.connect(joint2);
    });
});
