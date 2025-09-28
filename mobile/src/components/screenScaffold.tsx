// src/components/ScreenScaffold.tsx
import React from "react";
import { View } from "react-native";
import TopBar from "./TopBar";
import Menu, { BottomKey } from "./menu";

type Props = {
  children: React.ReactNode;
  logo?: React.ComponentType<{ width?: number; height?: number }>;
  onPressLogo?: () => void;
  onPressSOS: () => void;
  tab: BottomKey;
  onChangeTab: (k: BottomKey) => void;
};

export default function ScreenScaffold({
  children, logo: Logo, onPressLogo, onPressSOS, tab, onChangeTab,
}: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopBar Logo={Logo} onPressLogo={onPressLogo} onPressSOS={onPressSOS} />
      <View style={{ flex: 1 }}>{children}</View>
      <Menu value={tab} onChange={onChangeTab} />
    </View>
  );
}