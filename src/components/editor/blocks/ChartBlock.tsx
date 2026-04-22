"use client";
import React from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { PreviewContext, BlockProps } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

export function ChartBlock({ block }: BlockProps) {
  const p = block.props as any;
  const isPreview = React.useContext(PreviewContext);
  const theme = useEditorStore((s) => s.page?.theme);

  const chartType = (p.chartType as string) || "area";
  const data = (p.data as any[]) || [];
  const height = (p.height as string) || "300px";
  const color = (p.color as string) || "var(--primary)";
  const secondaryColor = (p.secondaryColor as string) || "var(--accent)";

  const showGrid = p.showGrid !== false;
  const showXAxis = p.showXAxis !== false;
  const showYAxis = p.showYAxis !== false;
  const showTooltip = p.showTooltip !== false;
  const showLegend = p.showLegend === true;
  const curve = (p.curve as "smooth" | "step" | "linear") || "smooth";
  const textColor = (p.textColor as string) || "var(--text)";

  const renderChart = () => {
    switch (chartType) {
      case "area":
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${block.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />}
            {showXAxis && <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />}
            {showYAxis && <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />}
            {showTooltip && <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
              itemStyle={{ color: "var(--text)", fontWeight: 700 }}
              labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
            />}
            <Area
              type={curve === "smooth" ? "monotone" : curve}
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#gradient-${block.id})`}
              animationDuration={1500}
            />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />}
            {showXAxis && <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />}
            {showYAxis && <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />}
            {showTooltip && <Tooltip
              cursor={{ fill: "var(--surface)", opacity: 0.4 }}
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
            />}
            <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} animationDuration={1500} />
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />}
            {showXAxis && <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />}
            {showYAxis && <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />}
            {showTooltip && <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }} />}
            <Line
              type={curve === "smooth" ? "monotone" : curve}
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "var(--bg)" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
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
              innerRadius={isDonut ? "60%" : 0}
              outerRadius="80%"
              paddingAngle={5}
              dataKey="value"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? color : index === 1 ? secondaryColor : `var(--text-subtle)`} stroke="none" />
              ))}
            </Pie>
            {showTooltip && <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }} />}
            {showLegend && <Legend verticalAlign="bottom" height={36} />}
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "w-full",
        !isPreview && "p-4"
      )}
      style={{
        backgroundColor: p.bgColor as string || "transparent",
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
      {(p.title || p.subtitle) && (
        <div className="mb-8 select-none">
          {p.title && (
            <h3 className="text-2xl font-black tracking-tight mb-1">
              {p.title as string}
            </h3>
          )}
          {p.subtitle && (
            <p className="text-sm font-medium opacity-60">
              {p.subtitle as string}
            </p>
          )}
        </div>
      )}
      <div style={{ height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() as any}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
