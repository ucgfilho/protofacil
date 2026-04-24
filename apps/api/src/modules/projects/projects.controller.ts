import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar projetos do usuário' })
  async findAll(@Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    return this.projectsService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter projeto por ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    return this.projectsService.findById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo projeto' })
  async create(@Body() body: { name: string }, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    return this.projectsService.create(userId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar projeto' })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; isPublic?: boolean },
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'demo-user';
    return this.projectsService.update(id, userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir projeto' })
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    return this.projectsService.delete(id, userId);
  }
}