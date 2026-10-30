ALTER TABLE `Notification`
    MODIFY `type` ENUM(
        'TASK_ASSIGNED',
        'TASK_STATUS_CHANGED',
        'PROJECT_MEMBER_ADDED',
        'PROJECT_MEMBER_REMOVED',
        'TASK_DELETED',
        'PROJECT_DELETED'
    ) NOT NULL;

ALTER TABLE `Notification`
    DROP FOREIGN KEY `Notification_projectId_fkey`;

ALTER TABLE `Notification`
    MODIFY `projectId` INTEGER NULL;

ALTER TABLE `Notification`
    ADD CONSTRAINT `Notification_projectId_fkey`
    FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
