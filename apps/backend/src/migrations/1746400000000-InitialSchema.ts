import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm'

export class InitialSchema1746400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'nombre', type: 'character varying', length: '100', isNullable: false },
          { name: 'apellido', type: 'character varying', length: '100', isNullable: false },
          { name: 'email', type: 'character varying', isNullable: false, isUnique: true },
          { name: 'password', type: 'character varying', isNullable: false },
          { name: 'rol', type: 'enum', enum: ['estudiante', 'admin'], default: "'estudiante'", isNullable: false },
        ],
      }),
      true,
    )

    // Create profiles table
    await queryRunner.createTable(
      new Table({
        name: 'profiles',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'integer', isNullable: false, isUnique: true },
          { name: 'resumen_profesional', type: 'text', isNullable: true },
          { name: 'semestre', type: 'integer', isNullable: true },
          { name: 'modalidad_preferida', type: 'enum', enum: ['remoto', 'presencial', 'hibrido'], isNullable: true },
          { name: 'github_url', type: 'character varying', isNullable: true },
          { name: 'linkedin_url', type: 'character varying', isNullable: true },
        ],
      }),
      true,
    )

    // Create skills table
    await queryRunner.createTable(
      new Table({
        name: 'skills',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'nombre', type: 'character varying', isNullable: false, isUnique: true },
        ],
      }),
      true,
    )

    // Create student_skills table
    await queryRunner.createTable(
      new Table({
        name: 'student_skills',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'student_id', type: 'integer', isNullable: false },
          { name: 'skill_id', type: 'integer', isNullable: false },
          { name: 'nivel', type: 'enum', enum: ['Básico', 'Intermedio', 'Avanzado'], isNullable: false },
        ],
      }),
      true,
    )

    // Create jobs table
    await queryRunner.createTable(
      new Table({
        name: 'jobs',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'external_id', type: 'character varying', isNullable: true },
          { name: 'titulo', type: 'character varying', isNullable: false },
          { name: 'empresa', type: 'character varying', isNullable: false },
          { name: 'descripcion', type: 'text', isNullable: false },
          { name: 'ubicacion', type: 'character varying', isNullable: false },
          { name: 'url_postulacion', type: 'character varying', isNullable: false },
          { name: 'fecha_publicacion', type: 'timestamp without time zone', isNullable: false },
        ],
      }),
      true,
    )

    // Create match_results table
    await queryRunner.createTable(
      new Table({
        name: 'match_results',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'student_id', type: 'integer', isNullable: false },
          { name: 'job_id', type: 'integer', isNullable: false },
          { name: 'score', type: 'integer', isNullable: false },
          { name: 'justificacion_ia', type: 'text', isNullable: false },
          { name: 'missing_skills', type: 'text', isNullable: true },
          { name: 'fecha_analisis', type: 'timestamp without time zone', isNullable: false },
        ],
      }),
      true,
    )

    // Add foreign keys
    await queryRunner.createForeignKey(
      'profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.createForeignKey(
      'student_skills',
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedTableName: 'profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.createForeignKey(
      'student_skills',
      new TableForeignKey({
        columnNames: ['skill_id'],
        referencedTableName: 'skills',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.createForeignKey(
      'match_results',
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedTableName: 'profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.createForeignKey(
      'match_results',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'jobs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    )

    // Add indexes
    await queryRunner.createIndex('users', new TableIndex({ name: 'IDX_USERS_EMAIL', columnNames: ['email'] }))
    await queryRunner.createIndex('profiles', new TableIndex({ name: 'IDX_PROFILES_USER_ID', columnNames: ['user_id'] }))
    await queryRunner.createIndex('skills', new TableIndex({ name: 'IDX_SKILLS_NOMBRE', columnNames: ['nombre'] }))
    await queryRunner.createIndex('student_skills', new TableIndex({ name: 'IDX_STUDENT_SKILLS_STUDENT_ID', columnNames: ['student_id'] }))
    await queryRunner.createIndex('student_skills', new TableIndex({ name: 'IDX_STUDENT_SKILLS_SKILL_ID', columnNames: ['skill_id'] }))
    await queryRunner.createIndex('student_skills', new TableIndex({ name: 'IDX_STUDENT_SKILLS_UNIQUE', columnNames: ['student_id', 'skill_id'], isUnique: true }))
    await queryRunner.createIndex('jobs', new TableIndex({ name: 'IDX_JOBS_TITULO', columnNames: ['titulo'] }))
    await queryRunner.createIndex('jobs', new TableIndex({ name: 'IDX_JOBS_EMPRESA', columnNames: ['empresa'] }))
    await queryRunner.createIndex('jobs', new TableIndex({ name: 'IDX_JOBS_UBICACION', columnNames: ['ubicacion'] }))
    await queryRunner.createIndex('match_results', new TableIndex({ name: 'IDX_MATCH_RESULTS_STUDENT_ID', columnNames: ['student_id'] }))
    await queryRunner.createIndex('match_results', new TableIndex({ name: 'IDX_MATCH_RESULTS_JOB_ID', columnNames: ['job_id'] }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('match_results')
    await queryRunner.dropTable('student_skills')
    await queryRunner.dropTable('jobs')
    await queryRunner.dropTable('skills')
    await queryRunner.dropTable('profiles')
    await queryRunner.dropTable('users')
  }
}
