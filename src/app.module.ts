import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { StudentsModule } from './students/students.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { OrdersModule } from './orders/orders.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [PrismaModule, UsersModule, BooksModule, StudentsModule, CloudinaryModule, OrdersModule, MailModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
