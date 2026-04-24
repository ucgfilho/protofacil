import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar projetos do usuário' })
  async findAll(@Request() req: any) {
    const userId = req.user?.id;
    return this.projectsService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obter projeto por ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.projectsService.findById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar novo projeto' })
  async create(@Body() body: { name: string }, @Request() req: any) {
    const userId = req.user?.id;
    return this.projectsService.create(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar projeto' })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; isPublic?: boolean },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.projectsService.update(id, userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir projeto' })
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.projectsService.delete(id, userId);
  }
}