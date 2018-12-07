"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConsoleLogger {
    info(message) {
        return Promise.resolve(console.info(message));
    }
    error(message) {
        return Promise.resolve(console.error(message));
    }
    warn(message) {
        return Promise.resolve(console.error(message));
    }
}
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=ILogger.js.map