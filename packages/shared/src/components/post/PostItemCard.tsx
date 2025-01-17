import React, { MouseEvent, ReactElement } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { HidePostItemCardProps } from '../../graphql/users';
import { PostItem, UserPostVote, isVideoPost } from '../../graphql/posts';
import {
  MiniCloseIcon as XIcon,
  MenuIcon,
  UpvoteIcon,
  DownvoteIcon,
} from '../icons';
import classed from '../../lib/classed';
import PostMetadata from '../cards/PostMetadata';
import { ProfilePicture } from '../ProfilePicture';
import { Image } from '../image/Image';
import ConditionalWrapper from '../ConditionalWrapper';
import { cloudinary } from '../../lib/image';
import { useReadHistoryVotePost } from '../../hooks';
import { Origin } from '../../lib/analytics';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/ButtonV2';

export interface PostItemCardProps {
  className?: string;
  postItem: PostItem;
  showButtons?: boolean;
  clickable?: boolean;
  onHide?: (params: HidePostItemCardProps) => Promise<unknown>;
  onContextMenu?: (event: React.MouseEvent, post: PostItem) => void;
  showVoteActions?: boolean;
  analyticsOrigin?: Origin;
}

const SourceShadow = classed(
  'div',
  'absolute left-5 -my-1 w-8 h-8 rounded-full bg-theme-bg-primary',
);

export default function PostItemCard({
  postItem,
  showButtons = true,
  clickable = true,
  onHide,
  className,
  onContextMenu,
  showVoteActions = false,
  analyticsOrigin = Origin.Feed,
}: PostItemCardProps): ReactElement {
  const { timestampDb, post } = postItem;
  const onHideClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onHide({ postId: post.id, timestamp: timestampDb });
  };
  const article = post?.sharedPost ?? post;

  const { toggleUpvote, toggleDownvote } = useReadHistoryVotePost();

  const classes = classNames(
    'relative flex w-full flex-row py-3 pl-9 pr-5',
    showVoteActions ? 'items-start tablet:items-center' : 'items-center',
    clickable && 'hover:cursor-pointer hover:bg-theme-hover',
    className,
  );

  return (
    <article className={classNames(!clickable && classes)}>
      <ConditionalWrapper
        condition={clickable}
        wrapper={(children) => (
          <Link href={post.commentsPermalink}>
            <a className={classes} title="Go to post">
              {children}
            </a>
          </Link>
        )}
      >
        <>
          <Image
            src={article.image}
            alt={post.title}
            className="h-16 w-16 rounded-16 object-cover laptop:w-24"
            loading="lazy"
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          />
          <SourceShadow className={showVoteActions && 'top-8'} />
          <ProfilePicture
            size="small"
            rounded="full"
            className={classNames(
              'absolute left-6',
              showVoteActions && 'top-8',
            )}
            user={{
              image: post.source.image,
              username: `source of ${post.title}`,
            }}
            nativeLazyLoading
          />
          <div
            className={classNames(
              'flex flex-1',
              showVoteActions ? 'flex-col tablet:flex-row' : 'items-center',
            )}
          >
            <div className="ml-4 flex flex-1 flex-col">
              <h3 className="mr-6 line-clamp-2 flex flex-1 break-words text-left typo-callout">
                {post.title}
              </h3>
              <PostMetadata
                readTime={post.readTime}
                numUpvotes={post.numUpvotes}
                isVideoType={isVideoPost(post)}
              />
            </div>
            <div className="ml-4 mt-1 flex tablet:ml-0 tablet:mt-1">
              {showButtons && showVoteActions && (
                <>
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    color={showVoteActions ? ButtonColor.Avocado : undefined}
                    className={showVoteActions ? 'flex' : 'hidden laptop:flex'}
                    pressed={post?.userState?.vote === UserPostVote.Up}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleUpvote({ post, origin: analyticsOrigin });
                    }}
                    icon={
                      <UpvoteIcon
                        secondary={post?.userState?.vote === UserPostVote.Up}
                      />
                    }
                  />
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    color={showVoteActions ? ButtonColor.Ketchup : undefined}
                    className={showVoteActions ? 'flex' : 'hidden laptop:flex'}
                    pressed={post?.userState?.vote === UserPostVote.Down}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDownvote({ post, origin: analyticsOrigin });
                    }}
                    icon={
                      <DownvoteIcon
                        secondary={post?.userState?.vote === UserPostVote.Down}
                      />
                    }
                  />
                </>
              )}
              {showButtons && !showVoteActions && onHide && (
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  className="hidden laptop:flex"
                  icon={<XIcon />}
                  onClick={onHideClick}
                />
              )}
              {showButtons && (
                <Button
                  variant={ButtonVariant.Tertiary}
                  data-testid={`post-item-${post.id}`}
                  icon={<MenuIcon />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onContextMenu(event, postItem);
                  }}
                  size={ButtonSize.Small}
                />
              )}
            </div>
          </div>
        </>
      </ConditionalWrapper>
    </article>
  );
}
