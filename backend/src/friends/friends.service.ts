import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipStatus } from '@prisma/client';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Send a friend request
   * Creates TWO friendship records (bidirectional)
   */
  async sendFriendRequest(userId: string, friendId: string) {
    // Validation
    if (userId === friendId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if friend exists
    const friendExists = await this.prisma.member.findUnique({
      where: { id: friendId },
    });
    if (!friendExists) {
      throw new NotFoundException('User not found');
    }

    // Check if friendship already exists (either direction)
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === FriendshipStatus.ACCEPTED) {
        throw new BadRequestException('Already friends');
      }
      if (existing.status === FriendshipStatus.PENDING) {
        throw new BadRequestException('Friend request already pending');
      }
      if (existing.status === FriendshipStatus.DECLINED) {
        // Allow re-requesting after decline
        await this.prisma.friendship.deleteMany({
          where: {
            OR: [
              { userId, friendId },
              { userId: friendId, friendId: userId },
            ],
          },
        });
      }
    }

    // Create bidirectional friendship records (both PENDING)
    const [friendship1, friendship2] = await this.prisma.$transaction([
      this.prisma.friendship.create({
        data: {
          userId,
          friendId,
          requesterId: userId,
          status: FriendshipStatus.PENDING,
        },
      }),
      this.prisma.friendship.create({
        data: {
          userId: friendId,
          friendId: userId,
          requesterId: userId,
          status: FriendshipStatus.PENDING,
        },
      }),
    ]);

    return {
      message: 'Friend request sent',
      friendship: friendship1,
    };
  }

  /**
   * Accept a friend request
   * Updates both records to ACCEPTED
   */
  async acceptFriendRequest(userId: string, friendId: string) {
    // Find the friendship where friendId sent request to userId
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        userId,
        friendId,
        requesterId: friendId,
        status: FriendshipStatus.PENDING,
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Update both records to ACCEPTED
    await this.prisma.$transaction([
      this.prisma.friendship.updateMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
        data: {
          status: FriendshipStatus.ACCEPTED,
          updatedAt: new Date(),
        },
      }),
    ]);

    return {
      message: 'Friend request accepted',
    };
  }

  /**
   * Decline a friend request
   * Deletes both records
   */
  async declineFriendRequest(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        userId,
        friendId,
        requesterId: friendId,
        status: FriendshipStatus.PENDING,
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Delete both records
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    return {
      message: 'Friend request declined',
    };
  }

  /**
   * Get all friends (ACCEPTED status)
   */
  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        userId,
        status: FriendshipStatus.ACCEPTED,
      },
      include: {
        friend: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            major: true,
            graduationYear: true,
            bio: true,
            linkedInUrl: true,
            discordUsername: true,
          },
        },
      },
      orderBy: {
        friend: {
          firstName: 'asc',
        },
      },
    });

    return friendships.map((f) => ({
      friendshipId: f.id,
      friend: f.friend,
      friendsSince: f.updatedAt,
    }));
  }

  /**
   * Get pending requests I've received (others sent to me)
   */
  async getPendingRequestsReceived(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        userId,
        status: FriendshipStatus.PENDING,
        requesterId: { not: userId },
      },
      include: {
        friend: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            major: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests.map((r) => ({
      requestId: r.id,
      requester: r.friend,
      sentAt: r.createdAt,
    }));
  }

  /**
   * Get pending requests I've sent (I sent to others)
   */
  async getPendingRequestsSent(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        userId,
        status: FriendshipStatus.PENDING,
        requesterId: userId,
      },
      include: {
        friend: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            major: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests.map((r) => ({
      requestId: r.id,
      recipient: r.friend,
      sentAt: r.createdAt,
    }));
  }

  /**
   * Cancel a friend request I sent
   */
  async cancelFriendRequest(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        userId,
        friendId,
        requesterId: userId,
        status: FriendshipStatus.PENDING,
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Delete both records
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    return {
      message: 'Friend request cancelled',
    };
  }

  /**
   * Unfriend someone
   */
  async unfriend(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        userId,
        friendId,
        status: FriendshipStatus.ACCEPTED,
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    // Delete both records
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    return {
      message: 'Unfriended successfully',
    };
  }

  /**
   * Get friendship status with a specific user
   */
  async getFriendshipStatus(userId: string, otherUserId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: otherUserId },
          { userId: otherUserId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      return { status: 'NONE', canSendRequest: true };
    }

    if (friendship.status === FriendshipStatus.ACCEPTED) {
      return { status: 'FRIENDS', canSendRequest: false };
    }

    if (friendship.status === FriendshipStatus.PENDING) {
      const iRequested = friendship.requesterId === userId;
      return {
        status: 'PENDING',
        iRequested,
        canSendRequest: false,
      };
    }

    return { status: 'NONE', canSendRequest: true };
  }

  /**
   * Check if two users are friends
   */
  async areFriends(userId: string, otherUserId: string): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        userId,
        friendId: otherUserId,
        status: FriendshipStatus.ACCEPTED,
      },
    });

    return !!friendship;
  }

  /**
   * Get member directory (all members) with friendship status
   */
  async getMemberDirectory(currentUserId: string, searchQuery?: string) {
    const members = await this.prisma.member.findMany({
      where: {
        isActive: true,
        ...(searchQuery && {
          OR: [
            { firstName: { contains: searchQuery, mode: 'insensitive' } },
            { lastName: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        major: true,
        graduationYear: true,
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });

    // Get all friendships for current user
    const friendships = await this.prisma.friendship.findMany({
      where: {
        userId: currentUserId,
      },
      select: {
        friendId: true,
        status: true,
        requesterId: true,
      },
    });

    // Create a map for quick lookup
    const friendshipMap = new Map(
      friendships.map((f) => [
        f.friendId,
        {
          status: f.status,
          iRequested: f.requesterId === currentUserId,
        },
      ])
    );

    // Merge data
    return members.map((member) => {
      if (member.id === currentUserId) {
        return {
          ...member,
          friendshipStatus: 'SELF',
        };
      }

      const friendship = friendshipMap.get(member.id);
      if (!friendship) {
        return {
          ...member,
          friendshipStatus: 'NONE',
        };
      }

      if (friendship.status === FriendshipStatus.ACCEPTED) {
        return {
          ...member,
          friendshipStatus: 'FRIENDS',
        };
      }

      if (friendship.status === FriendshipStatus.PENDING) {
        return {
          ...member,
          friendshipStatus: friendship.iRequested ? 'REQUEST_SENT' : 'REQUEST_RECEIVED',
        };
      }

      return {
        ...member,
        friendshipStatus: 'NONE',
      };
    });
  }
}
