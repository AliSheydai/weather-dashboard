import { Controller, Get, Post, Delete, Body, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HistoryService } from './history.service';
import { AddHistoryDto } from './dto/history.dto';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  async getHistory(@Request() req) {
    return this.historyService.getHistory(req.user.id);
  }

  @Post()
  async addToHistory(@Request() req, @Body(ValidationPipe) dto: AddHistoryDto) {
    return this.historyService.addToHistory(req.user.id, dto.city);
  }

  @Delete()
  async clearHistory(@Request() req) {
    return this.historyService.clearHistory(req.user.id);
  }
}
