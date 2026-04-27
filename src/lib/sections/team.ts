// sections/team.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

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
    previewImage: "/previews/team/team-grid.png",
    preview: `<div style="font-family:'Inter',sans-serif;padding:80px;background:#f8fafc;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;width:100%;box-sizing:border-box">
      <div style="font-size:48px;font-weight:900;color:#0f172a;margin-bottom:40px;letter-spacing:-0.02em">Meet the Team</div>
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:32px;width:100%;max-width:1000px">
        ${[1, 2, 3].map(() => `<div style="background:#ffffff;border-radius:24px;padding:40px;border:1px solid #e2e8f0;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.03)">
          <div style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg, #6366f1, #a78bfa);margin:0 auto 24px;box-shadow:0 8px 16px rgba(99,102,241,0.2)"></div>
          <div style="font-size:24px;font-weight:800;color:#0f172a;margin-bottom:8px">Jane Doe</div>
          <div style="font-size:16px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:1px">Lead Designer</div>
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
    previewImage: "/previews/team/team-cards.png",
    preview: `<div style="font-family:'Inter',sans-serif;padding:80px;background:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;width:100%;box-sizing:border-box">
      <div style="font-size:52px;font-weight:900;color:#0f172a;margin-bottom:48px;letter-spacing:-0.03em">Our World-Class Team</div>
      <div style="display:flex;gap:40px;width:100%;max-width:1100px">
        ${[1, 2].map(() => `<div style="flex:1;background:#f8fafc;border-radius:32px;padding:16px;border:1px solid #e2e8f0;transition:transform 0.3s ease">
          <div style="width:100%;height:320px;background:#e2e8f0;border-radius:24px;margin-bottom:24px;background-image:linear-gradient(45deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)"></div>
          <div style="padding:0 16px 16px">
            <div style="font-size:28px;font-weight:800;color:#0f172a;margin-bottom:4px">Alex Kim</div>
            <div style="font-size:18px;color:#64748b;font-weight:500">Engineering Director</div>
          </div>
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
    previewImage: "/previews/team/team-elegant.png",
    preview: `<div style="font-family:'Inter',sans-serif;padding:80px;background:#f1f5f9;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;width:100%;box-sizing:border-box">
      <div style="font-size:44px;font-weight:900;color:#1e293b;margin-bottom:60px;text-transform:uppercase;letter-spacing:2px">Meet Our Leadership</div>
      <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:40px;width:100%;max-width:900px">
        ${[1, 2].map(() => `<div style="background:#ffffff;border-radius:24px;padding:60px 40px 40px;border:1px solid #e2e8f0;position:relative;box-shadow:0 20px 40px rgba(0,0,0,0.04)">
          <div style="width:110px;height:110px;border-radius:50%;background:#6366f1;position:absolute;top:-55px;left:50%;transform:translateX(-50%);border:8px solid #f1f5f9;box-shadow:0 10px 20px rgba(99,102,241,0.2)"></div>
          <div style="font-size:26px;font-weight:800;color:#0f172a;margin-bottom:8px;text-align:center">Sarah Wilson</div>
          <div style="font-size:16px;color:#64748b;text-align:center;font-weight:500">Chief Executive Officer</div>
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
    previewImage: "/previews/team/team-colorful.png",
    preview: `<div style="font-family:'Inter',sans-serif;padding:80px;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;width:100%;box-sizing:border-box">
      <div style="font-size:48px;font-weight:900;color:#ffffff;margin-bottom:48px;letter-spacing:-0.02em">The Minds Behind Pro</div>
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:24px;width:100%;max-width:1100px">
        ${["#eab308", "#22c55e", "#ef4444"].map((c) => `<div style="position:relative;overflow:hidden;border-radius:16px">
          <div style="width:100%;height:380px;background:${c};transition:transform 0.5s ease"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:24px;background:linear-gradient(transparent, rgba(0,0,0,0.8))">
            <div style="font-size:22px;font-weight:700;color:#ffffff">Mike Cannon</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.7)">Product Lead</div>
          </div>
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
    previewImage: "/previews/team/team-red-gradient.png",
    preview: `<div style="font-family:'Inter',sans-serif;padding:80px;background:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;width:100%;box-sizing:border-box">
      <div style="font-size:16px;color:#e11d48;font-weight:800;letter-spacing:4px;margin-bottom:16px">CRAFTED WITH PASSION</div>
      <div style="font-size:60px;font-weight:900;color:#1e1b4b;margin-bottom:60px;letter-spacing:-0.04em">MEET THE EXPERTS</div>
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:32px;width:100%;max-width:1200px">
        ${[1, 2, 3].map(() => `<div style="border-radius:32px;height:450px;background:linear-gradient(to top, #e11d48, #cbd5e1);display:flex;flex-direction:column;justify-content:flex-end;padding:40px;box-shadow:0 30px 60px rgba(225,29,72,0.15)">
          <div style="color:white;font-size:28px;font-weight:900;margin-bottom:8px">Chasity Jones</div>
          <div style="color:rgba(255,255,255,0.8);font-size:18px;font-weight:600">Founder & CEO</div>
        </div>`).join("")}
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
    previewImage: "/previews/team/team-alternating.png",
    preview: `<div style="font-family:'Inter',sans-serif;padding:80px;background:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;width:100%;box-sizing:border-box">
      <div style="font-size:32px;font-weight:800;color:#0f172a;margin-bottom:40px;align-self:flex-start">MEET OUR TEAM</div>
      <div style="display:flex;flex-direction:column;gap:16px;width:100%;max-width:1000px">
        <div style="display:flex;background:#0f172a;padding:32px;border-radius:16px;gap:32px;align-items:center;">
          <div style="width:120px;height:120px;border-radius:50%;background:#e2e8f0;flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:4px">AMBER GRACE W.</div>
            <div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:8px">VICE PRESIDENT OF SALES</div>
            <div style="font-size:14px;color:#e2e8f0;line-height:1.5">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
          </div>
        </div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#ffffff", padding: "4rem 2rem" });
      root.props.childBlocks = [
        makeBlock("team", {
          title: "MEET OUR TEAM", subtitle: "", bgColor: "transparent",
          layout: "list", columns: 1, gap: "1.5rem",
          cardStyle: "filled", align: "left", cardRadius: "16px", cardBg: "#0f172a",
          imageStyle: "circle", imageSize: "160px", 
          nameColor: "#ffffff", roleColor: "#94a3b8", descColor: "#cbd5e1",
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

