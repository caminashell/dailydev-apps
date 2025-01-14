import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PostType } from '../../../graphql/posts';

type TypeLabelType = PostType | ReactElement | string;

const typeToClassName: Record<
  PostType.Collection | PostType.VideoYouTube,
  string
> = {
  [PostType.Collection]: 'text-theme-color-cabbage',
  [PostType.VideoYouTube]: 'text-theme-color-blueCheese',
};

const typeToLabel = {
  [PostType.VideoYouTube]: 'Video',
};

const excludedTypes = new Set<PostType>([
  PostType.Article,
  PostType.Freeform,
  PostType.Share,
  PostType.Welcome,
]);

export interface TypeLabelProps {
  type: TypeLabelType;
  className?: string | undefined;
  focus?: boolean;
}

export function TypeLabel({
  type = PostType.Article,
  className,
  focus,
}: TypeLabelProps): ReactElement {
  // do not show tag label for excluded types
  if (excludedTypes.has(type as PostType)) {
    return null;
  }

  return (
    <legend
      className={classNames(
        'rounded bg-theme-bg-primary font-bold capitalize typo-caption1',
        typeToClassName[type as PostType] ?? 'text-theme-label-tertiary',
        !focus && '-top-[9px]', // taking the border width into account
        focus && '-top-2.5',
        className,
      )}
    >
      <div
        className={classNames(
          'rounded px-2 group-hover:bg-theme-float group-focus:bg-theme-float',
          focus && 'bg-theme-float',
        )}
      >
        {typeToLabel[type as PostType] ?? type}
      </div>
    </legend>
  );
}
