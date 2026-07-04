import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatabaseTriggers1783576276387 implements MigrationInterface {
  name = 'AddDatabaseTriggers1783576276387';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers and functions if they already exist (idempotent)
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_normalize_email ON users`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_create_profile_after_user ON users`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_check_score_range ON match_results`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_normalize_skill_name ON skills`);

    await queryRunner.query(`DROP FUNCTION IF EXISTS normalize_email()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_create_profile_after_user()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS check_score_range()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_normalize_skill_name()`);

    // Trigger 1: Normalize email to lowercase (INSERT and UPDATE)
    await queryRunner.query(`
      CREATE FUNCTION normalize_email() RETURNS TRIGGER AS $$
      BEGIN
        NEW.email := LOWER(NEW.email);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_normalize_email
        BEFORE INSERT OR UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION normalize_email()
    `);

    // Trigger 2: Auto-create profile after user insert (only for students)
    await queryRunner.query(`
      CREATE FUNCTION fn_create_profile_after_user() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.rol = 'estudiante' THEN
          INSERT INTO profiles (user_id) VALUES (NEW.id);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_create_profile_after_user
        AFTER INSERT ON users
        FOR EACH ROW EXECUTE FUNCTION fn_create_profile_after_user()
    `);

    // Trigger 3: Validate score range (INSERT and UPDATE)
    await queryRunner.query(`
      CREATE FUNCTION check_score_range() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.score < 0 OR NEW.score > 100 THEN
          RAISE EXCEPTION 'El score debe estar entre 0 y 100. Valor recibido: %', NEW.score;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_check_score_range
        BEFORE INSERT OR UPDATE ON match_results
        FOR EACH ROW EXECUTE FUNCTION check_score_range()
    `);

    // Trigger 4: Normalize skill name (INSERT and UPDATE)
    await queryRunner.query(`
      CREATE FUNCTION fn_normalize_skill_name() RETURNS TRIGGER AS $$
      BEGIN
        NEW.nombre := LOWER(TRIM(NEW.nombre));
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_normalize_skill_name
        BEFORE INSERT OR UPDATE ON skills
        FOR EACH ROW EXECUTE FUNCTION fn_normalize_skill_name()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_normalize_email ON users`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_create_profile_after_user ON users`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_check_score_range ON match_results`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_normalize_skill_name ON skills`);

    await queryRunner.query(`DROP FUNCTION IF EXISTS normalize_email()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_create_profile_after_user()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS check_score_range()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_normalize_skill_name()`);
  }
}
