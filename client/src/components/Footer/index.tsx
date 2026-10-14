import "./index.css";

interface FooterProps {
  /** 最近更新时间，默认取当前时间；后续可传入后端返回的项目更新时间 */
  updatedAt?: Date;
}

// 将时间格式化为「今天 HH:mm」，跨天时回退为完整日期
function formatUpdatedAt(date: Date): string {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  if (isToday) {
    return `今天 ${hh}:${mm}`;
  }

  const yyyy = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mo}-${dd} ${hh}:${mm}`;
}

export default function Footer({ updatedAt = new Date() }: FooterProps) {
  return (
    <footer className="content-footer">
      最近更新于 {formatUpdatedAt(updatedAt)}{" "}
      <span>
        保持专注，协作顺畅 <i>✳</i>
      </span>
    </footer>
  );
}