import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OutletsService } from './outlets.service';

@Controller('outlets')
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Get()
  findAllOpen() {
    return this.outletsService.findAllOpen();
  }

  @Get(':id/menu')
  getMenu(@Param('id') id: string) {
    return this.outletsService.getMenu(id);
  }

  @Get('admin/all')
  findAllAdmin() {
    return this.outletsService.findAllAdmin();
  }

  @Get('vendor/:id')
  findByVendor(@Param('id') id: string) {
    return this.outletsService.findByVendor(id);
  }

  @Patch(':id/approve')
  approveOutlet(@Param('id') id: string) {
    return this.outletsService.approveOutlet(id);
  }

  @Post()
  createOutlet(@Body() body: any) {
    return this.outletsService.createOutlet(body);
  }

  @Post(':id/menu')
  createMenuItem(@Param('id') id: string, @Body() body: any) {
    return this.outletsService.createMenuItem(id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.outletsService.updateStatus(id, status);
  }
}
