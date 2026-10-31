import { PrismaClient } from '@prisma/client';
import net from 'net';

const globalForPrisma = global;

let prismaInstance;

try {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: [],
    });
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
  const now = Date.now();
  if (dbOnlineCache !== null && (now - lastCheckTime) < 10000) {
    return dbOnlineCache;
  }

  if (!process.env.DATABASE_URL || !prismaInstance) {
    dbOnlineCache = false;
    lastCheckTime = now;
    return false;
  }

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
}

export default prisma;
