import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserData: CreateUserDto): Promise<import(".").UserDocument>;
    findAll(): Promise<import(".").UserDocument[]>;
    getProfile(req: any): Promise<import(".").UserDocument>;
    findOne(id: string): Promise<import(".").UserDocument>;
    update(id: string, updateData: any): Promise<import(".").UserDocument>;
    remove(id: string): Promise<void>;
    verifyUser(id: string): Promise<import(".").UserDocument>;
}
