-- AlterTable
ALTER TABLE `issue` ADD COLUMN `assignedToUserId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Issue` ADD CONSTRAINT `Issue_assignedToUserId_fkey` FOREIGN KEY (`assignedToUserId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
