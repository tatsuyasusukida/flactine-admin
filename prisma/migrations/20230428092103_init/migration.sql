-- CreateTable
CREATE TABLE `CourseCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sort` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sort` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `term` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `imageWidth` INTEGER NOT NULL,
    `imageHeight` INTEGER NOT NULL,
    `stripePriceId` VARCHAR(191) NOT NULL,
    `courseCategoryId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscriptionOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `orderedAt` DATETIME(3) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `courseId` INTEGER NOT NULL,
    `delivery` VARCHAR(191) NOT NULL,
    `deliveryCount` INTEGER NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerKana` VARCHAR(191) NOT NULL,
    `customerTel` VARCHAR(191) NOT NULL,
    `customerZip` VARCHAR(191) NOT NULL,
    `customerPrefecture` VARCHAR(191) NOT NULL,
    `customerAddress` VARCHAR(191) NOT NULL,
    `customerBuilding` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `destinationZip` VARCHAR(191) NOT NULL,
    `destinationPrefecture` VARCHAR(191) NOT NULL,
    `destinationAddress` VARCHAR(191) NOT NULL,
    `destinationBuilding` VARCHAR(191) NOT NULL,
    `destinationName` VARCHAR(191) NOT NULL,
    `destinationTel` VARCHAR(191) NOT NULL,
    `payment` VARCHAR(191) NOT NULL,
    `stripeCustomerId` VARCHAR(191) NULL,

    UNIQUE INDEX `SubscriptionOrder_number_key`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_courseCategoryId_fkey` FOREIGN KEY (`courseCategoryId`) REFERENCES `CourseCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubscriptionOrder` ADD CONSTRAINT `SubscriptionOrder_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
