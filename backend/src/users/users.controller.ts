import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth')
  async authenticateUser(@Body() body: { phone: string; role: string; name?: string }) {
    return this.usersService.authenticate(body.phone, body.role, body.name);
  }

  @UseGuards(ClerkAuthGuard)
  @Post('sync')
  async syncUser(@Request() req: any, @Body() body: { role: string; email: string }) {
    const clerkUserId = req.user.sub;
    return this.usersService.syncUser(clerkUserId, body.role, body.email);
  }

  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Post('reset')
  resetAll() {
    return this.usersService.resetData();
  }
}


