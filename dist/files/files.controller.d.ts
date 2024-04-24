/// <reference types="multer" />
import { FilesService } from './files.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class FilesController {
    private readonly filesService;
    private readonly configService;
    constructor(filesService: FilesService, configService: ConfigService);
    findProductImage(res: Response, imageName: string): void;
    uploadProductImage(file: Express.Multer.File): {
        secureUrl: string;
    };
}
