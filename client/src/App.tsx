import { useState } from 'react';
import axios from 'axios';

type HealthResp = {
  message: string;
};

const ApiHealthTest = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HealthResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const res = await axios.get<HealthResp>('http://localhost:3000/api/health');
      setData(res.data);
      console.log("client----API 健康测试响应:", res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      setError(message || '请求失败，请确认后端服务是否启动在3000端口');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 500, border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>API 健康测试 /api/health</h3>
      <button
        onClick={checkHealth}
        disabled={loading}
        style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? '请求中...' : '点击测试接口'}
      </button>

      <div style={{ marginTop: 16 }}>
        {data && (
          <div style={{ background: '#e6ffe6', padding: 12, borderRadius: 6 }}>
            ✅ 请求成功
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
        {error && (
          <div style={{ background: '#ffe9e9', padding: 12, borderRadius: 6, color: '#c00' }}>
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiHealthTest;
