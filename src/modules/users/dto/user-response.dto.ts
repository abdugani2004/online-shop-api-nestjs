import { Exclude } from 'class-transformer';
import { UserRole } from '../../../common/enums/user-role.enum';

export class UserResponseDto {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;

  @Exclude()
  password?: string;
}
