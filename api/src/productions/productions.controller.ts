import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserResponse } from '../auth/auth.types';
import { CreateProductionDto } from './dto/create-production.dto';
import { ReplaceRunSheetDto } from './dto/replace-run-sheet.dto';
import { UpdateProductionDto } from './dto/update-production.dto';
import { ProductionsService } from './productions.service';

@Controller('productions')
export class ProductionsController {
  constructor(private productionsService: ProductionsService) {}

  @Get()
  findAll(@CurrentUser() user: UserResponse) {
    return this.productionsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: UserResponse, @Body() dto: CreateProductionDto) {
    return this.productionsService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserResponse, @Param('id') id: string) {
    return this.productionsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserResponse,
    @Param('id') id: string,
    @Body() dto: UpdateProductionDto,
  ) {
    return this.productionsService.update(user.id, id, dto);
  }

  @Put(':id/run-sheet')
  replaceRunSheet(
    @CurrentUser() user: UserResponse,
    @Param('id') id: string,
    @Body() dto: ReplaceRunSheetDto,
  ) {
    return this.productionsService.replaceRunSheet(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserResponse, @Param('id') id: string) {
    return this.productionsService.remove(user.id, id);
  }
}
