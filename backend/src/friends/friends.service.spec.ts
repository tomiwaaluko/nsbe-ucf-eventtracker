import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipStatus, Prisma } from '@prisma/client';

describe('FriendsService', () => {
  let service: FriendsService;
  let prisma: {
    friendship: { findFirst: jest.Mock };
  };

  const userId = 'user-a';
  const otherUserId = 'user-b';

  /** Bidirectional ACCEPTED where-clause that areFriends must always use. */
  const acceptedFriendsWhere: Prisma.FriendshipWhereInput = {
    OR: [
      { userId, friendId: otherUserId },
      { userId: otherUserId, friendId: userId },
    ],
    status: FriendshipStatus.ACCEPTED,
  };

  /**
   * Fake findFirst that only returns a row when where.status is ACCEPTED
   * and the OR covers both directions — mirrors Prisma status filtering.
   */
  function mockFindFirstAgainstFixture(
    fixture: {
      userId: string;
      friendId: string;
      status: FriendshipStatus;
    } | null,
  ) {
    prisma.friendship.findFirst.mockImplementation(
      (args: { where?: Prisma.FriendshipWhereInput }) => {
        const where = args?.where;
        if (!fixture || !where) {
          return Promise.resolve(null);
        }
        if (where.status !== FriendshipStatus.ACCEPTED) {
          return Promise.resolve(null);
        }
        if (fixture.status !== FriendshipStatus.ACCEPTED) {
          return Promise.resolve(null);
        }
        const or = where.OR;
        if (!Array.isArray(or) || or.length < 2) {
          return Promise.resolve(null);
        }
        const matchesPair = or.some(
          (clause) =>
            clause.userId === fixture.userId &&
            clause.friendId === fixture.friendId,
        );
        return Promise.resolve(
          matchesPair ? { id: 'friendship-1', ...fixture } : null,
        );
      },
    );
  }

  beforeEach(async () => {
    prisma = {
      friendship: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('areFriends', () => {
    it('returns true when an ACCEPTED friendship exists (userId → friendId)', async () => {
      mockFindFirstAgainstFixture({
        userId,
        friendId: otherUserId,
        status: FriendshipStatus.ACCEPTED,
      });

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(true);
      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: acceptedFriendsWhere,
      });
    });

    it('returns true when an ACCEPTED friendship exists (friendId → userId)', async () => {
      mockFindFirstAgainstFixture({
        userId: otherUserId,
        friendId: userId,
        status: FriendshipStatus.ACCEPTED,
      });

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(true);
      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: acceptedFriendsWhere,
      });
    });

    it('returns false when no friendship row exists', async () => {
      mockFindFirstAgainstFixture(null);

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(false);
      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: acceptedFriendsWhere,
      });
    });

    it('returns false when friendship is PENDING', async () => {
      mockFindFirstAgainstFixture({
        userId,
        friendId: otherUserId,
        status: FriendshipStatus.PENDING,
      });

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(false);
      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: acceptedFriendsWhere,
      });
    });

    it('returns false when friendship is DECLINED', async () => {
      mockFindFirstAgainstFixture({
        userId,
        friendId: otherUserId,
        status: FriendshipStatus.DECLINED,
      });

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(false);
      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: acceptedFriendsWhere,
      });
    });

    it('returns false when friendship is BLOCKED', async () => {
      mockFindFirstAgainstFixture({
        userId,
        friendId: otherUserId,
        status: FriendshipStatus.BLOCKED,
      });

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(false);
      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: acceptedFriendsWhere,
      });
    });
  });
});
