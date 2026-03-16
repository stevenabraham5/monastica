import React from 'react';
import { ActField } from './ActField';
import { MountainScene } from './MountainScene';
import { CityScape } from './CityScape';
import { useAuthStore } from '../store/authStore';

/*
  SceneBackground — renders the selected scene based on user preference.
  All scenes share the same prop interface.
*/

interface SceneBackgroundProps {
  actionCount: number;
  completedToday: number;
  fullScreen?: boolean;
  mood?: string | null;
}

export function SceneBackground(props: SceneBackgroundProps) {
  const scene = useAuthStore((s) => s.scenePreference);

  switch (scene) {
    case 'mountain':
      return <MountainScene {...props} />;
    case 'cityscape':
      return <CityScape {...props} />;
    case 'farmland':
    default:
      return <ActField {...props} />;
  }
}
