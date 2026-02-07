import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MembersService } from './members.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { isAdmin, isSuperAdmin } from '../common/roles.util';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
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

  @Get(':id/profile')
  async getMemberProfile(@Param('id') memberId: string) {
    return this.membersService.getMemberProfile(memberId);
  }

  @Post('me/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const memberId = req.user.id;

    // Upload to Supabase Storage
    const photoUrl = await this.storageService.uploadProfilePhoto(
      memberId,
      file.buffer,
      file.mimetype,
    );

    // Update member record
    const member = await this.membersService.updatePhoto(memberId, photoUrl);

    return {
      message: 'Photo uploaded successfully',
      photoUrl: member.photoUrl,
    };
  }

  @Delete('me/photo')
  async deletePhoto(@Req() req) {
    const memberId = req.user.id;
    const member = await this.membersService.findById(memberId);

    if (member.photoUrl) {
      await this.storageService.deleteProfilePhoto(member.photoUrl);
    }

    await this.membersService.updatePhoto(memberId, null);

    return { message: 'Photo deleted successfully' };
  }
}
