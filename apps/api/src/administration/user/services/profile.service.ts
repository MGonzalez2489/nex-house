import { UserProfile } from '@core/database';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserProfileDto } from '../dtos';
import { UserSearchService } from './user-search.service';
import { formatPhone, validatePhone } from '@nexhouse/shared-domain/utils';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(UserProfile)
    private readonly repository: Repository<UserProfile>,
    private readonly searchService: UserSearchService,
  ) {}

  async update(userId: string, dto: UpdateUserProfileDto) {
    const existingUser = await this.searchService.findByPublicIdOrThrow(
      userId,
      undefined,
      { profile: true },
    );
    const profile = existingUser.profile;

    if (dto.firstName) profile.firstName = dto.firstName.trim();
    if (dto.lastName) profile.lastName = dto.lastName.trim();

    if (dto.phone) {
      const formatedPhone = formatPhone(dto.phone);
      if (formatedPhone !== profile.phone) {
        if (!validatePhone(formatedPhone)) {
          throw new BadRequestException('User phone format not valid.');
        }
        const existsPhone = await this.repository.exists({
          where: { phone: formatedPhone },
        });
        if (existsPhone) {
          throw new ConflictException(`Phone ${dto.phone} already in use.`);
        }
        profile.phone = formatedPhone;
      }
    }

    await this.repository.update(profile.id, profile);
    return this.repository.findOne({ where: { id: profile.id } });
  }
}
