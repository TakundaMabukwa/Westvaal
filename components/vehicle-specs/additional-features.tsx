"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"

export default function AdditionalFeatures() {
  const featuresList = [
    "Aircon",
    "Airbags",
    "Alloy Wheels",
    "ABS",
    "Cruise",
    "Diff Lock",
    "Elec Windows",
    "Low Ratio",
    "PDC",
    "Power Steer",
    "Sat Nav",
    "Security",
    "Traction",
  ]

  const [features, setFeatures] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(featuresList.map((f) => [f, false])) as Record<string, boolean>
  )

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Additional Features</h3>
      <div className="grid gap-4 md:grid-cols-4">
        {featuresList.map((f) => (
          <div key={f} className="flex items-center justify-between p-4 bg-muted/10 rounded-md border-b">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">—</div>
              <div className="text-sm text-foreground">{f}</div>
            </div>
            <Switch
              checked={!!features[f]}
              onCheckedChange={(val) => setFeatures((s) => ({ ...s, [f]: !!val }))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
