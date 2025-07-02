// components/CharacterIconRenderer.tsx
"use client";

import {
  Sparkles, Flame, BrainCircuit, Heart, Cog, Bike, Feather, Scroll,
  MessageSquare, Dices, Turtle, Lock, Trophy, Cat, GraduationCap, Moon,
  Mic, Shield, GlassWater, HeartPulse, Cookie, Sun, Eye, Gamepad2,
  TestTube, Briefcase, Sprout, Rocket, Palette, Wine, Compass,
  LucideProps
} from "lucide-react";

const iconComponents: { [key: string]: React.FC<LucideProps> } = {
  Sparkles, Flame, BrainCircuit, Heart, Cog, Bike, Feather, Scroll,
  MessageSquare, Dices, Turtle, Lock, Trophy, Cat, GraduationCap, Moon,
  Mic, Shield, GlassWater, HeartPulse, Cookie, Sun, Eye, Gamepad2,
  TestTube, Briefcase, Sprout, Rocket, Palette, Wine, Compass
};

interface CharacterIconRendererProps extends LucideProps {
  iconName: string;
}

export const CharacterIconRenderer = ({ iconName, ...props }: CharacterIconRendererProps) => {
  const IconComponent = iconComponents[iconName];

  if (!IconComponent) {
    return <Sparkles {...props} />; 
  }

  return <IconComponent {...props} />;
};