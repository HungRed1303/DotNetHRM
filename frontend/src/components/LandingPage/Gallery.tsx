// src/components/LandingPage/Gallery.tsx
import { motion } from "framer-motion";
import { THEME_COLORS } from "../common/THEME_COLORS";

// Import ảnh đúng path
import img1 from "../../assets/activity_1.jpg";
import img2 from "../../assets/activity_2.jpg";
import img3 from "../../assets/activity_3.jpg";
import img4 from "../../assets/activity_4.jpg";
import img5 from "../../assets/activity_5.jpg";
import img6 from "../../assets/activity_6.jpg";

const images = [img1, img2, img3, img4, img5, img6];

export default function Gallery() {
  return (
    <section id="gallery" className="w-full py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h3
          className="text-2xl font-semibold mb-6"
          style={{ color: THEME_COLORS.primary[700] }}
        >
          Thư viện
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="overflow-hidden rounded-lg shadow-md"
            >
              <img
                src={src}
                alt={`gallery-${i}`}
                className="w-full h-48 object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
