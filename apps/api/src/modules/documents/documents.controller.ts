import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Listar documentos do projeto' })
  async findAll(@Param('projectId') projectId: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    return this.documentsService.findAllByProject(projectId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter documento por ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    return this.documentsService.findById(id, userId);
  }

  @Post('project/:projectId')
  @ApiOperation({ summary: 'Criar novo documento' })
  async create(
    @Param('projectId') projectId: string,
    @Body() body: { name: string },
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'demo-user';
    return this.documentsService.create(projectId, userId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar documento' })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; data?: any },
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'demo-user';
    return this.documentsService.update(id, userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir documento' })
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    return this.documentsService.delete(id, userId);
  }
}