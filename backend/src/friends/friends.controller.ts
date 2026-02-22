import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  /**
   * GET /friends - Get my friends list
   */
  @Get()
  async getFriends(@Req() req) {
    return this.friendsService.getFriends(req.user.id);
  }

  /**
   * GET /friends/requests/received - Get friend requests I received
   */
  @Get('requests/received')
  async getRequestsReceived(@Req() req) {
    return this.friendsService.getPendingRequestsReceived(req.user.id);
  }

  /**
   * GET /friends/requests/sent - Get friend requests I sent
   */
  @Get('requests/sent')
  async getRequestsSent(@Req() req) {
    return this.friendsService.getPendingRequestsSent(req.user.id);
  }

  /**
   * GET /friends/directory - Get member directory with friendship status
   */
  @Get('directory')
  async getMemberDirectory(@Req() req, @Query('search') search?: string) {
    return this.friendsService.getMemberDirectory(req.user.id, search);
  }

  /**
   * GET /friends/status/:userId - Get friendship status with specific user
   */
  @Get('status/:userId')
  async getFriendshipStatus(@Req() req, @Param('userId') userId: string) {
    return this.friendsService.getFriendshipStatus(req.user.id, userId);
  }

  /**
   * POST /friends/request/:userId - Send friend request
   */
  @Post('request/:userId')
  async sendRequest(@Req() req, @Param('userId') friendId: string) {
    return this.friendsService.sendFriendRequest(req.user.id, friendId);
  }

  /**
   * POST /friends/accept/:userId - Accept friend request
   */
  @Post('accept/:userId')
  async acceptRequest(@Req() req, @Param('userId') friendId: string) {
    return this.friendsService.acceptFriendRequest(req.user.id, friendId);
  }

  /**
   * DELETE /friends/decline/:userId - Decline friend request
   */
  @Delete('decline/:userId')
  @HttpCode(HttpStatus.OK)
  async declineRequest(@Req() req, @Param('userId') friendId: string) {
    return this.friendsService.declineFriendRequest(req.user.id, friendId);
  }

  /**
   * DELETE /friends/cancel/:userId - Cancel friend request I sent
   */
  @Delete('cancel/:userId')
  @HttpCode(HttpStatus.OK)
  async cancelRequest(@Req() req, @Param('userId') friendId: string) {
    return this.friendsService.cancelFriendRequest(req.user.id, friendId);
  }

  /**
   * DELETE /friends/:userId - Unfriend someone
   */
  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async unfriend(@Req() req, @Param('userId') friendId: string) {
    return this.friendsService.unfriend(req.user.id, friendId);
  }
}
