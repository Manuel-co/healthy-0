"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { KycInfo } from "@/lib/types";

const ID_TYPES = ["National ID", "Passport", "Driver's License"];

export function KycFields({
  value,
  onChange,
}: {
  value: KycInfo;
  onChange: (value: KycInfo) => void;
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
          <SelectTrigger id="kyc-id-type" className="w-full">
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kyc-id-number">ID number</Label>
        <Input
          id="kyc-id-number"
          required
          value={value.idNumber}
          onChange={(e) => onChange({ ...value, idNumber: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kyc-document">Upload ID document</Label>
        <Input
          id="kyc-document"
          type="file"
          required
          accept="image/*,.pdf"
          onChange={(e) => onChange({ ...value, documentName: e.target.files?.[0]?.name ?? "" })}
        />
      </div>
    </div>
  );
}
