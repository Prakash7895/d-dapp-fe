'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import TabContenWrapper from './TabContenWrapper';
import AnimatedTooltip from './AnimatedTooltip';

export type Tab = {
  title: ReactNode;
  value: string;
  content?: string | React.ReactNode;
  onClick?: (val: string) => void;
  disabled?: boolean;
  tooltipContent?: ReactNode;
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
  contentWrapperClassName,
  activeTabValue,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
  contentWrapperClassName?: string;
  activeTabValue?: string;
}) => {
  const [active, setActive] = useState<Tab>(
    activeTabValue
      ? propTabs.find((el) => el.value === activeTabValue) ?? propTabs[0]
      : propTabs[0]
  );
  const [tabs, setTabs] = useState<Tab[]>(propTabs);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  const [hovering, setHovering] = useState(false);

  return (
    <>
      <div
        className={cn(
          'flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full',
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.value}
            onClick={() => {
              moveSelectedTabToTop(idx);
              if (tab.onClick) {
                tab.onClick(tab.value);
              }
            }}
            disabled={tab.disabled}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn('relative px-4 py-2 rounded-full', tabClassName)}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId='clickedbutton'
                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                className={cn(
                  'absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full ',
                  activeTabClassName
                )}
              />
            )}

            {tab.tooltipContent ? (
              <AnimatedTooltip
                disabled={tab.disabled}
                tooltipContent={tab.tooltipContent}
              >
                <span
                  className={`relative block text-black dark:text-white ${
                    tab.disabled ? 'opacity-70' : ''
                  }`}
                >
                  {tab.title}
                </span>
              </AnimatedTooltip>
            ) : (
              <span
                className={`relative block text-black dark:text-white ${
                  tab.disabled ? 'opacity-70' : ''
                }`}
              >
                {tab.title}
              </span>
            )}
          </button>
        ))}
      </div>
      {active.content && (
        <FadeInDiv
          tabs={tabs}
          active={active}
          key={active.value}
          hovering={hovering}
          className={cn('mt-32', contentClassName)}
          contentWrapperClassName={contentWrapperClassName}
        />
      )}
    </>
  );
};

export const FadeInDiv = ({
  className,
  tabs,
  hovering,
  contentWrapperClassName,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
  hovering?: boolean;
  contentWrapperClassName?: string;
}) => {
  const isActive = (tab: Tab) => {
    return tab.value === tabs[0].value;
  };
  return (
    <div className='relative w-full h-full'>
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering ? idx * -50 : 0,
            zIndex: -idx,
            opacity: idx < 1 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: isActive(tab) ? [0, 40, 0] : 0,
          }}
          className={cn('w-full h-full absolute top-0 left-0', className)}
        >
          <TabContenWrapper className={contentWrapperClassName}>
            {tab.content}
          </TabContenWrapper>
        </motion.div>
      ))}
    </div>
  );
};
