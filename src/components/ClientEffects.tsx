'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ClientEffects: React.FC = () => {
  const pathname = usePathname();

  // ScrollToTop on pathname change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // RevealOnScroll observers
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const observe = (el: Element) => {
      if (
        el.classList?.contains('leo-reveal') &&
        !el.classList.contains('is-in')
      ) {
        io.observe(el);
      }
    };

    document
      .querySelectorAll('.leo-reveal:not(.is-in)')
      .forEach((el) => io.observe(el));

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          observe(node);
          node
            .querySelectorAll?.('.leo-reveal:not(.is-in)')
            .forEach(observe);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const fallback = window.setTimeout(() => {
      document
        .querySelectorAll('.leo-reveal:not(.is-in)')
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          const inView =
            rect.top < window.innerHeight && rect.bottom > 0;
          if (inView) el.classList.add('is-in');
        });
    }, 1500);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(fallback);
    };
  }, [pathname]);

  return null;
};

export default ClientEffects;
