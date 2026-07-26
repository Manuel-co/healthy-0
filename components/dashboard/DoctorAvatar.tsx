import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { Doctor } from "@/lib/types";

export function DoctorAvatar({ doctor, size = "default" }: { doctor: Doctor; size?: "sm" | "default" | "lg" }) {
  return (
    <Avatar size={size}>
      {doctor.profileImageUrl && <AvatarImage src={doctor.profileImageUrl} alt={doctor.name} />}
      <AvatarFallback>{initials(doctor.name)}</AvatarFallback>
    </Avatar>
  );
}
