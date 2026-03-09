import React from "react";

export interface PostRegistryEntry {
  id: string;
  filename: string;
  component: React.ComponentType;
}
