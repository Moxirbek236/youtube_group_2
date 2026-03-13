import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsString, IsStrongPassword } from "class-validator"

export class RegisterDto {
    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsString()
    username: string

    @ApiProperty()
    @IsString()
    firstName: string

    @ApiProperty()
    @IsString()
    lastName: string

    @ApiProperty()
    @IsStrongPassword()
    password:string

    @ApiPropertyOptional({ type: "string", format: "binary" })
    avatar?: string
}