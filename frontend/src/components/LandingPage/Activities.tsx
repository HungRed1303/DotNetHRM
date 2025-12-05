// src/components/LandingPage/Activities.tsx
import { motion } from "framer-motion";
import { THEME_COLORS } from "../common/THEME_COLORS";

// Import ảnh 
import runningImg from "../../assets/running.jpg";
import seminarImg from "../../assets/seminar.jpg";
import teamEventImg from "../../assets/team_event.jpg";
import hackathonImg from "../../assets/hackathon.jpg";
import teamBuildingImg from "../../assets/team-building.jpg";

const ITEMS = [
  { title: "Chiến dịch chạy bộ", subtitle: "Hơn 500 nhân viên tham gia", image: runningImg },
  { title: "Workshop AI", subtitle: "Nâng cao kỹ năng dữ liệu", image: seminarImg },
  { title: "Ngày hội nội bộ", subtitle: "Gắn kết đội ngũ", image: teamEventImg },
  { title: "Hackathon", subtitle: "Ý tưởng sáng tạo", image: hackathonImg },
  { title: "Team Building", subtitle: "Kết nối & trải nghiệm", image: teamBuildingImg },
];

const LOOP_LIST = [...ITEMS, ...ITEMS];

export default function Activities() {
  return (
    <section id="activities" className="w-full py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h3
          className="text-2xl font-semibold mb-6"
          style={{ color: THEME_COLORS.primary[700] }}
        >
          Hoạt động nổi bật
        </h3>

        {/* VIEWPORT */}
        <div className="relative overflow-hidden w-full">
          <motion.div
            className="flex gap-5"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {LOOP_LIST.map((it, idx) => (
              <div
                key={idx}
                className="w-[260px] flex-shrink-0 rounded-xl overflow-hidden border bg-white shadow-sm"
                style={{ borderColor: THEME_COLORS.secondary[200] }}
              >
                <div className="aspect-[16/9] w-full">
                  <img
                    src={it.image}
                    alt={it.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                <div className="p-4">
                  <h4
                    className="text-lg font-semibold"
                    style={{ color: THEME_COLORS.primary[800] }}
                  >
                    {it.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{it.subtitle}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
