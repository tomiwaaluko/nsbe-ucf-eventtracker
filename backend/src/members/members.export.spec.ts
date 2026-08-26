import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MembersExportService } from './members-export.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  MEMBER_EXPORT_ATTENDANCE_SELECT,
  MEMBER_EXPORT_EVENT_SELECT,
  MEMBER_EXPORT_PROFILE_SELECT,
} from './dto/export-member-data.dto';

describe('MembersExportService', () => {
  let service: MembersExportService;
  let prisma: {
    member: { findUnique: jest.Mock };
  };

  const userId = 'user-123';
  const SECRET_QR = 'export-fixture-qr-secret-xyz';
  const SECRET_CHECK_IN = 'export-fixture-check-in-9999';

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
          // Present on fixtures so serialization assertions have teeth;
          // Prisma select must omit these — they must not appear in export.
          qrSecret: SECRET_QR,
          checkInCode: SECRET_CHECK_IN,
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
          qrSecret: SECRET_QR,
          checkInCode: SECRET_CHECK_IN,
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
          qrSecret: SECRET_QR,
          checkInCode: SECRET_CHECK_IN,
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
        awardedBy: { firstName: 'Admin', lastName: 'User' },
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
        MembersExportService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MembersExportService>(MembersExportService);
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

    it('uses explicit Prisma select lists for profile, attendance, and events', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      await service.exportMyData(userId);

      expect(prisma.member.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.objectContaining({
          ...MEMBER_EXPORT_PROFILE_SELECT,
          attendance: {
            select: MEMBER_EXPORT_ATTENDANCE_SELECT,
            orderBy: { checkedInAt: 'desc' },
          },
        }),
      });

      const call = prisma.member.findUnique.mock.calls[0][0];
      expect(call.select.attendance.select.event.select).toEqual(
        MEMBER_EXPORT_EVENT_SELECT,
      );
      expect(call.select).not.toHaveProperty('include');
    });

    it('exports only allowlisted profile fields', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.exportMyData(userId);
      const allowedKeys = new Set([
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'createdAt',
        'updatedAt',
        'emailVerified',
        'isActive',
        'bio',
        'discordUsername',
        'graduationYear',
        'linkedInUrl',
        'major',
        'phoneNumber',
        'photoUrl',
        'hasPassword',
      ]);

      expect(Object.keys(result.profile).sort()).toEqual(
        Array.from(allowedKeys).sort(),
      );
    });

    it('never includes qrSecret or checkInCode values in event data', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.exportMyData(userId);
      const serialized = JSON.stringify(result);

      expect(serialized).not.toContain('qrSecret');
      expect(serialized).not.toContain('checkInCode');
      expect(serialized).not.toContain(SECRET_QR);
      expect(serialized).not.toContain(SECRET_CHECK_IN);
      for (const record of result.attendance) {
        expect(record.event).not.toHaveProperty('qrSecret');
        expect(record.event).not.toHaveProperty('checkInCode');
      }
      for (const interest of result.eventInterests) {
        expect(interest.event).not.toHaveProperty('qrSecret');
        expect(interest.event).not.toHaveProperty('checkInCode');
      }
    });

    it('never includes awardedById or awardedBy.id in point entries', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.exportMyData(userId);
      const serialized = JSON.stringify(result);

      expect(serialized).not.toContain('awardedById');
      expect(serialized).not.toContain('admin-1');
      expect(result.points.bySemester[0].manualEntries[0].awardedByName).toBe(
        'Admin User',
      );
      expect(result.points.bySemester[0].manualEntries[0]).not.toHaveProperty(
        'awardedBy',
      );
      expect(result.points.bySemester[0].manualEntries[0]).not.toHaveProperty(
        'awardedById',
      );
    });

    it('includes attendance, interests, achievements, and points from loaded data', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.exportMyData(userId);

      expect(result.attendance).toHaveLength(2);
      expect(result.eventInterests).toHaveLength(1);
      expect(result.achievements.oneOneOne).toBeDefined();
      expect(result.achievements.threeThreeThree).toBeDefined();
      expect(result.achievementsBySemester).toHaveLength(1);
      expect(result.points.bySemester).toHaveLength(1);

      const fall = result.points.bySemester[0];
      expect(fall.semester).toBe('Fall 2024');
      expect(fall.manualEntries).toHaveLength(1);
      expect(fall.manualEntries[0].points).toBe(30);
      // GBM attendance → GBM auto (50); WORKSHOP → AEX_WORKSHOP (30)
      expect(fall.autoEntries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            pointTypeKey: 'GBM',
            points: 50,
            eventId: 'event-1',
          }),
          expect.objectContaining({
            pointTypeKey: 'AEX_WORKSHOP',
            points: 30,
            eventId: 'event-2',
          }),
        ]),
      );
      expect(fall.totalPoints).toBe(30 + 50 + 30);
      expect(fall.zones.general).toBe(80);
      expect(fall.zones.program).toBe(30);
    });

    it('computes points for all semesters without per-semester DB refetch', async () => {
      prisma.member.findUnique.mockResolvedValue({
        ...mockMember,
        attendance: [
          ...mockMember.attendance,
          {
            id: 'att-3',
            checkedInAt: new Date('2025-01-10'),
            checkInMethod: 'qr',
            event: {
              id: 'event-4',
              name: 'Spring GBM',
              description: null,
              category: 'GBM',
              semester: 'Spring 2025',
              startTime: new Date('2025-01-10'),
              endTime: new Date('2025-01-10'),
              location: null,
              isActive: true,
              qrSecret: SECRET_QR,
              checkInCode: SECRET_CHECK_IN,
            },
          },
        ],
        pointEntries: [
          ...mockMember.pointEntries,
          {
            id: 'point-2',
            pointTypeKey: 'NATIONAL_DUES',
            points: 50,
            semester: 'Spring 2025',
            label: null,
            note: null,
            createdAt: new Date('2025-01-01'),
            awardedBy: { firstName: 'Admin', lastName: 'User' },
          },
        ],
      });

      const result = await service.exportMyData(userId);

      expect(prisma.member.findUnique).toHaveBeenCalledTimes(1);
      expect(result.points.bySemester).toHaveLength(2);
      expect(result.points.bySemester.map((s) => s.semester)).toEqual([
        'Spring 2025',
        'Fall 2024',
      ]);
    });

    it('throws NotFoundException when member does not exist', async () => {
      prisma.member.findUnique.mockResolvedValue(null);

      await expect(service.exportMyData(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('exportMyDataAsCsv', () => {
    it('returns CSV with expected sections and omits secret values', async () => {
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
      expect(csv).not.toContain(SECRET_QR);
      expect(csv).not.toContain(SECRET_CHECK_IN);
      expect(csv).not.toContain('awardedById');
      expect(csv).not.toContain('admin-1');
    });

    it('prefixes formula-like CSV cells to prevent injection', async () => {
      prisma.member.findUnique.mockResolvedValue({
        ...mockMember,
        bio: '=HYPERLINK("evil")',
      });

      const csv = await service.exportMyDataAsCsv(userId);

      expect(csv).toContain("'=HYPERLINK");
    });
  });
});
