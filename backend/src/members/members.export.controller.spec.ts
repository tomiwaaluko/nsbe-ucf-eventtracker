import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../storage/storage.service';

describe('MembersController exportMyData', () => {
  let controller: MembersController;
  let membersService: {
    exportMyData: jest.Mock;
    exportMyDataAsCsv: jest.Mock;
  };

  const mockExportPayload = {
    exportedAt: '2024-01-01T00:00:00.000Z',
    profile: { email: 'member@ucf.edu' },
  };

  beforeEach(async () => {
    membersService = {
      exportMyData: jest.fn().mockResolvedValue(mockExportPayload),
      exportMyDataAsCsv: jest.fn().mockResolvedValue('Section,Profile\nemail,member@ucf.edu'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        { provide: MembersService, useValue: membersService },
        { provide: PrismaService, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MembersController>(MembersController);
  });

  it('returns JSON export for the authenticated user', async () => {
    const req = { user: { id: 'user-123' } };
    const res = { setHeader: jest.fn() };

    const result = await controller.exportMyData(req, {}, res as any);

    expect(membersService.exportMyData).toHaveBeenCalledWith('user-123');
    expect(membersService.exportMyDataAsCsv).not.toHaveBeenCalled();
    expect(result).toEqual(mockExportPayload);
  });

  it('returns CSV with attachment headers for format=csv', async () => {
    const req = { user: { id: 'user-456' } };
    const res = { setHeader: jest.fn() };

    const result = await controller.exportMyData(
      req,
      { format: 'csv' },
      res as any,
    );

    expect(membersService.exportMyDataAsCsv).toHaveBeenCalledWith('user-456');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="nsbe-my-data-export.csv"',
    );
    expect(typeof result).toBe('string');
  });
});
