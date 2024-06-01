/*
  Warnings:

  - You are about to drop the column `hias_id` on the `m_hias_attachment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_record]` on the table `t_hias` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_record` to the `m_hias_attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_record` to the `t_hias` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `m_hias_attachment` DROP FOREIGN KEY `m_hias_attachment_hias_id_fkey`;

-- AlterTable
ALTER TABLE `m_hias_attachment` DROP COLUMN `hias_id`,
    ADD COLUMN `id_record` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `t_hias` ADD COLUMN `id_record` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `t_hias_id_record_key` ON `t_hias`(`id_record`);

-- AddForeignKey
ALTER TABLE `m_hias_attachment` ADD CONSTRAINT `m_hias_attachment_id_record_fkey` FOREIGN KEY (`id_record`) REFERENCES `t_hias`(`id_record`) ON DELETE RESTRICT ON UPDATE CASCADE;
