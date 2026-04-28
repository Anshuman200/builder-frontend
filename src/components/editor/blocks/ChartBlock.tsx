"use client";
import React from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { PreviewContext, BlockProps, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";
import { DEFAULT_THEME } from "@/lib/utils/theme";

const LegendComponent = Legend as any;

export const CHART_COLORS = [
  "var(--primary, #6366f1)",
  "var(--accent, #f43f5e)",
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export function ChartBlock({ block }: BlockProps) {
  const p = block.props as Record<string, unknown>;
  const isPreview = React.useContext(PreviewContext);
  const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;

  const bgStyles = getBackgroundStyles(p, theme);
  const chartType = (p.chartType as string) || "area";
  const data = (p.data as Record<string, unknown>[]) || [];
  const height = (p.height as string) || "350px";
  const color = (p.color as string) || "var(--primary)";
  const secondaryColor = (p.secondaryColor as string) || "var(--accent)";

  const showGrid = p.showGrid !== false;
  const showXAxis = p.showXAxis !== false;
  const showYAxis = p.showYAxis !== false;
  const showTooltip = p.showTooltip !== false;
  const showLegend = p.showLegend !== false; // Enable by default
  const curve = (p.curve as "basis" | "linear" | "natural" | "monotoneX" | "step") || "monotoneX";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-2xl rounded-xl p-4 min-w-[120px] animate-in fade-in zoom-in duration-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill || color }} />
              <p className="text-sm font-bold text-slate-900">
                {entry.name}: <span className="ml-1 font-black">{entry.value.toLocaleString()}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />}
            {showXAxis && <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} dy={10} />}
            {showYAxis && <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />}
            {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--primary)", strokeWidth: 2, strokeDasharray: "4 4" }} />}
            {showLegend && (
              <LegendComponent
                verticalAlign="top"
                align="right"
                content={(props: any) => (
                  <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    {data.map((entry: any, index: number) => (
                      <div key={`legend-${index}`} className="flex items-center gap-2 group cursor-default">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform group-hover:scale-125" 
                          style={{ backgroundColor: entry.fill || CHART_COLORS[index % CHART_COLORS.length] }} 
                        />
                        <span className="text-xs font-semibold text-slate-600 transition-colors group-hover:text-slate-900">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            )}
            <Area type={curve} dataKey="value" stroke={color} fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} animationDuration={1200} />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />}
            {showXAxis && <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} dy={10} />}
            {showYAxis && <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />}
            {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />}
            {showLegend && (
              <LegendComponent
                verticalAlign="top"
                align="right"
                content={(props: any) => (
                  <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    {data.map((entry: any, index: number) => (
                      <div key={`legend-${index}`} className="flex items-center gap-2 group cursor-default">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform group-hover:scale-125" 
                          style={{ backgroundColor: entry.fill || CHART_COLORS[index % CHART_COLORS.length] }} 
                        />
                        <span className="text-xs font-semibold text-slate-600 transition-colors group-hover:text-slate-900">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            )}
            <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} animationDuration={1200}>
              {data.map((entry: any, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />}
            {showXAxis && <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} dy={10} />}
            {showYAxis && <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />}
            {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--primary)", strokeWidth: 2, strokeDasharray: "4 4" }} />}
            {showLegend && (
              <LegendComponent
                verticalAlign="top"
                align="right"
                content={(props: any) => (
                  <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    {data.map((entry: any, index: number) => (
                      <div key={`legend-${index}`} className="flex items-center gap-2 group cursor-default">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform group-hover:scale-125" 
                          style={{ backgroundColor: entry.fill || CHART_COLORS[index % CHART_COLORS.length] }} 
                        />
                        <span className="text-xs font-semibold text-slate-600 transition-colors group-hover:text-slate-900">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            )}
            <Line type={curve} dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 6, fill: color, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1200} />
          </LineChart>
        );
      case "pie":
      case "donut":
        const isDonut = chartType === "donut";
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isDonut ? "70%" : 0}
              outerRadius="90%"
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
              startAngle={90}
              endAngle={-270}
              animationDuration={1500}
              strokeWidth={0}
            >
              {data.map((entry: any, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && (
              <LegendComponent
                verticalAlign="bottom"
                align="center"
                content={(props: any) => (
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {data.map((entry: any, index: number) => (
                      <div key={`legend-${index}`} className="flex items-center gap-2 group cursor-default">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform group-hover:scale-125" 
                          style={{ backgroundColor: entry.fill || CHART_COLORS[index % CHART_COLORS.length] }} 
                        />
                        <span className="text-xs font-semibold text-slate-600 transition-colors group-hover:text-slate-900">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            )}
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "w-full relative overflow-hidden",
        !isPreview && "p-4"
      )}
      style={{
        ...bgStyles,
        color: (() => {
          const tc = (p.textColor as string) || "var(--text)";
          if ((theme?.mode as string) === "dark" && (tc === "#000000" || tc === "#000" || tc === "#0f172a")) {
            return "var(--text)";
          }
          return tc;
        })(),
        borderRadius: p.borderRadius as string || "0px",
        padding: p.padding as string || "2rem"
      }}
    >
      <BackgroundOverlay p={p} />
      <div style={{ position: "relative", zIndex: 2 }}>
        {!!(p.title || p.subtitle) && (
          <div className="mb-8 select-none">
            {!!p.title && (
              <h3 className="text-2xl font-black tracking-tight mb-1">
                {p.title as string}
              </h3>
            )}
            {!!p.subtitle && (
              <p className="text-sm font-medium opacity-60">
                {p.subtitle as string}
              </p>
            )}
          </div>
        )}
        <div style={{ height, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
