import { User } from '@prisma/client';

export type UserResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type JwtPayload = {
  sub: string;
};

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}
