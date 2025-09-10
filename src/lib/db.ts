import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Factory to create a Prisma client extended with Accelerate, with consistent typing
function createPrisma() {
	return new PrismaClient({
		log: ["warn", "error"],
	}).$extends(withAccelerate());
}

type PrismaExtended = ReturnType<typeof createPrisma>;

// Ensure a single PrismaClient instance in dev (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaExtended;
};

export const prisma: PrismaExtended = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export default prisma;
