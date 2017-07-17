/**
 * Created by tozawa on 2017/07/17.
 */

import loglevel from "loglevel";
import prefix from "loglevel-plugin-prefix";
// import logdown from "logdown";


export default function getLogger(name, level = "INFO") {
    prefix.apply(loglevel, {
        template: "[%t] %l (%n):"
    });
    let logger = loglevel.getLogger(name);
    logger.setLevel(level);
    return logger;
};

// logdownはブラウザのDevToolで見ると綺麗だが、WebStormでは残念な感じになる
// localStorage.debug = "*";
// export default function getLogger(name) {
//     let logger = logdown(name);
//     return logger;
// };
