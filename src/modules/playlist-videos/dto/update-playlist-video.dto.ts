import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaylistVideoDto } from './create-playlist-video.dto';

export class UpdatePlaylistVideoDto extends PartialType(CreatePlaylistVideoDto) {}
