/*
  Warnings:

  - You are about to drop the column `id_form` on the `m_hias_attachment` table. All the data in the column will be lost.
  - Added the required column `id_record` to the `m_hias_attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `m_hias_attachment` DROP FOREIGN KEY `m_hias_attachment_id_form_fkey`;

-- AlterTable
ALTER TABLE `m_hias_attachment` DROP COLUMN `id_form`,
    ADD COLUMN `id_record` VARCHAR(191) NOT NULL;
