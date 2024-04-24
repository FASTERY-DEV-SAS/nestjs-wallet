import { ValidRoles } from '../interfaces/valid-roles';
export declare const META_ROLES = "roles";
export declare const RoleProtected: (...args: ValidRoles[]) => import("@nestjs/common").CustomDecorator<string>;
