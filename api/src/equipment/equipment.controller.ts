import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserResponse } from '../auth/auth.types';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { ListEquipmentQueryDto } from './dto/list-equipment-query.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Controller('equipment')
export class EquipmentController {
  constructor(private equipmentService: EquipmentService) {}

  @Get()
  findAll(
    @CurrentUser() user: UserResponse,
    @Query() query: ListEquipmentQueryDto,
  ) {
    return this.equipmentService.findAll(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: UserResponse, @Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserResponse, @Param('id') id: string) {
    return this.equipmentService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserResponse,
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserResponse, @Param('id') id: string) {
    return this.equipmentService.remove(user.id, id);
  }
}
