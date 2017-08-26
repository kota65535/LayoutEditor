import {GridPaper} from "../src/lib/GridPaper";

// Jasmineで使うCustom Matcher
export let customMatchers = {
    toBeAt: (util, customEqualityTesters) => {
        return {
            compare: (actual, expected) => {
                return {
                    pass: actual.isClose(expected, 0.00001)
                }}}}
};


const BOARD_WIDTH = 6000;     // ボード幅
const BOARD_HEIGHT = 4000;    // ボード高さ
const GRID_SIZE = 100;
const INITIAL_ZOOM = 0.7;
const ZOOM_UNIT = 0.002;
const AVAILABLE_ZOOM_MIN = 0.2;
const AVAILABLE_ZOOM_MAX = 5;

export function initCanvas() {
    // テスト用のcanvas要素を作成する
    let canvas = document.createElement('canvas')
    canvas.id = "test-canvas";
    canvas.style.width = "800px";
    canvas.style.height = "800px";
    document.body.appendChild(canvas);

    // paper.js初期化
    paper.install(window);
    paper.setup("test-canvas");

    // グリッドを表示
    let grid = new GridPaper("test-canvas", BOARD_WIDTH, BOARD_HEIGHT, GRID_SIZE,
        INITIAL_ZOOM, ZOOM_UNIT, AVAILABLE_ZOOM_MIN, AVAILABLE_ZOOM_MAX);
}

