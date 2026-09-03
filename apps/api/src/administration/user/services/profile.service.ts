import { UserProfile } from '@core/database';
import { getAvatarFolderRelativePath } from '@core/utils';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { formatPhone, validatePhone } from '@nexhouse/shared-domain/utils';
import { StorageService } from 'src/storage/storage.service';
import { Repository } from 'typeorm';
import { UpdateUserProfileDto } from '../dtos';
import { UserSearchService } from './user-search.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(UserProfile)
    private readonly repository: Repository<UserProfile>,
    private readonly searchService: UserSearchService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async update(
    userId: string,
    dto: UpdateUserProfileDto,
    avatar?: Express.Multer.File,
  ) {
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

    if (
      profile.avatar &&
      avatar &&
      !profile.avatar.includes('avatar-placeholder.webp')
    ) {
      this.storageService.deleteUploadFile(profile.avatar);
      const url = this.configService.get('UPLOAD_DIR');
      const avatarPath = getAvatarFolderRelativePath(url, avatar.filename);
      profile.avatar = avatarPath;
    }

    await this.repository.update(profile.id, profile);
    return this.repository.findOne({ where: { id: profile.id } });
  }
}
