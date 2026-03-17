// sections/team.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/@Types";

// Placeholder images for diverse team members
const imgs = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
];

const teamData = [
  { id: "1", name: "Amber Grace W.", role: "Vice President of Sales", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.", image: imgs[4], socials: { twitter: "#", linkedin: "#" } },
  { id: "2", name: "David Knoxville", role: "Lead Developer", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.", image: imgs[5], socials: { github: "#", linkedin: "#" } },
  { id: "3", name: "Chasity Jones", role: "Founder", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.", image: imgs[0], socials: { twitter: "#", linkedin: "#" } },
  { id: "4", name: "Chris Ericson", role: "Design Ninja", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.", image: imgs[1], socials: { dribbble: "#" } },
  { id: "5", name: "Alex Smith", role: "Creative Leader", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.", image: imgs[1], socials: { twitter: "#", linkedin: "#" } },
  { id: "6", name: "May Brown", role: "Sales Manager", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.", image: imgs[2], socials: { twitter: "#", linkedin: "#" } },
  { id: "7", name: "Mike Cannon", role: "Co-Founder & Co-CEO", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", image: imgs[3] },
  { id: "8", name: "Erika Fisher", role: "Chief Administrative Officer", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", image: imgs[0] }
];

export const teamSections: SectionTemplate[] = [
  // Originally existed
  {
    id: "team-grid",
    name: "Team Grid",
    category: "Team",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary);text-align:center">
      <div style="font-size:9px;font-weight:700;color:var(--text);margin-bottom:8px">Meet the Team</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
        ${[1, 2, 3].map(() => `<div style="background:var(--surface);border-radius:4px;padding:6px;border:1px solid var(--border)">
          <div style="width:18px;height:18px;border-radius:50%;background:var(--primary);margin:0 auto 4px"></div>
          <div style="font-size:6px;font-weight:600;color:var(--text)">Jane Doe</div>
          <div style="font-size:5px;color:var(--text-muted)">Designer</div>
        </div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
      root.props.childBlocks = [
        makeBlock("team", {
          title: "Meet the Team", subtitle: "The talented people behind the scenes.", bgColor: "transparent",
          layout: "grid", columns: 3, imageStyle: "circle", imageSize: "160px", cardStyle: "raised", align: "center",
          members: [teamData[0], teamData[1], teamData[2], teamData[3], teamData[4], teamData[5]]
        }),
      ];
      return root;
    },
  },
  // Originally existed
  {
    id: "team-cards",
    name: "Team Cards",
    category: "Team",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary)">
      <div style="font-size:9px;font-weight:700;color:var(--text);margin-bottom:8px;text-align:center">Our Team</div>
      <div style="display:flex;gap:6px">
        ${[1, 2].map(() => `<div style="flex:1;background:var(--surface);border-radius:6px;padding:8px;border:1px solid var(--border)">
          <div style="width:100%;height:28px;background:var(--bg);border-radius:4px;margin-bottom:4px"></div>
          <div style="font-size:7px;font-weight:600;color:var(--text)">Alex Kim</div>
          <div style="font-size:6px;color:var(--text-muted)">Engineering Lead</div>
        </div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
      root.props.childBlocks = [
        makeBlock("team", {
          title: "Our Team", subtitle: "Leading the industry forward.", bgColor: "transparent",
          layout: "grid", columns: 2, imageStyle: "square", imageSize: "100%", imageRadius: "12px", cardStyle: "raised", align: "left",
          members: [teamData[4], teamData[5]]
        }),
      ];
      return root;
    },
  },
  // New Layouts from Screenshots
  {
    id: "team-elegant-cards",
    name: "Elegant Cards (Circle Head)",
    category: "Team",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary);text-align:center">
      <div style="font-size:9px;font-weight:700;color:var(--text);margin-bottom:12px">Meet Our Team</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        ${[1, 2].map(() => `<div style="background:var(--surface);border-radius:4px;padding:12px 6px 6px;border:1px solid var(--border);position:relative">
          <div style="width:18px;height:18px;border-radius:50%;background:var(--primary);position:absolute;top:-9px;left:50%;transform:translateX(-50%)"></div>
          <div style="font-size:6px;font-weight:600;color:var(--text);margin-bottom:2px">Alex Smith</div>
          <div style="font-size:5px;color:var(--text-muted)">Creative Leader</div>
        </div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#e2e8f0", padding: "6rem 2rem" });
      root.props.childBlocks = [
        makeBlock("team", {
          title: "Meet Our Team", subtitle: "", bgColor: "transparent",
          layout: "grid", columns: 4, gap: "1.5rem",
          cardStyle: "raised", cardBg: "#ffffff", cardRadius: "12px",
          imageStyle: "float", imageSize: "110px", imageRadius: "50%",
          align: "center", nameColor: "#1e293b", roleColor: "#0f172a", descColor: "#64748b",
          members: [teamData[4], teamData[5], { ...teamData[0], name: "Ann Richmond", role: "Web Developer" }, { ...teamData[1], name: "Roxie Swanson", role: "Web Designer" }]
        }),
      ];
      return root;
    },
  },
  {
    id: "team-colorful-blocks",
    name: "Colorful Block Portraits",
    category: "Team",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary);text-align:center">
      <div style="font-size:9px;font-weight:700;color:var(--text);margin-bottom:8px">Our leadership team</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
        ${["#eab308", "#22c55e", "#ef4444"].map((c) => `<div>
          <div style="width:100%;height:32px;background:${c};margin-bottom:4px"></div>
          <div style="font-size:6px;font-weight:600;text-align:left;color:var(--text)">Mike Cannon</div>
        </div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#ffffff", padding: "5rem 2rem" });
      root.props.childBlocks = [
        makeBlock("team", {
          title: "Our leadership team", subtitle: "With over 100 years of combined experience, we've got a well-seasoned team at the helm.",
          bgColor: "transparent", layout: "grid", columns: 3, gap: "3rem",
          cardStyle: "raised", align: "left",
          imageStyle: "square", imageSize: "100%", imageRadius: "0px",
          members: [teamData[6], teamData[7], teamData[1], teamData[2], teamData[3], teamData[0]]
        }),
      ];
      return root;
    },
  },
  {
    id: "team-dark-gradient",
    name: "Dark Gradient Posters",
    category: "Team",
    preview: `<div style="font-family:sans-serif;padding:12px;background:#f8fafc;text-align:center">
      <div style="font-size:6px;color:#e11d48;font-weight:700;letter-spacing:1px;margin-bottom:4px">WHO MADE IT</div>
      <div style="font-size:10px;font-weight:900;color:#1e1b4b;margin-bottom:12px;text-transform:uppercase">MEET THE TEAM</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        ${[1, 2, 3].map(() => `<div style="border-radius:6px;height:45px;background:linear-gradient(to top, #e11d48, #cbd5e1);display:flex;align-items:flex-end;padding:4px"><div style="color:white;font-size:5px;font-weight:700">Chasity Jones</div></div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f4f6ff", padding: "6rem 2rem" });
      root.props.childBlocks = [
        makeBlock("text", { tag: "h4", content: "WHO MADE IT", align: "center", color: "#e11d48", fontSize: "0.85rem", letterSpacing: "2px", bold: true, marginBottom: "0.5rem" }),
        makeBlock("team", {
          title: "MEET THE TEAM", subtitle: "", bgColor: "transparent",
          layout: "grid", columns: 3, gap: "1.5rem",
          cardStyle: "raised", align: "center", cardHeight: "450px",
          imageStyle: "cover", imageSize: "400px", imageRadius: "24px",
          coverGradientBottom: "#e11d48f2", // pinkish hex
          nameColor: "#ffffff", roleColor: "#cccccc", descColor: "#e2e8f0",
          members: [teamData[2], teamData[1], teamData[3]]
        }),
      ];
      return root;
    },
  },
  {
    id: "team-horizontal",
    name: "Alternating Horizontal Cards",
    category: "Team",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary)">
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;background:#eab308;padding:6px;border-radius:4px;gap:6px;align-items:center">
          <div style="flex:1;"><div style="font-size:6px;font-weight:700;color:var(--bg)">AMBER GRACE W.</div></div>
          <div style="width:20px;height:20px;border-radius:50%;background:var(--surface);flex-shrink:0"></div>
        </div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "4rem 2rem" });
      root.props.childBlocks = [
        makeBlock("team", {
          title: "MEET OUR TEAM", subtitle: "", bgColor: "transparent",
          layout: "list", columns: 1, gap: "1rem",
          cardStyle: "filled", align: "left", cardRadius: "0px", cardBg: "#f59e0b",
          imageStyle: "circle", imageSize: "180px", imageRadius: "50%",
          nameColor: "#ffffff", roleColor: "#f1f5f9", descColor: "#e2e8f0",
          members: [
            { ...teamData[0], description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud" },
            { ...teamData[0], description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud" },
            { ...teamData[0], description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud" }
          ]
        }),
      ];
      return root;
    },
  },
];

