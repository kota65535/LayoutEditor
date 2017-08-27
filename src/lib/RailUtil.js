import { Rail } from "./rails/Rail";
import { StraightRail, DoubleStraightRail, GappedStraightRail } from "./rails/StraightRail";
import { CurveRail, DoubleCurveRail } from "./rails/CurveRail";
import { SimpleTurnout, SymmetricalTurnout, CurvedTurnout } from "./rails/Turnout";
import { Point } from "paper";

// Use ES6 Object Literal Property Value Shorthand to maintain a map
// where the keys share the same names as the classes themselves
const classes = {
    StraightRail,
    DoubleStraightRail,
    GappedStraightRail,
    CurveRail,
    DoubleCurveRail,
    SimpleTurnout,
    SymmetricalTurnout,
    CurvedTurnout,
    Point
};


/**
 * クラス名の文字列からそのクラスのインスタンスを生成するためのプロキシとして働くクラス。
 */
class DynamicClass {
    constructor (className, opts) {
        if (opts) {
            return new classes[className](...opts);
        } else {
            return new classes[className]();
        }
    }
}

/**
 * ある関数の引数名を、文字列の配列として取得する。
 * 注意: デフォルト引数は今のところうまく取得できない。
 * @param func
 * @returns {Array|{index: number, input: string}}
 * @private
 */
function getParamNames(func) {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null) {
        result = [];
    }
    return result;
}


/**
 * 与えられたレールと同じレールを生成する。
 * 同じ引数でnewしたのと同じ効果が得られるため、内部のPathオブジェクトなどは新規に生成される。
 * 注意: コンストラクタの引数と同じ名前のインスタンス変数を保持している必要がある。
 *     上記のgetParamNames()の制約もあるので、デフォルト引数も使ってはいけない。
 *
 * @param rail {Rail}
 * @returns {string}
 */
export function cloneRail(rail) {
    let paramNames = getParamNames(rail.constructor);
    let args = paramNames.map( param => rail[param] );
    console.log(`Cloning ${rail.constructor.name}...`);
    return new DynamicClass(rail.constructor.name, args);
}


/**
 * レールオブジェクトをシリアライズする。
 * @returns {Object}
 */
export function serialize(rail) {
    let paramNames = getParamNames(rail.constructor);
    rail.class = rail.constructor.name;
    paramNames.push("class");
    return JSON.stringify(rail, paramNames);
}

/**
 * レールオブジェクトをデシリアライズする。
 * @param string
 * @returns {DynamicClass}
 */
export function deserialize(string) {
    let json = JSON.parse(string);
    let className = json["class"];
    let paramNames = getParamNames(classes[className].prototype.constructor);
    let params = paramNames.map(name => {
        let paramValue = json[name];
        // 配列ならオブジェクトを生成する。
        // 0番目にクラス名、以降にコンストラクタ引数が続く。
        if (Array.isArray(paramValue)) {
            console.log(`${paramValue[0]} created with ${paramValue.slice(1)}`);
            return new DynamicClass(paramValue[0], paramValue.slice(1))
        } else {
            return paramValue;
        }
    });

    console.log(`Deserialized: ${className} with ${params}`);
    return new DynamicClass(className, params);
}


