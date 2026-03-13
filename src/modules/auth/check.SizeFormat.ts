import { UnsupportedMediaTypeException } from "@nestjs/common"

const CheckFormatAvatar=(file)=>{
    const formats=['jpg', 'jpeg', 'png', 'webp',"svg"]
    if(file.originalname.includes(formats)){
        throw new UnsupportedMediaTypeException("This type of images not supported ❌")
    }
}