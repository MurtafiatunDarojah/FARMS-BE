/*
  Warnings:

  - You are about to alter the column `number_phone` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(13)`.
  - You are about to alter the column `employee_id` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `reporter_name` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `position` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `department_division` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `current_company` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `information_category` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `created_by` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `updated_by` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `direct_cause` on the `t_hias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `t_hias` MODIFY `number_phone` VARCHAR(13) NOT NULL,
    MODIFY `employee_id` VARCHAR(20) NOT NULL,
    MODIFY `reporter_name` VARCHAR(50) NOT NULL,
    MODIFY `position` VARCHAR(100) NOT NULL,
    MODIFY `department_division` VARCHAR(50) NOT NULL,
    MODIFY `current_company` VARCHAR(50) NOT NULL,
    MODIFY `information_category` VARCHAR(100) NOT NULL,
    MODIFY `created_by` VARCHAR(20) NOT NULL,
    MODIFY `updated_by` VARCHAR(20) NOT NULL,
    MODIFY `direct_cause` VARCHAR(100) NULL;
