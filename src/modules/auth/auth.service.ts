import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/postgres';
import { redis } from '../../db/redis';
import { env } from '../../config/env';
import { JwtAccessPayload, JwtRefreshPayload } from '../../types/common';

const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'seeker' | 'employer';
  name: string;
}

function signTokens(userId: string, role: 'seeker' | 'employer') {
  const tokenId = uuidv4();
  const accessToken = jwt.sign(
    { sub: userId, role } satisfies JwtAccessPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { sub: userId, tokenId } satisfies JwtRefreshPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken, tokenId };
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: 'seeker' | 'employer'
) {
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query<User>(
    'INSERT INTO users(email, password_hash, name, role) VALUES($1,$2,$3,$4) RETURNING id, email, role, name',
    [email, passwordHash, name, role]
  );
  const user = result.rows[0]!;
  const { accessToken, refreshToken, tokenId } = signTokens(user.id, user.role);
  await redis.set(`refresh:${tokenId}`, user.id, 'EX', REFRESH_TTL);
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export async function login(email: string, password: string) {
  const result = await query<User>(
    'SELECT id, email, password_hash, role, name FROM users WHERE email=$1',
    [email]
  );
  const user = result.rows[0];
  if (!user) throw { status: 401, message: 'Invalid credentials' };

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw { status: 401, message: 'Invalid credentials' };

  const { accessToken, refreshToken, tokenId } = signTokens(user.id, user.role);
  await redis.set(`refresh:${tokenId}`, user.id, 'EX', REFRESH_TTL);
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export async function refresh(refreshToken: string) {
  let payload: JwtRefreshPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
  } catch {
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  const storedUserId = await redis.get(`refresh:${payload.tokenId}`);
  if (!storedUserId || storedUserId !== payload.sub) {
    throw { status: 401, message: 'Refresh token revoked or invalid' };
  }

  await redis.del(`refresh:${payload.tokenId}`);

  const result = await query<Pick<User, 'id' | 'role'>>(
    'SELECT id, role FROM users WHERE id=$1',
    [payload.sub]
  );
  const user = result.rows[0];
  if (!user) throw { status: 401, message: 'User not found' };

  const tokens = signTokens(user.id, user.role);
  await redis.set(`refresh:${tokens.tokenId}`, user.id, 'EX', REFRESH_TTL);
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export async function logout(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
    await redis.del(`refresh:${payload.tokenId}`);
  } catch {
    // If token is invalid we still return success — nothing to revoke
  }
}
