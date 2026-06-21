import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { studentId, bookId } = createOrderDto;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student)
      throw new NotFoundException(`Student with id ${studentId} not found`);

    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Book with id ${bookId} not found`);
    if (book.stock < 1)
      throw new BadRequestException('This book is out of stock');

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({ data: { studentId, bookId } });
      await tx.book.update({
        where: { id: bookId },
        data: { stock: { decrement: 1 } },
      });
      return order;
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { student: true, book: true },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { student: true, book: true },
    });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    if (updateOrderDto.status === 'RETURNED' && order.status !== 'RETURNED') {
      await this.prisma.book.update({
        where: { id: order.bookId },
        data: { stock: { increment: 1 } },
      });
    }

    if (updateOrderDto.status === 'APPROVED' && order.status !== 'APPROVED') {
      const book = await this.prisma.book.findUnique({
        where: { id: order.bookId },
        include: { user: true },
      });

      await this.mailService.sendMail(
        order.student.email,
        'Your Book Order Has Been Approved',
        `<p>Hi ${order.student.name}, your order for "<b>${book?.title}</b>" has been approved.</p>`,
      );
    }

    return this.prisma.order.update({ where: { id }, data: updateOrderDto });
  }

  async remove(id: number) {
    const order = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      if (order.status !== 'RETURNED' && order.status !== 'CANCELLED') {
        await tx.book.update({
          where: { id: order.bookId },
          data: { stock: { increment: 1 } },
        });
      }
      return tx.order.delete({ where: { id } });
    });
  }
}
