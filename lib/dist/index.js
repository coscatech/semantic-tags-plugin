"use strict";
/**
 * COSCA Semantic Analysis Engine
 * Core infrastructure pattern detection without hardcoded examples
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticAnalyzer = void 0;
// Re-export everything from the semantic engine
__exportStar(require("./semantic-engine"), exports);
// Maintain backward compatibility
var semantic_engine_1 = require("./semantic-engine");
Object.defineProperty(exports, "SemanticAnalyzer", { enumerable: true, get: function () { return semantic_engine_1.SemanticEngine; } });
//# sourceMappingURL=index.js.map