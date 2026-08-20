import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../storage/storage.service';
import { MembersExportService } from './members-export.service';

describe('MembersController', () => {
  let controller: MembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: MembersExportService,
          useValue: {},
        },
        {
          provide: StorageService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MembersController>(MembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
