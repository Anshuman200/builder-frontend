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
    create: () => {
      return makeBlock("team", {
        title: "Meet the Team", subtitle: "The talented people behind the scenes.",
        bgColor: "#f8fafc", padding: "5rem 2rem",
        layout: "grid", columns: 3, imageStyle: "circle", imageSize: "160px", cardStyle: "raised", align: "center",
        members: [teamData[0], teamData[1], teamData[2], teamData[3], teamData[4], teamData[5]]
      });
    },
  },
  // Originally existed
  {
    id: "team-cards",
    name: "Team Cards",
    category: "Team",
    previewImage: "/previews/team/team-cards.png",
    create: () => {
      return makeBlock("team", {
        title: "Our Team", subtitle: "Leading the industry forward.",
        bgColor: "#f8fafc", padding: "5rem 2rem",
        layout: "grid", columns: 2, imageStyle: "square", imageSize: "100%", imageRadius: "12px", cardStyle: "raised", align: "left",
        members: [teamData[4], teamData[5]]
      });
    },
  },
  // New Layouts from Screenshots
  {
    id: "team-elegant-cards",
    name: "Elegant Cards (Circle Head)",
    category: "Team",
    previewImage: "/previews/team/team-elegant.png",
    create: () => {
      return makeBlock("team", {
        title: "Meet Our Team", subtitle: "",
        bgColor: "#e2e8f0", padding: "6rem 2rem",
        layout: "grid", columns: 4, gap: "1.5rem",
        cardStyle: "raised", cardBg: "#ffffff", cardRadius: "12px",
        imageStyle: "float", imageSize: "110px", imageRadius: "50%",
        align: "center", nameColor: "#1e293b", roleColor: "#0f172a", descColor: "#64748b",
        members: [teamData[4], teamData[5], { ...teamData[0], name: "Ann Richmond", role: "Web Developer" }, { ...teamData[1], name: "Roxie Swanson", role: "Web Designer" }]
      });
    },
  },
  {
    id: "team-colorful-blocks",
    name: "Colorful Block Portraits",
    category: "Team",
    previewImage: "/previews/team/team-colorful.png",
    create: () => {
      return makeBlock("team", {
        title: "Our leadership team", subtitle: "With over 100 years of combined experience, we've got a well-seasoned team at the helm.",
        bgColor: "#ffffff", padding: "5rem 2rem",
        layout: "grid", columns: 3, gap: "3rem",
        cardStyle: "raised", align: "left",
        imageStyle: "square", imageSize: "100%", imageRadius: "0px",
        members: [teamData[6], teamData[7], teamData[1], teamData[2], teamData[3], teamData[0]]
      });
    },
  },
  {
    id: "team-dark-gradient",
    name: "Dark Gradient Posters",
    category: "Team",
    previewImage: "/previews/team/team-red-gradient.png",
    create: () => {
      return makeBlock("team", {
        title: "MEET THE TEAM", subtitle: "", bgColor: "transparent",
        layout: "grid", columns: 3, gap: "1.5rem",
        cardStyle: "raised", align: "center", cardHeight: "450px",
        imageStyle: "cover", imageSize: "400px", imageRadius: "24px",
        coverGradientBottom: "#e11d48f2", // pinkish hex
        nameColor: "#ffffff", roleColor: "#cccccc", descColor: "#e2e8f0",
        members: [teamData[2], teamData[1], teamData[3]]
      });
    },
  },
  {
    id: "team-horizontal",
    name: "Alternating Horizontal Cards",
    category: "Team",
    previewImage: "/previews/team/team-alternating.png",
    create: () => {
      return makeBlock("team", {
        title: "MEET OUR TEAM", subtitle: "",
        bgColor: "#ffffff", padding: "4rem 2rem",
        layout: "list", columns: 1, gap: "1.5rem",
        cardStyle: "filled", align: "left", cardRadius: "16px", cardBg: "#0f172a",
        imageStyle: "circle", imageSize: "160px",
        nameColor: "#ffffff", roleColor: "#94a3b8", descColor: "#cbd5e1",
        members: [
          { ...teamData[0], description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud" },
          { ...teamData[0], description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud" },
          { ...teamData[0], description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud" }
        ]
      });
    },
  },
];

