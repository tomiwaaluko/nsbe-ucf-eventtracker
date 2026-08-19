import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

describe('MembersService export', () => {
  let service: MembersService;
  let prisma: {
    member: { findUnique: jest.Mock };
  };

  const userId = 'user-123';
  const mockMember = {
    id: userId,
    email: 'member@ucf.edu',
    firstName: 'Test',
    lastName: 'Member',
    role: 'member',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    emailVerified: true,
    passwordHash: 'hashed',
    isActive: true,
    bio: null,
    discordUsername: null,
    graduationYear: 2026,
    linkedInUrl: null,
    major: 'Computer Science',
    phoneNumber: null,
    photoUrl: null,
    oauthAccounts: [
      {
        id: 'oauth-1',
        provider: 'google',
        providerEmail: 'member@ucf.edu',
        emailVerified: true,
        createdAt: new Date('2024-01-01'),
      },
    ],
    attendance: [
      {
        id: 'att-1',
        checkedInAt: new Date('2024-09-01'),
        checkInMethod: 'qr',
        event: {
          id: 'event-1',
          name: 'Fall GBM',
          description: 'Opening GBM',
          category: 'GBM',
          semester: 'Fall 2024',
          startTime: new Date('2024-09-01'),
          endTime: new Date('2024-09-01'),
          location: 'ENG 2',
          isActive: true,
          qrSecret: 'secret-should-not-export',
          checkInCode: 'ABC123',
        },
      },
      {
        id: 'att-2',
        checkedInAt: new Date('2024-09-15'),
        checkInMethod: 'code',
        event: {
          id: 'event-2',
          name: 'Workshop',
          description: null,
          category: 'WORKSHOP',
          semester: 'Fall 2024',
          startTime: new Date('2024-09-15'),
          endTime: new Date('2024-09-15'),
          location: null,
          isActive: true,
          qrSecret: 'another-secret',
          checkInCode: 'XYZ789',
        },
      },
    ],
    eventInterests: [
      {
        id: 'interest-1',
        status: 'PLANNING',
        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-10-01'),
        event: {
          id: 'event-3',
          name: 'Social Night',
          description: null,
          category: 'SOCIAL',
          semester: 'Fall 2024',
          startTime: new Date('2024-10-15'),
          endTime: new Date('2024-10-15'),
          location: 'Student Union',
          isActive: true,
          qrSecret: 'secret',
          checkInCode: 'SOC001',
        },
      },
    ],
    pointEntries: [
      {
        id: 'point-1',
        pointTypeKey: 'PAID_MEMBER',
        points: 30,
        semester: 'Fall 2024',
        label: null,
        note: null,
        createdAt: new Date('2024-09-01'),
        awardedBy: { id: 'admin-1', firstName: 'Admin', lastName: 'User' },
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      member: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: prisma },
        { provide: CacheService, useValue: {} },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  describe('exportMyData', () => {
    it('returns member data scoped to the requested user', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.exportMyData(userId);

      expect(prisma.member.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: userId } }),
      );
      expect(result.profile.email).toBe('member@ucf.edu');
      expect(result.profile).not.toHaveProperty('passwordHash');
      expect(result.profile.hasPassword).toBe(true);
      expect(result.exportedAt).toBeDefined();
    });

    it('never includes qrSecret or checkInCode in event data', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.exportMyData(userId);
      const serialized = JSON.stringify(result);

      expect(serialized).not.toContain('qrSecret');
      expect(serialized).not.toContain('checkInCode');
      expect(serialized).not.toContain('secret-should-not-export');
      expect(serialized).not.toContain('ABC123');
    });

    it('includes attendance, interests, achievements, and points', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.exportMyData(userId);

      expect(result.attendance).toHaveLength(2);
      expect(result.eventInterests).toHaveLength(1);
      expect(result.achievements.oneOneOne).toBeDefined();
      expect(result.achievements.threeThreeThree).toBeDefined();
      expect(result.achievementsBySemester).toHaveLength(1);
      expect(result.points.bySemester).toHaveLength(1);
      expect(result.points.bySemester[0].manualEntries).toHaveLength(1);
      expect(result.points.bySemester[0].autoEntries.length).toBeGreaterThan(0);
    });

    it('throws NotFoundException when member does not exist', async () => {
      prisma.member.findUnique.mockResolvedValue(null);

      await expect(service.exportMyData(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('exportMyDataAsCsv', () => {
    it('returns CSV with expected sections', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      const csv = await service.exportMyDataAsCsv(userId);

      expect(csv).toContain('Section,Profile');
      expect(csv).toContain('Section,Attendance');
      expect(csv).toContain('Section,Event Interests');
      expect(csv).toContain('Section,Achievements (All Time)');
      expect(csv).toContain('Section,Manual Points');
      expect(csv).toContain('Section,Auto Points');
      expect(csv).not.toContain('qrSecret');
      expect(csv).not.toContain('checkInCode');
    });
  });
});
