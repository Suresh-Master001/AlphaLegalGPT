import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GlobalHistory {
    /**
     * Save a unique Question-Answer pair to global history
     */
    static async save(question, answer) {
        const normalizedQ = question.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();

        // Check if a similar question already exists
        const existing = await prisma.globalHistory.findFirst({
            where: {
                query: {
                    equals: question,
                    mode: 'insensitive'
                }
            }
        });
        
        if (!existing) {
            return prisma.globalHistory.create({
                data: {
                    query: question,
                    response: answer
                }
            });
        }
        return existing;
    }

    /**
     * Return all global history items
     */
    static async getAll() {
        return prisma.globalHistory.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
}

export default prisma;