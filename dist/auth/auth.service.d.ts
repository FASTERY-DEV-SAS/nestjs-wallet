import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    create(createUserDto: CreateUserDto): Promise<{
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
    login(loginUserDto: LoginUserDto): Promise<{
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
    private getJwtToken;
    private handleDBError;
}
