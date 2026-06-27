import React from 'react';

// ==========================================
// 1. LINE CHART: Daily MRI Scans
// ==========================================
interface ChartDataItem {
  label: string;
  count: number;
}

interface LineChartProps {
  data: ChartDataItem[];
}

export const LineChart: React.FC<ChartDataItem[] | LineChartProps> = (props) => {
  // Handle both array input and props object input for flex
  const data = Array.isArray(props) ? props : props.data;
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No chart data.</div>;

  const maxVal = Math.max(...data.map(d => d.count), 5); // Fallback to 5 to avoid div-by-zero
  const height = 150;
  const width = 360;
  const padding = 30;

  const points = data.map((d, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1 || 1);
    const y = height - padding - (d.count * (height - 2 * padding)) / maxVal;
    return { x, y, label: d.label, val: d.count };
  });

  const pathD = points.reduce((acc, p, index) => {
    return acc + (index === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * (height - 2 * padding);
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={padding - 8} y={y + 4} fontSize="9" fill="var(--text-muted)" textAnchor="end">{gridVal}</text>
            </g>
          );
        })}

        {/* Path line */}
        <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data circles */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2.5" />
            <text x={p.x} y={height - 8} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{p.label}</text>
            
            {/* Value popups */}
            <text x={p.x} y={p.y - 8} fontSize="8" fontWeight="bold" fill="var(--text-primary)" textAnchor="middle">{p.val}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ==========================================
// 2. BAR CHART: Tumor Types
// ==========================================
interface BarChartProps {
  data: Record<string, number>;
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const entries = Object.entries(data);
  if (entries.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No chart data.</div>;

  const maxVal = Math.max(...entries.map(([_, v]) => v), 5);
  const height = 150;
  const width = 360;
  const padding = 30;

  const barWidth = 32;
  const usableWidth = width - 2 * padding;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        {/* Horizontal gridlines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding + ratio * (height - 2 * padding);
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border)" strokeWidth="0.5" />
              <text x={padding - 8} y={y + 4} fontSize="9" fill="var(--text-muted)" textAnchor="end">{gridVal}</text>
            </g>
          );
        })}

        {/* Bars */}
        {entries.map(([label, count], index) => {
          const x = padding + (index * usableWidth) / (entries.length || 1) + (usableWidth / entries.length - barWidth) / 2;
          const barHeight = (count * (height - 2 * padding)) / maxVal;
          const y = height - padding - barHeight;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="4"
                fill="linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%)"
                style={{ fill: 'var(--primary)', opacity: 0.85 }}
              />
              <text x={x + barWidth / 2} y={height - 8} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{label}</text>
              <text x={x + barWidth / 2} y={y - 6} fontSize="9" fontWeight="bold" fill="var(--text-primary)" textAnchor="middle">{count}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// 3. PIE CHART: Detection Donut Distribution
// ==========================================
interface PieChartProps {
  data: { label: string; count: number }[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const colors = ['var(--error)', 'var(--success)', 'var(--accent)', 'var(--primary)'];
  
  // Use circle dash-offset logic for zero-trig responsive Donut chart
  let cumulativePercent = 0;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', width: '100%', height: '100%' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <circle cx="50" cy="50" r={radius} stroke="var(--border)" strokeWidth="12" fill="transparent" />
          {data.map((item, index) => {
            const percent = (item.count / total) * 100;
            const strokeDashoffset = circumference - (circumference * percent) / 100;
            const rotation = (cumulativePercent / 100) * 360;
            cumulativePercent += percent;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r={radius}
                stroke={colors[index % colors.length]}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation - 90} 50 50)`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{total}</span>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', textAlign: 'left' }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[index % colors.length] }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              {item.label}: <strong>{item.count}</strong> ({((item.count / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. AREA CHART: Weekly AI Usage
// ==========================================
interface AreaChartProps {
  data: ChartDataItem[];
}

export const AreaChart: React.FC<AreaChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No chart data.</div>;

  const maxVal = Math.max(...data.map(d => d.count), 5);
  const height = 150;
  const width = 360;
  const padding = 30;

  const points = data.map((d, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1 || 1);
    const y = height - padding - (d.count * (height - 2 * padding)) / maxVal;
    return { x, y, label: d.label, val: d.count };
  });

  const linePath = points.reduce((acc, p, index) => {
    return acc + (index === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding + ratio * (height - 2 * padding);
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border)" strokeWidth="0.5" />
              <text x={padding - 8} y={y + 4} fontSize="9" fill="var(--text-muted)" textAnchor="end">{gridVal}</text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2" />
            <text x={p.x} y={height - 8} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{p.label}</text>
            <text x={p.x} y={p.y - 8} fontSize="8" fontWeight="bold" fill="var(--text-primary)" textAnchor="middle">{p.val}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ==========================================
// 5. CONFIDENCE TREND GRAPH
// ==========================================
interface ConfidenceTrendProps {
  data: { label: string; score: number }[];
}

export const ConfidenceTrend: React.FC<ConfidenceTrendProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        No historical confidence logs.
      </div>
    );
  }

  const height = 150;
  const width = 360;
  const padding = 30;

  const points = data.map((d, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1 || 1);
    // Score is 0 - 100
    const y = height - padding - (d.score * (height - 2 * padding)) / 100;
    return { x, y, label: d.label, score: d.score };
  });

  const pathD = points.reduce((acc, p, index) => {
    return acc + (index === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * (height - 2 * padding);
          const gridVal = 100 - ratio * 100;
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
              <text x={padding - 8} y={y + 4} fontSize="9" fill="var(--text-muted)" textAnchor="end">{gridVal}%</text>
            </g>
          );
        })}

        {/* Path line */}
        <path d={pathD} fill="none" stroke="var(--success)" strokeWidth="2" strokeDasharray="1,1" style={{ strokeDasharray: 'none' }} />

        {/* Data circles */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="var(--success)" />
            <text x={p.x} y={height - 8} fontSize="7.5" fill="var(--text-muted)" textAnchor="middle">{p.label}</text>
            <text x={p.x} y={p.y - 7} fontSize="8" fontWeight="bold" fill="var(--success)" textAnchor="middle">{p.score}%</text>
          </g>
        ))}
      </svg>
    </div>
  );
};
