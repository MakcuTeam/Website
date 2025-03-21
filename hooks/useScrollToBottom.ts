import { useEffect, useRef, RefObject } from 'react';

type ScrollToBottomOptions = {
    dependency?: any[];
    smooth?: boolean;
};

export function useScrollToBottom<T extends HTMLElement>(options: ScrollToBottomOptions = {}): RefObject<T | null> {
    const { dependency = [], smooth = false } = options;
    const ref = useRef<T>(null);

    useEffect(() => {
        if (ref.current) {
            if (smooth) {
                ref.current.scrollTo({
                    top: ref.current.scrollHeight,
                    behavior: 'smooth'
                });
            } else {
                ref.current.scrollTop = ref.current.scrollHeight;
            }
        }
    }, [ref, ...dependency, smooth]);

    return ref;
}
