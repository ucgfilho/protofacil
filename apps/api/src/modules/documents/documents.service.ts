import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAllByProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.prisma.document.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (document.project.ownerId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return document;
  }

  async create(projectId: string, userId: string, data: { name: string }) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.prisma.document.create({
      data: {
        projectId,
        name: data.name,
        data: {},
      },
    });
  }

  async update(id: string, userId: string, data: { name?: string; data?: any }) {
    const document = await this.findById(id, userId);

    return this.prisma.document.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.data && { data: data.data, version: { increment: 1 } }),
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    return this.prisma.document.delete({ where: { id } });
  }
}