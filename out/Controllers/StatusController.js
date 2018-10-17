"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const c4webservice_1 = require("c4webservice");
const C4ApplicationInfo_1 = require("../C4FrameworkTypes/C4ApplicationInfo");
const __1 = require("..");
let StatusController = class StatusController {
    static Status() {
        return {
            code: 600,
            msg: 'Succeed',
            data: C4ApplicationInfo_1.ServiceStatus || {
                Status: "Unknown",
                LoadBalance: __1.default.getConfig().LoadBalance // 提供自身的负载均衡提示
            }
        };
    }
};
__decorate([
    c4webservice_1.Controller.RequestMapping({
        Path: "/Status",
        Method: "GET",
        Produces: "application/json"
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatusController, "Status", null);
StatusController = __decorate([
    c4webservice_1.Controller.RestController()
], StatusController);
exports.default = StatusController;
//# sourceMappingURL=StatusController.js.map