import { Expose } from "class-transformer"

export class ValidateEmailDto {
   jwt!: string
   secret_code! : string
}