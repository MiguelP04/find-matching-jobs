import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  userId: number;
  email: string;
  rol: UserRole;
}
