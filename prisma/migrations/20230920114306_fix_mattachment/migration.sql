/*
  Warnings:

  - You are about to drop the column `id_record` on the `m_hias_attachment` table. All the data in the column will be lost.
  - Added the required column `id_form` to the `m_hias_attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `m_hias_attachment` DROP FOREIGN KEY `m_hias_attachment_id_record_fkey`;

-- AlterTable
ALTER TABLE `m_hias_attachment` DROP COLUMN `id_record`,
    ADD COLUMN `id_form` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `m_hias_attachment` ADD CONSTRAINT `m_hias_attachment_id_form_fkey` FOREIGN KEY (`id_form`) REFERENCES `t_hias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
