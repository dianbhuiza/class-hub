import { useEffect, useState } from 'react';
import { getClassFileInfo } from '../api';
import type { ClassFileInfo } from '../types';

interface FileInfoState {
  classId: string;
  info: ClassFileInfo | null;
}

export function useClassFileInfo(
  classId: string | undefined,
  enabled: boolean,
): ClassFileInfo | null {
  const [state, setState] = useState<FileInfoState | null>(null);

  const active = Boolean(classId) && enabled;
  const info = active && state && state.classId === classId ? state.info : null;

  useEffect(() => {
    if (!active || !classId) return;

    let mounted = true;

    getClassFileInfo(classId)
      .then((data) => {
        if (mounted) setState({ classId, info: data });
      })
      .catch(() => {
        if (mounted) setState({ classId, info: null });
      });

    return () => {
      mounted = false;
    };
  }, [classId, active]);

  return info;
}
