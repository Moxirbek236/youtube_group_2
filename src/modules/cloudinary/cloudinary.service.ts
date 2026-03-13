import { Injectable } from "@nestjs/common";
import cloudinary from "./cloudinary.config";
import { UploadApiResponse } from "cloudinary";


@Injectable()
export class CloudinaryService {
    async uploadImage(file: Express.Multer.File): Promise<string> {
        return new Promise((res, rej) => {
            cloudinary.uploader.upload_stream(
                { folder: "user" },
                (error, result: UploadApiResponse) => {
                    if (error) return rej(error);
                    res(result.secure_url)
                }
            ).end(file.buffer)
        })

    }
}