import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { GeneratedAvatarFallback } from "@/components/ui/generated-avatar";
import type { Doctor } from "@/lib/types";

interface DoctorAvatarProps {
  doctor: Doctor;
  size?: "sm" | "default" | "lg";
  /** Shows a status dot for whether the doctor is currently accepting new patients — real data, not presence/online. */
  showStatus?: boolean;
}

export function DoctorAvatar({ doctor, size = "default", showStatus = true }: DoctorAvatarProps) {
  return (
    <Avatar size={size}>
      {doctor.profileImageUrl && <AvatarImage src={doctor.profileImageUrl} alt={doctor.name} />}
      <AvatarFallback>
        <GeneratedAvatarFallback seed={doctor.id} size={size} />
      </AvatarFallback>
      {showStatus && (
        <AvatarBadge
          className={doctor.acceptingNewPatients ? "bg-green-600" : "bg-muted-foreground"}
          aria-label={doctor.acceptingNewPatients ? "Accepting new patients" : "Not accepting new patients"}
        />
      )}
    </Avatar>
  );
}
