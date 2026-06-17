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
import { CrewService } from './crew.service';
import { CreateCrewMemberDto } from './dto/create-crew-member.dto';
import { ListCrewQueryDto } from './dto/list-crew-query.dto';
import { UpdateCrewMemberDto } from './dto/update-crew-member.dto';

@Controller('crew')
export class CrewController {
  constructor(private crewService: CrewService) {}

  @Get()
  findAll(
    @CurrentUser() user: UserResponse,
    @Query() query: ListCrewQueryDto,
  ) {
    return this.crewService.findAll(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: UserResponse, @Body() dto: CreateCrewMemberDto) {
    return this.crewService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserResponse, @Param('id') id: string) {
    return this.crewService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserResponse,
    @Param('id') id: string,
    @Body() dto: UpdateCrewMemberDto,
  ) {
    return this.crewService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserResponse, @Param('id') id: string) {
    return this.crewService.remove(user.id, id);
  }
}
