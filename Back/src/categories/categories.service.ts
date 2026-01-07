import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  findAll() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
    });
  }

  findAllDeleted() {
    return this.prisma.category.findMany({
      where: { deletedAt: { not: null } },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Soft delete
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    if (!category.deletedAt) {
      throw new NotFoundException(
        `La categoría con ID ${id} no está eliminada`,
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
