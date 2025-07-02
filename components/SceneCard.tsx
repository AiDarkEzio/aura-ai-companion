import Link from "next/link";
import Image from "next/image";
import type { Scene } from "@/app/generated/prisma";
import { AnimatedSection } from "./AnimatedSection";

interface SceneCardProps {
  scene: Scene;
}

export const SceneCard = ({ scene }: SceneCardProps) => {
  return (
    <AnimatedSection>
      <Link
        href={`/scenes/${scene.id}`}
        className="group relative block h-64 w-full overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-primary-dark/20 dark:hover:shadow-primary-light/10"
      >
        {/* Background Image */}
        <Image
          src={scene.image}
          alt={scene.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col p-6 text-white">
          <h3 className="text-xl font-bold font-heading">{scene.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-dark-text-secondary">
            {scene.summary}
          </p>
        </div>
      </Link>
    </AnimatedSection>
  );
};
