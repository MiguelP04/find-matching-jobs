import { MigrationInterface, QueryRunner } from "typeorm";

export class DropModalidadFromJobs1782575276387 implements MigrationInterface {
    name = 'DropModalidadFromJobs1782575276387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN IF EXISTS "modalidad"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" ADD "modalidad" character varying`);
    }
}
