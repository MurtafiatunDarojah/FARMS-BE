/*
  Warnings:

  - You are about to drop the `_hiasTohias_attachment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hias_id` to the `hias_attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_hiasTohias_attachment` DROP FOREIGN KEY `_hiasTohias_attachment_A_fkey`;

-- DropForeignKey
ALTER TABLE `_hiasTohias_attachment` DROP FOREIGN KEY `_hiasTohias_attachment_B_fkey`;

-- AlterTable
ALTER TABLE `hias_attachment` ADD COLUMN `hias_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_hiasTohias_attachment`;

-- AddForeignKey
ALTER TABLE `hias_attachment` ADD CONSTRAINT `hias_attachment_hias_id_fkey` FOREIGN KEY (`hias_id`) REFERENCES `hias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
