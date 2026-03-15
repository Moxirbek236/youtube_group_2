import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: "user@gmail.com", description: "User email" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "123456", description: "Password, minimum 6 characters" })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: "abdulaziz", description: "Unique username" })
    @IsString()
    username: string;

    @ApiProperty({ example: "Abdulaziz", description: "First name" })
    @IsString()
    firstName: string;

    @ApiProperty({ example: "Azizov", description: "Last name" })
    @IsString()
    lastName: string;

    @ApiPropertyOptional({ example: "https://res.cloudinary.com/.../avatar.png", description: "Avatar URL" })
    @IsOptional()
    @IsString()
    avatar?: string;
}