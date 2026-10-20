import { Avatar, Button } from "antd";
import { AppstoreOutlined,ClockCircleOutlined,PlusOutlined } from "@ant-design/icons";
import type { ProjectOverviewResponse } from "@shared/index";

import "./index.css";

interface OverviewPanelProps {
  data: ProjectOverviewResponse;
  onCreateProject?: () => void; // 点击“新建项目”回调
}

const AVATAR_COLORS = ["#b4b9c7"];

export default function OverviewPanel({data,onCreateProject,}: OverviewPanelProps) {
  return (
    <section className="project-overview">
      <div className="project-overview-heading">
        {/* 左侧：标题 + 副标题 */}
        <div className="project-overview-heading-text">
          <h1 className="project-overview-title">
            项目
            <span className="project-overview-count">{data.projectCount}</span>
          </h1>
          <p className="project-overview-subtitle">
            和团队一起，让每个好想法都稳步向前。
          </p>
        </div>

        {/* 右侧：新建项目按钮 */}
        <Button
          type="primary"
          className="project-overview-create-btn"
          icon={<PlusOutlined />}
          onClick={onCreateProject}
        >
          新建项目
        </Button>
      </div>


      
      <div className="project-overview-stats">
        {/* 进行中的项目 */}
        <div className="project-overview-stat">
          <div className="project-overview-stat-icon project-overview-stat-icon-purple">
            <AppstoreOutlined />
          </div>
          <div className="project-overview-stat-body">
            <div className="project-overview-stat-label">进行中的项目</div>
            <div className="project-overview-stat-value">
              {String(data.projectCount).padStart(2, "0")}
              <span className="project-overview-stat-unit">个项目</span>
            </div>
          </div>
        </div>

        <div className="project-overview-stat-divider" />

        {/* 本周待完成任务 */}
        <div className="project-overview-stat">
          <div className="project-overview-stat-icon project-overview-stat-icon-orange">
            <ClockCircleOutlined />
          </div>
          <div className="project-overview-stat-body">
            <div className="project-overview-stat-label">本周待完成任务</div>
            <div className="project-overview-stat-value">
              {data.weekTaskCount}
              <span className="project-overview-stat-unit">项任务</span>
            </div>
          </div>
        </div>

        <div className="project-overview-stat-divider" />

        {/* 正在一起协作 */}
        <div className="project-overview-stat project-overview-stat-grow">
          <div className="project-overview-stat-body">
            <div className="project-overview-stat-label">正在一起协作</div>
            <div className="project-overview-stat-collaborators">
              <Avatar.Group max={{ count: 5 }} size={28}>
                {data.collaborators.map((user, index) => (
                  <Avatar
                    key={user.id}
                    src={user.avatarUrl}
                    size={28}
                    style={{
                      backgroundColor:
                        AVATAR_COLORS[index % AVATAR_COLORS.length],
                      fontSize: 12,
                    }}
                  >
                    {user.name.trim().charAt(0)}
                  </Avatar>
                ))}
              </Avatar.Group>
              <span className="project-overview-stat-unit">
                {data.collaboratorCount} 位成员
              </span>
            </div>
          </div>
        </div>

        {/* 右侧标语 */}
        <div className="project-overview-slogan">
          每一步进展，都值得被看见
          <span className="project-overview-slogan-star">✦</span>
        </div>
      </div>
    </section>
  );
}
