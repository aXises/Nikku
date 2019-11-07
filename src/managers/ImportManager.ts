import * as path from "path";
import * as fs from "fs";
import * as util from "util";

import { Queue } from "../utils";
import { AbstractManager } from "./";

const readdir: Function = util.promisify(fs.readdir);

export class ImportManager extends AbstractManager {

    protected readonly modulePathsQueue: string[];

    public constructor(modulePaths?: string[]) {
        super();
        this.modulePathsQueue = modulePaths ? modulePaths : (this.botConfig.MODULE_PATHS || []);
    }

    public addImportPath(importPath: string): void {
        if (this.modulePathsQueue.indexOf(importPath) === -1) {
            this.modulePathsQueue.push(importPath);
        } else {
            throw new Error(`Duplicate path "${importPath}".`);
        }
    }

    protected async getImportPaths(): Promise<string[]> {
        const filePaths: string[] = [];
        let temp: string;
        while (Queue.isEmpty(this.modulePathsQueue)) {
            const modulePath = this.modulePathsQueue.shift();
            const currentPath: string = path.resolve(modulePath);
            temp = currentPath; // For logging purposes.
            try {
                const files: string[] = await readdir(currentPath);
                if (files.length === 0) {
                    this.logger.warn(`Empty directory "${currentPath}".`);
                }
                for (const file of files) {
                    const fileName: string = file.split(".")[0];
                    const filePath: string = path.join(modulePath, fileName);
                    if (filePaths.indexOf(filePath) === -1) {
                        filePaths.push(filePath);
                        this.logger.info(`Path detected "${filePath}".`);
                    }
                }
            } catch (error) {
                if (error.code === "ENOENT") {
                    this.logger.warn(`No such directory "${temp}".`);
                } else {
                    this.logger.warn(`FS error while reading "${temp}".`);
                    break;
                }
                if (error instanceof Error) {
                    throw error;
                }
            }
        }
        return filePaths;
    }
}
