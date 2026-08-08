"use client";

import { useEffect, useState, type ElementType } from "react";
import { motion } from "framer-motion";
import { QrCode, Contact } from "lucide-react";
import { SiFacebook, SiYoutube, SiTiktok } from "react-icons/si";
import Img1 from "../../images/avatar.jpg";


type IconType = ElementType;

const CARDS: { id: string; Icon: IconType; bg: string; avatar: string }[] = [
  { id: "facebook", Icon: SiFacebook, bg: "#BE5103", avatar: Img1.src },
  { id: "qr", Icon: QrCode, bg: "#0f6860", avatar: Img1.src },
  { id: "tiktok", Icon: SiTiktok, bg: "#069494", avatar: Img1.src },
  { id: "youtube", Icon: SiYoutube, bg: "#ac4c87", avatar: Img1.src },
  { id: "contact", Icon: Contact, bg: "#6a2e81", avatar: Img1.src },
];

// Fanned "deck" offsets, front card first — fans toward the upper-left.
const STACK = [
  { x: 0, y: 0, rotate: 0, scale: 1, z: 5 },
  { x: -22, y: -22, rotate: -6, scale: 0.96, z: 4 },
  { x: -44, y: -44, rotate: -11, scale: 0.93, z: 3 },
  { x: -66, y: -66, rotate: -16, scale: 0.9, z: 2 },
  { x: -88, y: -88, rotate: -20, scale: 0.87, z: 1 },
];

const SHUFFLE_INTERVAL = 2200;

export default function ShareCardStack() {
  const [order, setOrder] = useState(CARDS.map((c) => c.id));

  useEffect(() => {
    // Every tick, the front card moves to the back of the deck and the
    // next card slides forward — a continuously shuffling stack.
    const id = setInterval(() => {
      setOrder((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, SHUFFLE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-[260px] w-[220px] sm:h-[300px] sm:w-[250px] mt-10 lg:mt-0">
      {order.map((id, i) => {
        const card = CARDS.find((c) => c.id === id)!;
        const pos = STACK[i];
        return (
          <motion.div
            key={card.id}
            animate={{
              x: pos.x,
              y: pos.y,
              rotate: pos.rotate,
              scale: pos.scale,
              zIndex: pos.z,
            }}
            transition={{ duration: 0.7, ease: [0.45, 0, 0.2, 1] }}
            className="absolute inset-0 overflow-hidden rounded-[28px] shadow-soft-lg"
            style={{ backgroundColor: card.bg }}
          >
            <div className="flex h-full flex-col p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={card.avatar}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                  <div className="space-y-1.5">
                    <div className="h-2 w-14 rounded-full bg-white/50" />
                    <div className="h-2 w-9 rounded-full bg-white/30" />
                  </div>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white">
                  <card.Icon size={20} color={card.bg} />
                </span>
              </div>

              {/* skeleton details section, filling the rest of the card */}
              <div className="mt-6 flex flex-1 flex-col gap-3">
                <div className="h-2.5 w-4/5 rounded-full bg-white/25" />
                <div className="h-2.5 w-3/5 rounded-full bg-white/20" />
                <div className="mt-1 flex-1 rounded-2xl bg-white/15" />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* floating handle pill */}
      <span className="absolute bottom-10 -right-10 lg:-right-20 z-20 flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-lg font-bold text-dark shadow-soft-lg">
        <span className="text-primary">#</span> clickcard.app/you
      </span>
    </div>
  );
}
