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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesController = void 0;
const common_1 = require("@nestjs/common");
const classes_service_1 = require("./classes.service");
const drive_service_1 = require("./drive.service");
const drive_util_1 = require("./drive.util");
const create_class_dto_1 = require("./dto/create-class.dto");
const update_class_dto_1 = require("./dto/update-class.dto");
const auth_guard_1 = require("../auth/auth.guard");
let ClassesController = class ClassesController {
    classesService;
    driveService;
    constructor(classesService, driveService) {
        this.classesService = classesService;
        this.driveService = driveService;
    }
    findAll(subjectId, week) {
        const weekNum = week ? parseInt(week, 10) : undefined;
        return this.classesService.findAll(subjectId, weekNum);
    }
    findOne(id) {
        return this.classesService.findOne(id);
    }
    async fileInfo(id) {
        const classItem = await this.classesService.findOne(id);
        const info = await this.driveService.getFileInfo(classItem.url);
        return { downloadUrl: info ? (0, drive_util_1.buildDriveDirectUrl)(info.fileId) : null, ...info };
    }
    create(dto) {
        return this.classesService.create(dto);
    }
    update(id, dto) {
        return this.classesService.update(id, dto);
    }
    remove(id) {
        return this.classesService.remove(id);
    }
};
exports.ClassesController = ClassesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('subjectId')),
    __param(1, (0, common_1.Query)('week')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/file-info'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "fileInfo", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_class_dto_1.CreateClassDto]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_dto_1.UpdateClassDto]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "remove", null);
exports.ClassesController = ClassesController = __decorate([
    (0, common_1.Controller)('classes'),
    __metadata("design:paramtypes", [classes_service_1.ClassesService,
        drive_service_1.DriveService])
], ClassesController);
//# sourceMappingURL=classes.controller.js.map