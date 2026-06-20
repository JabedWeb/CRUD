import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  create(createBookDto: CreateBookDto) {
    return this.prisma.book.create({ data: createBookDto });
  }

  findAll(title?: string, author?: string) {
    return this.prisma.book.findMany({
      where: {
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        author: author ? { contains: author, mode: 'insensitive' } : undefined,
      },
      include: { user: true },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!book) throw new NotFoundException(`Book with id ${id} not found`);
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);
    return this.prisma.book.update({ where: { id }, data: updateBookDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }
}
