import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

const DEFAULT_LINE_DATA = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 300 },
  { name: "Wed", value: 600 },
  { name: "Thu", value: 800 },
  { name: "Fri", value: 500 },
  { name: "Sat", value: 900 },
  { name: "Sun", value: 700 },
];

const DEFAULT_PIE_DATA = [
  { name: "Electronics", value: 400 },
  { name: "Clothing", value: 300 },
  { name: "Groceries", value: 300 },
  { name: "Beauty", value: 200 },
  { name: "Sports", value: 100 },
  { name: "Other", value: 50 },
];

export const chartSections: SectionTemplate[] = [
  {
    id: "chart-area",
    name: "Area Chart",
    category: "Chart",
    previewImage: "/previews/chart/area.png",
    create: () => makeBlock("chart", { chartType: "area", data: DEFAULT_LINE_DATA, height: "350px", title: "Monthly Growth", subtitle: "User activity trends over time" })
  },
  {
    id: "chart-bar",
    name: "Bar Chart",
    category: "Chart",
    previewImage: "/previews/chart/bar.png",
    create: () => makeBlock("chart", { chartType: "bar", data: DEFAULT_LINE_DATA, height: "350px", title: "Revenue Analysis", subtitle: "Weekly performance breakdown" })
  },
  {
    id: "chart-line",
    name: "Line Chart",
    category: "Chart",
    previewImage: "/previews/chart/line.png",
    create: () => makeBlock("chart", { chartType: "line", data: DEFAULT_LINE_DATA, height: "350px", title: "Active Users", subtitle: "Real-time traffic statistics" })
  },
  {
    id: "chart-pie",
    name: "Pie Chart",
    category: "Chart",
    previewImage: "/previews/chart/pie.png",
    create: () => makeBlock("chart", { chartType: "pie", data: DEFAULT_PIE_DATA, height: "350px", title: "Category Distribution", subtitle: "Sales breakdown by product type" })
  },
  {
    id: "chart-donut",
    name: "Donut Chart",
    category: "Chart",
    previewImage: "/previews/chart/donut.png",
    create: () => makeBlock("chart", { chartType: "donut", data: DEFAULT_PIE_DATA, height: "350px", title: "Market Share", subtitle: "Dominance across various segments" })
  }
];
