import { motion } from "framer-motion";
import { THEME_COLORS } from "../common/THEME_COLORS";

export default function Stats() {
  const stats = [
    { number: "500+", label: "Nhân viên" },
    { number: "12+", label: "Năm hoạt động" },
    { number: "30+", label: "Dự án lớn" },
    { number: "98%", label: "Mức độ hài lòng" },
  ];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Tiêu đề */}
        <div className="text-center mb-10">
          <h2
            className="text-4xl font-semibold tracking-tight"
            style={{ color: THEME_COLORS.primary[700] }}
          >
            Những con số tạo nên giá trị
          </h2>

          <p className="mt-3 text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Hành trình phát triển của doanh nghiệp được minh chứng qua các cột mốc ấn tượng.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
          {stats.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex flex-col items-center relative"
            >
              {/* Number */}
              <h3
                className="text-5xl md:text-6xl font-bold"
                style={{ color: THEME_COLORS.primary[500] }}
              >
                {item.number}
              </h3>

              {/* Label */}
              <p className="text-gray-600 mt-2 text-lg">{item.label}</p>

              {/* Divider */}
              {i < stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-10 w-[1px] bg-gray-200"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
