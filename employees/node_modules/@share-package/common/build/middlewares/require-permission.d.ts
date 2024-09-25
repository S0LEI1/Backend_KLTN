import { Request, Response, NextFunction } from 'express';
export declare const requirePermission: (permission: string) => (req: Request, res: Response, next: NextFunction) => void;
