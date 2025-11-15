import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { isAdmin, isSuperAdmin } from '../common/roles.util';
import { PrismaService } from '../prisma/prisma.service';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
  async getMe(@Req() req) {
    return this.membersService.findMe(req.user.id);
  }

  @Put('me')
  async updateMe(@Req() req, @Body() dto: UpdateMemberDto) {
    return this.membersService.updateMe(req.user.id, dto);
  }

  @Get()
  async search(@Req() req, @Query('query') query: string) {
    const member = await this.membersService.findMe(req.user.id);
    if (!isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.membersService.search(query);
  }

  @Put(':id/role')
  async updateRole(
    @Req() req,
    @Param('id') memberId: string,
    @Body() body: { role: 'member' | 'admin' | 'super_admin' },
  ) {
    const currentMember = await this.membersService.findMe(req.user.id);
    if (!isSuperAdmin(currentMember.role)) {
      throw new ForbiddenException('Super admin access required');
    }

    return this.prisma.member.update({
      where: { id: memberId },
      data: { role: body.role },
    });
  }
}
