import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModalidadToJobs1782572276387 implements MigrationInterface {
    name = 'AddModalidadToJobs1782572276387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" ADD "modalidad" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "modalidad"`);
    }
}
