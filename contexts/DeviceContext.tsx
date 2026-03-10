"use client";

import { createContext, useContext } from "react";

export type DeviceType = "iphone" | "android" | "ipad" | "android_tablet" | "desktop";

export const DeviceContext = createContext<DeviceType>("iphone");
export const useDeviceType = () => useContext(DeviceContext);
