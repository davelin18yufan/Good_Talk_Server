/*
  Warnings:

  - The `profile_video_id` column on the `user_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user_settings" DROP COLUMN "profile_video_id",
ADD COLUMN     "profile_video_id" UUID;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_profile_video_id_fkey" FOREIGN KEY ("profile_video_id") REFERENCES "profile_videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
