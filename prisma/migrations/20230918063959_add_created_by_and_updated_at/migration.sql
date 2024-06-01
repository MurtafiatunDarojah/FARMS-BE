/*
  Warnings:

  - You are about to drop the `hias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hias_attachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `hias_attachment` DROP FOREIGN KEY `hias_attachment_hias_id_fkey`;

-- DropTable
DROP TABLE `hias`;

-- DropTable
DROP TABLE `hias_attachment`;

-- CreateTable
CREATE TABLE `t_hias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number_phone` INTEGER NOT NULL,
    `employee_id` VARCHAR(191) NOT NULL,
    `reporter_name` VARCHAR(191) NOT NULL,
    `report_date` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `department_division` VARCHAR(191) NOT NULL,
    `report_time` VARCHAR(191) NOT NULL,
    `current_company` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `information_category` VARCHAR(191) NOT NULL,
    `category_suggestions` VARCHAR(191) NOT NULL,
    `observation_results` VARCHAR(191) NOT NULL,
    `immediate_corrective_actions` VARCHAR(191) NOT NULL,
    `recommendations_improvement_inputs` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `updated_by` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `m_hias_attachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `file_name` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `hias_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `m_hias_attachment` ADD CONSTRAINT `m_hias_attachment_hias_id_fkey` FOREIGN KEY (`hias_id`) REFERENCES `t_hias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
