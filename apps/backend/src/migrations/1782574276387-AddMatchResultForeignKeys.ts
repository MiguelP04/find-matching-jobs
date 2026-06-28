import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchResultForeignKeys1782574276387 implements MigrationInterface {
    name = 'AddMatchResultForeignKeys1782574276387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_match_results_student_id" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_match_results_job_id" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT IF EXISTS "FK_match_results_student_id"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT IF EXISTS "FK_match_results_job_id"`);
    }
}
