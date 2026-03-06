import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const exists = await this.categoriesRepository.findOne({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Category already exists');
    }

    return this.categoriesRepository.save(this.categoriesRepository.create(dto));
  }

  findAll() {
    return this.categoriesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    return { message: 'Category deleted' };
  }
}
