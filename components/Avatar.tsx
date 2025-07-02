// components/Avatar.tsx

import { CharacterIconRenderer } from "./CharacterIconRenderer";
import Image from "next/image";

export const Avatar = ({
  avatarSrc,
  avatarName,
  iconName,
  size = 36,
  focus = "image",
  className,
}: {
  avatarSrc: string | null;
  avatarName: string;
  iconName?: string | null;
  size?: number;
  focus?: "icon" | "image";
  className?: string;
}) => {
  const style = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const ImageAvatar = avatarSrc ? (
    <Image
      src={avatarSrc}
      alt={`${avatarName}'s avatar`}
      width={size}
      height={size}
      className="object-cover w-full h-full"
    />
  ) : null;

  const IconAvatar = iconName ? (
    <CharacterIconRenderer iconName={iconName} width={size} height={size} />
  ) : null;

  const FallbackAvatar = (
    <div className="w-full h-full bg-primary-default/20 flex items-center justify-center text-primary-default font-medium">
      {avatarName.charAt(0).toUpperCase()}
    </div>
  );

  let content;
  if (focus === "image") {
    content = ImageAvatar || IconAvatar || FallbackAvatar;
  } else {
    content = IconAvatar || ImageAvatar || FallbackAvatar;
  }

  return (
    <div
      style={style}
      className={`rounded-full overflow-hidden flex-shrink-0${
        className ? ` ${className}` : ""
      }`}
    >
      {content}
    </div>
  );
};
