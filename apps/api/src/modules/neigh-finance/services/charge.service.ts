import { Charge, FeeSchedule } from '@database/entities';
import { HousingUnitsService } from '@modules/housing-units/housing-units.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChargeStatusEnum } from '@nex-house/enums';
import { startOfDay } from 'date-fns';
import { DeepPartial, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class ChargeService {
  constructor(
    @InjectRepository(Charge)
    private readonly repo: Repository<Charge>,
    private readonly unitService: HousingUnitsService,
  ) {}

  async generateChargesForResidents(
    qr: QueryRunner,
    schedule: FeeSchedule,
    neighborhoodId: number,
  ) {
    const unitsResponse = await this.unitService.findAll(neighborhoodId, {
      showAll: true,
      first: 0,
      rows: 0,
      sortField: '',
      sortOrder: 0,
    });

    const units = unitsResponse.data;

    const charges = units
      .filter((f) => f.assignments && f.assignments.length > 0)
      .map((unit) => {
        let issuedUser = unit.assignments.find((f) => f.isOwner)?.user;
        if (!issuedUser) {
          issuedUser = unit.assignments.find((f) => f.isTenant)?.user;
        }
        if (!issuedUser) {
          issuedUser = unit.assignments[0].user;
        }
        const nEntity: DeepPartial<Charge> = {
          unitId: unit.id,
          amount: schedule.amount,
          description: schedule.name,
          issuedToUserId: issuedUser.id,
          feeScheduleId: schedule.id,
          status: ChargeStatusEnum.PENDING,
          dueDate: startOfDay(schedule.startDate).toUTCString(), //TODO: change it to add grace days later
        };

        return qr.manager.create(Charge, nEntity);
      });

    // Inserción masiva para performance
    await qr.manager.insert(Charge, charges);
  }
}
