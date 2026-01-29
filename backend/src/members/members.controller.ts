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
  NotFoundException,
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

  @Put(':id/role')
  async updateRole(
    @Req() req,
    @Param('id') memberId: string,
    @Body() body: { role: 'member' | 'admin' | 'super_admin' },
  ) {
    const currentMember = await this.membersService.findMe(req.user.id);
    if (!currentMember || !isSuperAdmin(currentMember.role)) {
      throw new ForbiddenException('Super admin access required');
    }

    return this.prisma.member.update({
      where: { id: memberId },
      data: { role: body.role },
    });
  }

  @Put(':id/status')
  async updateStatus(
    @Req() req,
    @Param('id') memberId: string,
    @Body() body: { isActive: boolean },
  ) {
    const currentMember = await this.membersService.findMe(req.user.id);
    if (!currentMember || !isAdmin(currentMember.role)) {
      throw new ForbiddenException('Admin access required');
    }

    return await this.membersService.updateMemberStatus(
      memberId,
      body.isActive,
    );
  }

  @Get()
  async getAllMembers(
    @Req() req,
    @Query('query') query?: string,
    @Query('semester') semester?: string,
  ) {
    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }

    // If query parameter is provided, use search functionality
    if (query) {
      return this.membersService.search(query);
    }

    // Otherwise, return all members with statistics
    return this.membersService.getAllMembers(semester);
  }
}
