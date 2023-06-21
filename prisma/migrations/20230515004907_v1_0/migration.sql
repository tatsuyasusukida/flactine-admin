-- CreateTable
CREATE TABLE `Email` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL,
    `isSent` BOOLEAN NOT NULL,
    `fromName` VARCHAR(191) NOT NULL,
    `fromEmail` VARCHAR(191) NOT NULL,
    `toName` VARCHAR(191) NOT NULL,
    `toEmail` VARCHAR(191) NOT NULL,
    `bccEmail` VARCHAR(191) NOT NULL,
    `replyToEmail` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `content` MEDIUMTEXT NOT NULL,
    `errorCount` INTEGER NOT NULL,
    `errorMessage` TEXT NOT NULL,
    `errorStack` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prefecture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sort` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sort` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `prefectureId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_prefectureId_fkey` FOREIGN KEY (`prefectureId`) REFERENCES `Prefecture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
