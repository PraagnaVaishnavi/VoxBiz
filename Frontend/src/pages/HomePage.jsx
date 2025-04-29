"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThreeDMarquee } from "../components/ui/3DMarquee";

export function ThreeDMarqueeBg() {
  const navigate = useNavigate(); 
  const images = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcZmTeq0HUkRzFVFLec8ZtDD5sKWu53YQTfA&s",
    "https://images.squarespace-cdn.com/content/v1/55b6a6dce4b089e11621d3ed/1438044607549-3JN33PGPNPAHNW46B8XH/image-asset.gif",
    "https://thumbs.dreamstime.com/b/data-visualization-graphs-beautiful-illustration-picture-generative-ai-data-visualization-graphs-beautiful-illustration-277721327.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOcHGm259_gokvC5kmNjcku8Py0zO7JbOmpg&s",
    "https://blogs.sas.com/content/sastraining/files/2014/09/big_bang_theory.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz4hYL54pQZJSCgksKYzzPWBzGZdFSsipih2QDhyeHwXMOdYDJkcKR14nLy1u0QrAyWHw&usqp=CAU",
    "https://blogs.sas.com/content/graphicallyspeaking/files/2019/11/mortgage5b.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLrViFM9X5J5KrbEgP1dkqSGYBT9LAVhBHapa5wkzol3ntWQwXVUUCPLJ40L_UJSifJwE&usqp=CAU",
    "https://png.pngtree.com/background/20210715/original/pngtree-beautiful-digital-data-transfer-through-dotted-lines-with-nubers-in-black-picture-image_1257401.jpg",
    "https://img.freepik.com/premium-vector/statistic-data-analysis-visualization-background_115973-29.jpg",
    "https://img.freepik.com/premium-vector/data-visualization-background_23-2151946700.jpg?w=360",
    "https://img.freepik.com/premium-vector/data-visualization-background_23-2151946695.jpg",
    "https://img.freepik.com/premium-photo/abstract-data-visualization-with-charts_1333858-317.jpg",
    "https://img.freepik.com/premium-photo/abstract-business-data-visualization-with-line-bar-graphs_717577-13264.jpg",
    "https://miro.medium.com/v2/resize:fit:3120/1*6XAf0oi88MRCBbCd_cHcew.png",
    "https://www.boldbi.com/wp-content/uploads/2019/07/data-visualization-importance-featured.webp",
    "https://media.licdn.com/dms/image/v2/D5612AQEdkUVbcAAEIQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1683373256101?e=2147483647&v=beta&t=piVzGuo-TLgPRwJRAozHmNJvfG9Gm5ywxYZ8AN9bU2k",
    "https://www.shutterstock.com/image-photo/3d-statistics-isolated-white-background-600nw-2469272241.jpg",
    "https://c8.alamy.com/comp/2G3W9KH/analytics-low-poly-design-statistical-data-analysis-profit-diagram-polygonal-vector-illustrations-on-a-blue-background-2G3W9KH.jpg",
    "https://assets.everspringpartners.com/dims4/default/e63ffb2/2147483647/strip/true/crop/1518x612+0+0/resize/800x323!/quality/90/?url=http%3A%2F%2Feverspring-brightspot.s3.us-east-1.amazonaws.com%2Fb0%2F7e%2F74ed21084c41b6e6f15de2d6444d%2Fmsfa-dataanalysis-vis-techniques.jpg",
    "https://t4.ftcdn.net/jpg/09/95/03/13/360_F_995031304_hxJxdBwdua8ufqR8d4yDIJsuybNWA07k.jpg",
    "https://t3.ftcdn.net/jpg/09/86/31/74/360_F_986317407_1vi6a2XYYpRza5edEsetBQi8nF8T3kXV.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE6QU9VnwyT0u99MOCLMpbeFvxzba1gzYAapESMXHI0CZD-y3ymoWZZ7a7qPsrdKWS9Y0&usqp=CAU",
    "https://media.istockphoto.com/id/850583632/vector/data-pattern-background.jpg?b=1&s=612x612&w=0&k=20&c=UeW_VLc-u4WpxHpfxTUOI1MillEIY622u8Y-YDCfM6k=",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9WR3ImlYhla_O2p0W4wSoYJn-hNTQFMmV7g&s",
    "https://www.shutterstock.com/shutterstock/photos/2258134001/display_1500/stock-photo-relational-database-tables-on-databases-are-placed-on-structured-query-language-code-with-server-2258134001.jpg",
    "https://png.pngtree.com/thumb_back/fh260/background/20230611/pngtree-sql-development-language-as-a-coding-concept-sql-photo-image_3043068.jpg",
    "https://static.vecteezy.com/system/resources/thumbnails/008/300/431/small_2x/sql-or-structured-query-language-code-on-computer-monitor-and-server-room-background-example-of-sql-code-to-query-data-from-a-database-photo.jpg",
    "https://www.shutterstock.com/image-photo/user-can-check-data-storage-260nw-2287992327.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROSvnsPKRmTn_SKx6jMZ7pvQIHT-IxQoC-vw&s",
    "https://assets.aceternity.com/world-map.webp",
  ];

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-7xl px-4 py-16">
        <h2 className="mx-auto max-w-4xl text-center text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Revolutionize Your Business Insights with{" "}
          <span className="relative inline-block rounded-xl bg-blue-500/40 px-4 py-1 text-white underline decoration-sky-500 decoration-4 underline-offset-8 backdrop-blur-sm">
            VoxBiz
          </span>
        </h2>
        <p className="mx-auto max-w-2xl py-8 text-center text-base text-neutral-200 lg:text-lg">
          Transform your data into actionable insights using voice-driven queries.
          Experience real-time analytics and data visualization that empower you to
          make smarter, data-informed decisions.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            className="rounded-md bg-sky-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
            onClick={() => navigate('/vox')} 
          >
            Get Started
          </button>
          <button className="rounded-md border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black focus:outline-none">
            Learn More
          </button>
        </div>
      </div>
      <div className="absolute inset-0 z-10 h-full w-full bg-black/70" />
      <ThreeDMarquee className="pointer-events-none absolute inset-0 h-full w-full" images={images} />
    </div>
  );
}