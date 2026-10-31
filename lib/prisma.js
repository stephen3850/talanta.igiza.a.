import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

let prismaInstance;

try {
  if (typeof window === 'undefined') {
    prismaInstance =
      globalForPrisma.prisma ||
      new PrismaClient({
        log: [],
      });
  } else {
    prismaInstance = null;
  }
} catch (e) {
  prismaInstance = null;
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production' && prismaInstance) {
  globalForPrisma.prisma = prismaInstance;
}

let dbOnlineCache = null;
let lastCheckTime = 0;

export async function isDatabaseOnline() {
  if (typeof window !== 'undefined') return false;

  const now = Date.now();
  if (dbOnlineCache !== null && (now - lastCheckTime) < 10000) {
    return dbOnlineCache;
  }

  if (!process.env.DATABASE_URL || !prismaInstance) {
    dbOnlineCache = false;
    lastCheckTime = now;
    return false;
  }

  try {
    const netModule = await import('net');
    const net = netModule.default || netModule;
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(200);

      socket.on('connect', () => {
        socket.destroy();
        dbOnlineCache = true;
        lastCheckTime = Date.now();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        dbOnlineCache = false;
        lastCheckTime = Date.now();
        resolve(false);
      });

      socket.on('error', () => {
        socket.destroy();
        dbOnlineCache = false;
        lastCheckTime = Date.now();
        resolve(false);
      });

      let host = 'localhost';
      let port = 5432;
      try {
        const urlString = process.env.DATABASE_URL;
        const match = urlString.match(/@([^:/]+):(\d+)/);
        if (match) {
          host = match[1];
          port = Number(match[2]);
        }
      } catch {}

      socket.connect(port, host);
    });
  } catch (err) {
    dbOnlineCache = false;
    lastCheckTime = now;
    return false;
  }
}

export default prisma;
