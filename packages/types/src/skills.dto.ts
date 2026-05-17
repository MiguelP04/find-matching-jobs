import { IsString, MinLength } from "class-validator";

export class CreateSkillDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

export class UpdateSkillDto {
  @IsString()
  @MinLength(2)
  name!: string;
}
