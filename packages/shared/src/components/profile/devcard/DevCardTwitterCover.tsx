import React, { ReactElement } from 'react';
import { DevCardContainer } from './DevCardContainer';
import { devCardBoxShadow, DevCardTheme, DevCardType } from './common';
import { DevCardStats } from './DevCardStats';
import { DevCardFooter } from './DevCardFooter';
import Logo from '../../Logo';
import { useDevCard } from '../../../hooks/profile/useDevCard';

interface DevCardTwitterCoverProps {
  userId: string;
}

export function DevCardTwitterCover({
  userId,
}: DevCardTwitterCoverProps): ReactElement {
  const { devcard, coverImage } = useDevCard(userId);

  if (!devcard) {
    return null;
  }

  return (
    <div
      className="flex w-[62.5rem] flex-row justify-end bg-cover px-20 py-12"
      style={{ backgroundImage: `url(${coverImage})` }}
    >
      <div className="flex flex-col items-center">
        <DevCardContainer
          theme={DevCardTheme.Default}
          className="max-w-[21.25rem]"
        >
          <div
            className="flex w-full flex-col-reverse items-center gap-4 rounded-24 p-3"
            style={{ boxShadow: devCardBoxShadow }}
          >
            <DevCardStats
              user={devcard.user}
              articlesRead={devcard.articlesRead}
            />
            <DevCardFooter
              shouldShowLogo={false}
              theme={devcard.theme}
              type={DevCardType.Compact}
              sources={devcard.sources}
              tags={devcard.tags}
            />
          </div>
        </DevCardContainer>
        <p className="font-white mt-5 flex flex-row gap-1 text-center typo-callout">
          Based on my activity <Logo />
        </p>
      </div>
    </div>
  );
}