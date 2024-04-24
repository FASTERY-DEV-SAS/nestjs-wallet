import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    createUser(createUserDto: CreateUserDto): Promise<{
        token: string;
        id: string;
        email: string;
        fullName: string;
        id_user: string;
        type_id_user: string;
        password: string;
        isActive: boolean;
        roles: string[];
        createDate: Date;
        updateDate: Date;
        wallet: import("../wallets/entities/wallet.entity").Wallet;
        category: import("../categories/entities/category.entity").Category;
    }>;
    loginUser(loginUserDto: LoginUserDto): Promise<{
        token: string;
        id: string;
        email: string;
        fullName: string;
        id_user: string;
        type_id_user: string;
        password: string;
        isActive: boolean;
        roles: string[];
        createDate: Date;
        updateDate: Date;
        wallet: import("../wallets/entities/wallet.entity").Wallet;
        category: import("../categories/entities/category.entity").Category;
    }>;
    checkAuthStatus(user: User): Promise<{
        token: string;
        id: string;
        email: string;
        fullName: string;
        id_user: string;
        type_id_user: string;
        password: string;
        isActive: boolean;
        roles: string[];
        createDate: Date;
        updateDate: Date;
        wallet: import("../wallets/entities/wallet.entity").Wallet;
        category: import("../categories/entities/category.entity").Category;
    }>;
}
