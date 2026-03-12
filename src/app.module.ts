import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { VideosModule } from './modules/videos/videos.module';
import { CommentsModule } from './modules/comments/comments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { PlaylistVideosModule } from './modules/playlist-videos/playlist-videos.module';
import { LikesModule } from './modules/likes/likes.module';
import { WatchHistorysModule } from './modules/watch-historys/watch-historys.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [UsersModule, VideosModule, CommentsModule, SubscriptionsModule, PlaylistsModule, PlaylistVideosModule, LikesModule, WatchHistorysModule, NotificationModule]
})
export class AppModule {}
