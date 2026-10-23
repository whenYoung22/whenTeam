import { useMemo, useState } from "react";
import { Button, Empty, Table, Tabs, Tag, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import type { TableProps } from "antd";

import type { TaskPriority, TaskResponse, TaskStatus } from "@shared/index";

import "./index.css";

interface TaskListProps {
  tasks: TaskResponse[];
  onCreateTask?: () => void;
  onTaskClick?: (task: TaskResponse) => void;
}

/** 优先级文案与颜色 */
const PRIORITY_META: Record<
  TaskPriority,
  { label: string; color: string; dot: string }
> = {
  HIGH: { label: "高", color: "#ff4d4f", dot: "#ff4d4f" },
  MEDIUM: { label: "中", color: "#faad14", dot: "#faad14" },
  LOW: { label: "低", color: "#52c41a", dot: "#52c41a" },
};

/** 状态文案与 Tag 颜色 */
const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: "待开始", color: "default" },
  DOING: { label: "进行中", color: "processing" },
  DONE: { label: "已完成", color: "success" },
};

type FilterKey = "all" | TaskStatus;

export default function TaskList({
  tasks,
  onCreateTask,
  onTaskClick,
}: TaskListProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  /** 各状态的数量，用于 tab 的徽标 */
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      doing: tasks.filter((t) => t.status === "DOING").length,
      done: tasks.filter((t) => t.status === "DONE").length,
    };
  }, [tasks]);

  /** 按当前筛选过滤任务 */
  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const columns: TableProps<TaskResponse>["columns"] = [
    {
      title: "任务",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => {
        // 完成的任务标题加删除线？截图里没有，保持原样，用状态图标区分
        const isDone = record.status === "DONE";
        return (
          <span className={`task-title${isDone ? " task-title-done" : ""}`}>
            {title}
          </span>
        );
      },
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      width: 110,
      render: (priority: TaskPriority) => {
        const meta = PRIORITY_META[priority];
        return (
          <span className="task-priority">
            <i className="task-priority-dot" style={{ background: meta.dot }} />
            {meta.label}
          </span>
        );
      },
    },
    {
      title: "负责人",
      dataIndex: "assignee",
      key: "assignee",
      width: 140,
      render: (assignee: TaskResponse["assignee"]) => (
        <span className="task-assignee">
          <span className="task-assignee-avatar">
            {assignee.name.trim().charAt(0) || "?"}
          </span>
          {assignee.name}
        </span>
      ),
    },
    {
      title: "截止日期",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 140,
      render: (dueDate: string) => dueDate,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status: TaskStatus) => {
        const meta = STATUS_META[status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
  ];

  return (
    <section className="task-list">
      <div className="task-list-header">
        <div className="task-list-heading">
          <h2 className="task-list-title">
            项目任务
            <span className="task-list-count">{tasks.length}</span>
          </h2>
          <p className="task-list-desc">跟进任务状态与负责人</p>
        </div>

        {/* 右侧：创建任务按钮 */}
        <Tooltip
          title={onCreateTask ? undefined : "任务创建功能尚未接入"}
          mouseEnterDelay={0.4}
        >
          <span>
            <Button
              type="primary"
              className="task-list-create-btn"
              icon={<PlusOutlined />}
              onClick={onCreateTask}
              disabled={!onCreateTask}
            >
              创建任务
            </Button>
          </span>
        </Tooltip>
      </div>

      <Tabs
        className="task-list-tabs"
        activeKey={filter}
        onChange={(key) => setFilter(key as FilterKey)}
        items={[
          {
            key: "all",
            label: (
              <span>
                全部
                <span className="task-list-tab-count">{counts.all}</span>
              </span>
            ),
          },
          {
            key: "TODO",
            label: (
              <span>
                待开始
                <span className="task-list-tab-count">{counts.todo}</span>
              </span>
            ),
          },
          {
            key: "DOING",
            label: (
              <span>
                进行中
                <span className="task-list-tab-count">{counts.doing}</span>
              </span>
            ),
          },
          {
            key: "DONE",
            label: (
              <span>
                已完成
                <span className="task-list-tab-count">{counts.done}</span>
              </span>
            ),
          },
        ]}
      />

      <Table<TaskResponse>
        className="task-list-table"
        rowKey="id"
        columns={columns}
        dataSource={filteredTasks}
        locale={{
          emptyText: (
            <Empty
              description={
                tasks.length === 0
                  ? "当前项目暂无任务"
                  : "没有符合当前筛选的任务"
              }
            />
          ),
        }}
        pagination={false}
        rowClassName={(_record, index) =>
          index % 2 === 1 ? "table-stripe-row" : ""
        }
        onRow={(record) => ({
          onClick: () => onTaskClick?.(record), // 新增
          style: { cursor: onTaskClick ? "pointer" : undefined },
        })}
      />
    </section>
  );
}
