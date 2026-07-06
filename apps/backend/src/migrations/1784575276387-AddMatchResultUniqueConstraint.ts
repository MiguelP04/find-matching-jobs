import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchResultUniqueConstraint1784575276387 implements MigrationInterface {
    name = 'AddMatchResultUniqueConstraint1784575276387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove duplicate rows keeping the one with the highest score before adding the constraint
        await queryRunner.query(`
            DELETE FROM match_results a USING match_results b
            WHERE a.id < b.id
            AND a.student_id = b.student_id
            AND a.job_id = b.job_id
        `);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "UQ_match_student_job" UNIQUE ("student_id", "job_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT IF EXISTS "UQ_match_student_job"`);
    }
}
