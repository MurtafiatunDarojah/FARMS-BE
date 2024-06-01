/*
  Warnings:

  - You are about to drop the column `attachment_id` on the `hias` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `hias` DROP COLUMN `attachment_id`;

-- CreateTable
CREATE TABLE `hias_attachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `file_name` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_hiasTohias_attachment` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_hiasTohias_attachment_AB_unique`(`A`, `B`),
    INDEX `_hiasTohias_attachment_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_hiasTohias_attachment` ADD CONSTRAINT `_hiasTohias_attachment_A_fkey` FOREIGN KEY (`A`) REFERENCES `hias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_hiasTohias_attachment` ADD CONSTRAINT `_hiasTohias_attachment_B_fkey` FOREIGN KEY (`B`) REFERENCES `hias_attachment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
