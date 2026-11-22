import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'shortedge_default_jwt_secret_dev';

export interface TokenPayload {
  userId: string;
  role: Role;
  phone: string;
  email?: string | null;
}

export function signToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: '7d'
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
