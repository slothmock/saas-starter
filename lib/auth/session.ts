import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => hash(password, SALT_ROUNDS);

export const comparePasswords = async (
  plainTextPassword: string,
  hashedPassword: string
) => compare(plainTextPassword, hashedPassword);

type SessionData = {
  user: { id: number };
  expires: string;
};

export const signToken = async (payload: SessionData) => 
  new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);

export const verifyToken = async (input: string) => {
  const { payload } = await jwtVerify(input, key, { algorithms: ['HS256'] });
  return payload as SessionData;
};

export const getSession = async () => {
  const session = (await cookies()).get('session')?.value;
  return session ? await verifyToken(session) : null;
};

export const setSession = async (user: NewUser) => {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id! },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
};