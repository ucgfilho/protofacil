import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, OR: [{ ownerId: userId }, { isPublic: true }] },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    return project;
  }

  async create(userId: string, data: { name: string }) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        ownerId: userId,
      },
    });
  }

  async update(id: string, userId: string, data: { name?: string; isPublic?: boolean }) {
    await this.findById(id, userId);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string) {
    const project = await this.findById(id, userId);
    return this.prisma.project.delete({ where: { id } });
  }
}