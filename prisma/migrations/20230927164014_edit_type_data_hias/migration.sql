/*
  Warnings:

  - You are about to alter the column `number_phone` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `report_date` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `report_time` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `t_hias` MODIFY `number_phone` INTEGER NOT NULL,
    MODIFY `report_date` DATETIME(3) NOT NULL,
    MODIFY `report_time` DATETIME(3) NOT NULL;
