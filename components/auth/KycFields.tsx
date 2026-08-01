"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { KycInfo } from "@/lib/types";

const ID_TYPES = ["National ID", "Passport", "Driver's License"];

export function KycFields({
  value,
  onChange,
  errors,
}: {
  value: KycInfo;
  onChange: (value: KycInfo) => void;
  /** Optional per-field validation messages (e.g. from Formik/Yup) — shown under each field when present. */
  errors?: Partial<Record<keyof KycInfo, string>>;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border p-3">
      <p className="text-sm font-medium text-[#071938]">Identity verification (KYC)</p>
      <p className="text-xs text-muted-foreground -mt-2">
        A HealthyZero admin will review this before your account is activated.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="kyc-id-type">ID type</Label>
        <Select value={value.idType} onValueChange={(idType) => onChange({ ...value, idType })}>
          <SelectTrigger id="kyc-id-type" className="w-full" aria-invalid={!!errors?.idType}>
            <SelectValue placeholder="Select an ID type" />
          </SelectTrigger>
          <SelectContent>
            {ID_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.idType && <p className="text-sm text-destructive">{errors.idType}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kyc-id-number">ID number</Label>
        <Input
          id="kyc-id-number"
          required
          value={value.idNumber}
          onChange={(e) => onChange({ ...value, idNumber: e.target.value })}
          aria-invalid={!!errors?.idNumber}
        />
        {errors?.idNumber && <p className="text-sm text-destructive">{errors.idNumber}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kyc-document">Upload ID document</Label>
        <Input
          id="kyc-document"
          type="file"
          required
          accept="image/*,.pdf"
          onChange={(e) => onChange({ ...value, documentName: e.target.files?.[0]?.name ?? "" })}
          aria-invalid={!!errors?.documentName}
        />
        {errors?.documentName && <p className="text-sm text-destructive">{errors.documentName}</p>}
      </div>
    </div>
  );
}
