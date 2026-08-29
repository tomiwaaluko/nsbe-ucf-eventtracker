import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { MembersService } from '../members/members.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { getCurrentSemester } from '../common/semester.util';

describe('StatsController', () => {
  let controller: StatsController;
  let statsService: {
    getMemberProgress: jest.Mock;
    get111Leaderboard: jest.Mock;
    get333Leaderboard: jest.Mock;
    getAdminStats: jest.Mock;
  };
  let membersService: {
    findMe: jest.Mock;
  };

  beforeEach(async () => {
    statsService = {
      getMemberProgress: jest.fn().mockResolvedValue({}),
      get111Leaderboard: jest.fn().mockResolvedValue([]),
      get333Leaderboard: jest.fn().mockResolvedValue([]),
      getAdminStats: jest.fn().mockResolvedValue({}),
    };
    membersService = {
      findMe: jest.fn().mockResolvedValue({ role: 'admin' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        { provide: StatsService, useValue: statsService },
        { provide: MembersService, useValue: membersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StatsController>(StatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('semester default', () => {
    const expected = getCurrentSemester();

    it('getMyProgress defaults to current semester when query is missing', async () => {
      await controller.getMyProgress(
        { user: { id: 'm1' } },
        undefined as unknown as string,
      );
      expect(statsService.getMemberProgress).toHaveBeenCalledWith(
        'm1',
        expected,
      );
    });

    it('get111Leaderboard defaults to current semester when query is missing', async () => {
      await controller.get111Leaderboard(undefined as unknown as string);
      expect(statsService.get111Leaderboard).toHaveBeenCalledWith(expected);
    });

    it('get333Leaderboard defaults to current semester when query is missing', async () => {
      await controller.get333Leaderboard(undefined as unknown as string);
      expect(statsService.get333Leaderboard).toHaveBeenCalledWith(expected);
    });

    it('getAdminStats defaults to current semester when query is missing', async () => {
      await controller.getAdminStats(
        { user: { id: 'a1' } },
        undefined as unknown as string,
      );
      expect(statsService.getAdminStats).toHaveBeenCalledWith(expected);
    });

    it('preserves an explicit semester query param', async () => {
      await controller.getMyProgress({ user: { id: 'm1' } }, 'Spring 2025');
      expect(statsService.getMemberProgress).toHaveBeenCalledWith(
        'm1',
        'Spring 2025',
      );
    });
  });

  it('getAdminStats rejects non-admins', async () => {
    membersService.findMe.mockResolvedValue({ role: 'member' });
    await expect(
      controller.getAdminStats({ user: { id: 'm1' } }, 'Fall 2026'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
