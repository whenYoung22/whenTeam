import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { Badge, Button, Empty, List, message, Popover, Spin, Typography } from "antd";

import { getNotifications, getUnreadNotificationCount, markAllNotificationsRead, markNotificationRead } from "@/api/notification";

import type { Notification } from "@shared/index";

import "./index.css";

export default function NotificationPopover() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let active = true;
    getUnreadNotificationCount()
      .then((count) => {
        if (active) setUnreadCount(count);
      })
      .catch((error: unknown) => {
        if (active) {
          message.error(
            error instanceof Error ? error.message : "获取未读通知数失败",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await getNotifications();
      setNotifications(result.items);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "获取通知列表失败",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) void loadNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await markNotificationRead(notification.id);
      if (!notification.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1));
        setNotifications((items) =>
          items.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item,
          ),
        );
      }

      setOpen(false);
      const taskQuery =
        notification.taskId === null ? "" : `?taskId=${notification.taskId}`;
      navigate(`/projects/${notification.projectId}${taskQuery}`);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "标记通知已读失败",
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((items) =>
        items.map((item) => ({ ...item, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "标记全部已读失败",
      );
    }
  };

  const content = (
    <div className="notification-popover">
      <div className="notification-popover-header">
        <Typography.Text strong>通知</Typography.Text>
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          disabled={unreadCount === 0}
          onClick={() => void handleMarkAllRead()}
        >
          全部已读
        </Button>
      </div>
      <div className="notification-popover-list">
        {loading ? (
          <div className="notification-popover-loading">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无通知"
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item className="notification-list-item">
                <button
                  type="button"
                  className={`notification-item ${
                    notification.isRead ? "" : "unread"
                  }`}
                  onClick={() => void handleNotificationClick(notification)}
                >
                  <span className="notification-item-indicator" />
                  <span className="notification-item-body">
                    <span className="notification-item-content">
                      <strong>{notification.creatorName}</strong>{" "}
                      {notification.content}
                    </span>
                    <span className="notification-item-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </span>
                </button>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      overlayClassName="notification-popover-overlay"
    >
      <Badge count={unreadCount} overflowCount={99}>
        <Button
          type="text"
          className="topbar-icon-button"
          icon={<BellOutlined />}
          aria-label="消息通知"
          aria-expanded={open}
        />
      </Badge>
    </Popover>
  );
}
