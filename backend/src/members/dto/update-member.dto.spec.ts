import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateMemberDto } from './update-member.dto';
import { UpdateMemberDuesDto } from './update-dues.dto';

describe('UpdateMemberDto dues fields', () => {
  it('accepts optional boolean dues fields', async () => {
    const dto = plainToInstance(UpdateMemberDto, {
      chapterDuesSelfReported: true,
      nationalDuesSelfReported: false,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects non-boolean chapterDuesSelfReported', async () => {
    const dto = plainToInstance(UpdateMemberDto, {
      chapterDuesSelfReported: 'yes',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'chapterDuesSelfReported')).toBe(
      true,
    );
  });

  it('rejects non-boolean nationalDuesSelfReported', async () => {
    const dto = plainToInstance(UpdateMemberDto, {
      nationalDuesSelfReported: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'nationalDuesSelfReported')).toBe(
      true,
    );
  });
});

describe('UpdateMemberDuesDto', () => {
  it('accepts optional boolean dues fields', async () => {
    const dto = plainToInstance(UpdateMemberDuesDto, {
      chapterDuesSelfReported: false,
      nationalDuesSelfReported: true,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects non-boolean values', async () => {
    const dto = plainToInstance(UpdateMemberDuesDto, {
      chapterDuesSelfReported: 'true',
      nationalDuesSelfReported: null,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
