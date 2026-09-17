import { UserProfile } from '@core/database';
import { getAvatarFolderRelativePath } from '@core/utils';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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
  constructor(
    @InjectRepository(UserProfile)
    private readonly repository: Repository<UserProfile>,
    private readonly searchService: UserSearchService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Loads the profile owned by a user.
   *
   * @param userId Internal id of the user.
   * @returns The matching profile with its avatar, or null when none exists.
   */
  async getByUserId(userId: number): Promise<UserProfile | null> {
    return this.repository.findOne({
      where: { userId },
      relations: { avatar: true },
    });
  }

  /**
   * Updates the profile of a user, enforcing unique phone numbers and
   * persisting an optional avatar upload.
   *
   * @param publicId Public unique identifier of the user.
   * @param dto Editable profile fields.
   * @param avatar Optional uploaded avatar file.
   * @returns The reloaded profile.
   *
   * @throws {NotFoundException} If the user or their profile does not exist.
   * @throws {BadRequestException} If the phone format is invalid.
   * @throws {ConflictException} If the phone is already in use.
   */
  async update(
    publicId: string,
    dto: UpdateUserProfileDto,
    avatar?: Express.Multer.File,
  ): Promise<UserProfile | null> {
    const existingUser = await this.searchService.findByPublicIdOrThrow(
      publicId,
      undefined,
      { profile: true },
    );

    const profile = existingUser.profile;
    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }

    if (dto.firstName) profile.firstName = dto.firstName.trim();
    if (dto.lastName) profile.lastName = dto.lastName.trim();

    if (dto.phone) {
      const formattedPhone = formatPhone(dto.phone);
      if (formattedPhone !== profile.phone) {
        if (!validatePhone(formattedPhone)) {
          throw new BadRequestException('User phone format not valid.');
        }
        const existsPhone = await this.repository.exists({
          where: { phone: formattedPhone },
        });
        if (existsPhone) {
          throw new ConflictException(`Phone ${dto.phone} already in use.`);
        }
        profile.phone = formattedPhone;
      }
    }

    if (avatar) {
      const url = this.configService.get('UPLOAD_DIR');
      const avatarPath = getAvatarFolderRelativePath(url, avatar.filename);
      const nxFile = await this.storageService.uploadFile(avatarPath, avatar);
      profile.avatarId = nxFile.id;
    }

    await this.repository.update(profile.id, profile);
    return this.getByUserId(existingUser.id);
  }
}
