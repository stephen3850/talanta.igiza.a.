'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * Format currency numbers dynamically for graph ticks and totals
 */
function formatAmount(val, currency = 'KSh') {
  if (val >= 1000000) {
    return `${currency} ${(val / 1000000).toFixed(1)}M`;
  }
  if (val >= 100000) {
    return `${currency} ${Math.round(val / 1000)}k`;
  }
  return `${currency} ${Number(val).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTickLabel(val, currency = 'KSh') {
  if (val >= 1000000) return `${currency} ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${currency} ${Math.round(val / 1000)}k`;
  return `${currency} ${Math.round(val)}`;
}

/**
 * Generates default 30-day daily trend data if none provided
 */
function generateDefault30DayData(baseRevenue = 50) {
  const data = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    // Format label as MM-DD (e.g. 10-04)
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateLabel = `${month}-${day}`;
    const fullDate = d.toISOString().split('T')[0];

    // Create realistic pattern: low baseline, with spike near end like example image
    let rev = 0;
    if (i === 1) {
      rev = baseRevenue; // Main peak (e.g., KSh 50)
    } else if (i === 3) {
      rev = Math.round(baseRevenue * 0.15);
    } else if (i === 0) {
      rev = Math.round(baseRevenue * 0.05);
    } else if (i % 7 === 0) {
      rev = Math.round(baseRevenue * 0.08);
    }

    data.push({
      date: dateLabel,
      fullDate,
      revenue: rev,
    });
  }
  return data;
}

export default function RevenueTrendChart({
  title = 'Daily Salon Revenue Trend (LAST 30 DAYS)',
  subtitle = 'Daily revenue aggregated directly from closed sales transactions',
  totalAmount = null,
  data = null,
  currency = 'KSh',
  accentColor = 'sky', // 'sky' | 'emerald' | 'purple' | 'amber'
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fallback data if not provided
  const chartData = useMemo(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return generateDefault30DayData(50);
  }, [data]);

  // Calculate total if not explicitly provided
  const calculatedTotal = useMemo(() => {
    if (totalAmount !== null && totalAmount !== undefined) return totalAmount;
    return chartData.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
  }, [totalAmount, chartData]);

  // Y-axis max tick calculation
  const maxVal = useMemo(() => {
    const maxData = Math.max(...chartData.map((d) => Number(d.revenue) || 0), 10);
    return Math.ceil(maxData * 1.1); // Add 10% headroom
  }, [chartData]);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const marginTop = 20;
  const marginBottom = 35;
  const marginLeft = 65;
  const marginRight = 25;

  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  // 5 Y-Ticks
  const yTicks = useMemo(() => {
    return [
      maxVal,
      Math.round(maxVal * 0.75),
      Math.round(maxVal * 0.50),
      Math.round(maxVal * 0.25),
      0,
    ];
  }, [maxVal]);

  // Coordinate mapping
  const points = useMemo(() => {
    const count = chartData.length;
    return chartData.map((item, index) => {
      const x = marginLeft + (index / (count - 1)) * plotWidth;
      const rev = Number(item.revenue) || 0;
      const y = marginTop + plotHeight - (rev / maxVal) * plotHeight;
      return { ...item, x, y, index };
    });
  }, [chartData, maxVal, marginLeft, marginTop, plotWidth, plotHeight]);

  // SVG Line Path
  const linePathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, point, idx) => {
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }, '');
  }, [points]);

  // SVG Closed Area Path for Gradient
  const areaPathD = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    const bottomY = (marginTop + plotHeight).toFixed(1);
    return `${linePathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePathD, points, marginTop, plotHeight]);

  // X-axis label ticks (sampled across 30 days, e.g. every 4-5 days)
  const xLabels = useMemo(() => {
    const sampleIndices = [0, 5, 10, 15, 20, 25, chartData.length - 1];
    return sampleIndices
      .filter((idx) => idx < points.length)
      .map((idx) => points[idx]);
  }, [points, chartData.length]);

  // Color classes map based on accentColor
  const strokeColor = accentColor === 'emerald' ? '#10b981' : accentColor === 'purple' ? '#a855f7' : '#38bdf8';
  const strokeClass = accentColor === 'emerald' ? 'stroke-emerald-400' : accentColor === 'purple' ? 'stroke-purple-400' : 'stroke-sky-400';
  const fillGradientId = `revenueGradient-${title.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800 pb-3">
        <div>
          <div className="flex items-center space-x-2 text-white font-extrabold text-sm sm:text-base tracking-tight">
            <TrendingUp className={`w-4 h-4 ${accentColor === 'emerald' ? 'text-emerald-400' : accentColor === 'purple' ? 'text-purple-400' : 'text-sky-400'}`} />
            <span>{title}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block sm:inline mr-1">Total:</span>
          <span className="text-sm sm:text-base font-black text-white font-mono">
            {formatAmount(calculatedTotal, currency)}
          </span>
        </div>
      </div>

      {/* SVG Line Graph Container */}
      <div className="relative w-full overflow-hidden bg-navy-950/60 rounded-xl p-2 border border-navy-800/80">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((tickVal, i) => {
            const yPos = marginTop + (i / 4) * plotHeight;
            return (
              <g key={i}>
                <line
                  x1={marginLeft}
                  y1={yPos}
                  x2={svgWidth - marginRight}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={marginLeft - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[10px]"
                >
                  {formatTickLabel(tickVal, currency)}
                </text>
              </g>
            );
          })}

          {/* Gradient Fill under Line */}
          <path d={areaPathD} fill={`url(#${fillGradientId})`} />

          {/* Primary Trend Line */}
          <path
            d={linePathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points (Circles) */}
          {points.map((pt) => {
            const isHovered = hoveredPoint?.index === pt.index;
            const isPeak = pt.revenue === maxVal && pt.revenue > 0;

            return (
              <g key={pt.index}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : isPeak ? 5 : 3.5}
                  className={`${strokeClass} fill-navy-950 transition-all duration-150 cursor-pointer`}
                  strokeWidth={isHovered || isPeak ? '2.5' : '1.5'}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* X-Axis Dates */}
          {xLabels.map((lbl, idx) => (
            <text
              key={idx}
              x={lbl.x}
              y={svgHeight - 10}
              textAnchor="middle"
              className="fill-slate-400 font-mono text-[10px]"
            >
              {lbl.date}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-10 bg-navy-900 border border-emerald-500/40 text-white rounded-lg px-2.5 py-1.5 text-[11px] shadow-2xl pointer-events-none font-mono flex flex-col -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${(hoveredPoint.y / svgHeight) * 100}%`,
            }}
          >
            <span className="text-slate-400 text-[10px]">{hoveredPoint.fullDate || hoveredPoint.date}</span>
            <span className="font-bold text-emerald-400">
              {formatAmount(hoveredPoint.revenue, currency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
