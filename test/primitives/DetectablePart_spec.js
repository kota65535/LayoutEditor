import {RectPart} from "../../src/lib/rails/parts/primitives/RectPart";
import {Point} from "paper";
import {customMatchers, initCanvas} from "../spec_helper";
import {DetectablePart, DetectionState} from "../../src/lib/rails/parts/primitives/DetectablePart";
import {CirclePart} from "../../src/lib/rails/parts/primitives/CirclePart";

beforeEach(() => {
    jasmine.addMatchers(customMatchers);
});

describe('DetectablePart', function() {
    beforeAll(() => {
        initCanvas();
    })
    it('creates rectangle at specified position, angle and size.', () => {
        let part = new DetectablePart(new Point(100,100), 0,
            new RectPart(new Point(100,100), 0, 10, 10, 'blue'),
            new CirclePart(new Point(100,100), 0, 25, 'red'),
            ["red", "blue", "green"]
        );
        let part2 = new DetectablePart(new Point(200,100), 0,
            new RectPart(new Point(100,100), 0, 10, 10, 'blue'),
            new CirclePart(new Point(100,100), 0, 25, 'red'),
            ["red", "blue", "green"]
        );
        part2.enabled = true;
    });

    it("sets detection state when it's enabled", function() {
        let part1 = new DetectablePart(new Point(100,200), 0,
            new RectPart(new Point(100,100), 0, 10, 10, 'blue'),
            new CirclePart(new Point(100,100), 0, 25, 'red'),
            ["red", "blue", "green"]
        );
        part1.enabled = true;
        let part2 = new DetectablePart(new Point(200,200), 0,
            new RectPart(new Point(100,100), 0, 10, 10, 'blue'),
            new CirclePart(new Point(100,100), 0, 25, 'red'),
            ["red", "blue", "green"]
        );
        part2.enabled = true;

        part1.detectionState = DetectionState.DETECTING;
        expect(part1.detectionState).toBe(DetectionState.DETECTING);

        part2.detectionState = DetectionState.AFTER_DETECT;
        expect(part2.detectionState).toBe(DetectionState.AFTER_DETECT);
    });
    it("cannot set detection state when it's not enabled", function() {
        let part = new DetectablePart(new Point(100,200), 0,
            new RectPart(new Point(100,100), 0, 10, 10, 'blue'),
            new CirclePart(new Point(100,100), 0, 25, 'red'),
            ["red", "blue", "green"]
        );
        part.detectionState = DetectionState.DETECTING;
        expect(part.detectionState).toBe(DetectionState.BEFORE_DETECT);
    });

    // it('moves to specified point on the basis of the position', function() {
    //     let part = new MultiPartBase(new Point(100,100), 0, [
    //         new RectPart(new Point(100,100), 0, 50, 50, 'blue'),
    //         new CirclePart(new Point(125,125), 0, 25, 'red')
    //     ]);
    //     part.move(new Point(100, 200));
    //     expect(part.position).toBeAt(new Point(100,200));
    // });
    // it('moves to specified point on the basis of the center of top', function() {
    //     let part = new MultiPartBase(new Point(100,100), 0, [
    //         new RectPart(new Point(100,100), 0, 50, 50, 'blue'),
    //         new CirclePart(new Point(125,125), 0, 25, 'red')
    //     ]);
    //     part.move(new Point(200, 200), part.parts[0].getCenterOfTop());
    //     // expect(part.position).toBeAt(new Point(200,225));
    // });
    // it('moves relatively by specified distance on the basis of the position', function() {
    //     let part = new MultiPartBase(new Point(100,100), 0, [
    //         new RectPart(new Point(100,100), 0, 50, 50, 'blue'),
    //         new CirclePart(new Point(125,125), 0, 25, 'red')
    //     ]);
    //     part.moveRelatively(new Point(200, 100));
    //     expect(part.position).toBeAt(new Point(300, 200));
    // });
    //
    // it('rotates to specified angle around the position', function() {
    //     let part = new MultiPartBase(new Point(100,300), 0, [
    //         new RectPart(new Point(100,100), 0, 50, 50, 'blue'),
    //         new CirclePart(new Point(125,125), 0, 25, 'red')
    //     ]);
    //     part.rotate(90);
    //     expect(part.position).toBeAt(new Point(100, 300));
    //     expect(part.angle).toBe(90);
    // });
    // it('rotates to specified angle around the specified position', function() {
    //     let part = new MultiPartBase(new Point(200,300), 0, [
    //         new RectPart(new Point(100,100), 0, 50, 50, 'blue'),
    //         new CirclePart(new Point(125,125), 0, 25, 'red')
    //     ]);
    //     part.rotate(90, part.parts[0].getCenterOfTop());
    //     expect(part.position).toBeAt(new Point(175, 275));
    //     expect(part.angle).toBe(90);
    // });
    // it('rotates by specified angle around the position', function() {
    //     let part = new MultiPartBase(new Point(300,300), 45, [
    //         new RectPart(new Point(100,100), 0, 50, 50, 'blue'),
    //         new CirclePart(new Point(125,125), 0, 25, 'red')
    //     ]);
    //     part.rotateRelatively(15);
    //     expect(part.position).toBeAt(new Point(300, 300));
    //     expect(part.angle).toBe(60);
    // });
    //
    // it('removes existing part', function() {
    //     let part = new MultiPartBase(new Point(100,400), 45, [
    //         new RectPart(new Point(100,100), 0, 50, 50, 'blue'),
    //         new CirclePart(new Point(125,125), 0, 25, 'red')
    //     ]);
    //     part.remove();
    // });
    // it('set opacity', function() {
    //     let part = new MultiPartBase(new Point(300,400), 45, [
    //         new RectPart(new Point(100,100), 0, 50, 50, 'blue'),
    //         new CirclePart(new Point(125,125), 0, 25, 'red')
    //     ]);
    //     part.opacity = 0.5;
    //     expect(part.opacity).toBe(0.5);
    // });
});
