CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('TASK_ASSIGNED', 'TASK_STATUS_CHANGED', 'PROJECT_MEMBER_ADDED') NOT NULL,
    `content` VARCHAR(500) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creatorId` INTEGER NOT NULL,
    `receiverId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `taskId` INTEGER NULL,

    INDEX `Notification_receiverId_createdAt_idx`(`receiverId`, `createdAt`),
    INDEX `Notification_receiverId_isRead_createdAt_idx`(`receiverId`, `isRead`, `createdAt`),
    INDEX `Notification_projectId_idx`(`projectId`),
    INDEX `Notification_taskId_idx`(`taskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Notification`
    ADD CONSTRAINT `Notification_creatorId_fkey`
    FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Notification`
    ADD CONSTRAINT `Notification_receiverId_fkey`
    FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Notification`
    ADD CONSTRAINT `Notification_projectId_fkey`
    FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Notification`
    ADD CONSTRAINT `Notification_taskId_fkey`
    FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
