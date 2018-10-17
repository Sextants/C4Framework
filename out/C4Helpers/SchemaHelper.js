"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const c4ajv_1 = require("c4ajv");
const Path = require("path");
const SchemaDir = './schema';
/**
 * 加载AJV的JSON Schema文件
 * 从SchemaDir目录中扫描所有文件加载
 * @param c4 C4Framework
 */
function SchemaHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        if (c4.getChecker() === null) {
            let SchemaPath = Path.join(process.cwd(), SchemaDir);
            let AJV = new c4ajv_1.default();
            yield AJV.init(SchemaPath);
            c4.setChecker(AJV);
        }
        return true;
    });
}
exports.default = SchemaHelper;
//# sourceMappingURL=SchemaHelper.js.map