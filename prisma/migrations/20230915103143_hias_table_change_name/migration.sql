/*
  Warnings:

  - You are about to drop the `suggestion_information` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `suggestion_information`;

-- CreateTable
CREATE TABLE `hias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number_phone` INTEGER NOT NULL,
    `report_date` VARCHAR(191) NOT NULL,
    `report_time` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `reporter_name` VARCHAR(191) NOT NULL,
    `employee_id` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `department_division` VARCHAR(191) NOT NULL,
    `current_company` VARCHAR(191) NOT NULL,
    `information_category` VARCHAR(191) NOT NULL,
    `category_suggestions` VARCHAR(191) NOT NULL,
    `observation_results` VARCHAR(191) NOT NULL,
    `immediate_corrective_actions` VARCHAR(191) NOT NULL,
    `recommendations_improvement_inputs` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `attachment_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
