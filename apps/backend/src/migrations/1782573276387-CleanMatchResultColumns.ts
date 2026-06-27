import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanMatchResultColumns1782573276387 implements MigrationInterface {
    name = 'CleanMatchResultColumns1782573276387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT IF EXISTS "FK_f52b5d18e1ecbc5cbd85f846504"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT IF EXISTS "FK_d779a5f774681b503443dae2729"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP COLUMN IF EXISTS "studentId"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP COLUMN IF EXISTS "jobId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_results" ADD "studentId" integer`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD "jobId" integer`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_f52b5d18e1ecbc5cbd85f846504" FOREIGN KEY ("studentId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_d779a5f774681b503443dae2729" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
