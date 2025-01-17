import React, {
  CSSProperties,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CSSTransition } from 'react-transition-group';
import { RankProgress } from '../RankProgress';
import { RankConfetti } from '../../svg/RankConfetti';
import { rankToColor, RANKS, getRank } from '../../lib/rank';
import { LoggedUser } from '../../lib/user';
import { Checkbox } from '../fields/Checkbox';
import RadialProgress from '../RadialProgress';
import Rank from '../Rank';
import { Button, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import styles from './NewRankModal.module.css';
import GoToDevCardButton from '../GoToDevCardButton';
import useDebounce from '../../hooks/useDebounce';
import LoginButton from '../LoginButton';
import { Modal, ModalProps } from './common/Modal';

export interface NewRankModalProps extends Omit<ModalProps, 'onRequestClose'> {
  rank: number;
  progress: number;
  user?: LoggedUser;
  onRequestClose?: (neverShowAgain: boolean) => unknown;
}

export default function NewRankModal({
  rank,
  progress,
  user,
  onRequestClose,
  className,
  ...props
}: NewRankModalProps): ReactElement {
  const [shownRank, setShownRank] = useState(getRank(rank));
  const [shownProgress, setShownProgress] = useState(progress - 1);
  const [animatingRank, setAnimatingRank] = useState(false);
  const [rankAnimationEnded, setRankAnimationEnded] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  const timeoutRef = useRef<number>();
  const visibilityRef = useRef(null);

  const title = useMemo(() => {
    if (user) {
      const firstName = user.name.split(' ')[0];
      if (rank === 1) {
        return `Wow, ${firstName}!`;
      }
      if (rank === 2) {
        return `You rock, ${firstName}!`;
      }
      if (rank === 3) {
        return `That's epic, ${firstName}!`;
      }
      if (rank === 4) {
        return `Fantastic, ${firstName}!`;
      }
      return `Legendary, ${firstName}!`;
    }
    return 'Good job!';
  }, [rank, user]);

  const closeModal = () => {
    onRequestClose?.(inputRef.current?.checked);
  };

  const [animateRank] = useDebounce(() => {
    if (visibilityRef.current) {
      document.removeEventListener('visibilitychange', visibilityRef.current);
    }

    timeoutRef.current = 1000;
    visibilityRef.current = animateRank;

    if (document.visibilityState === 'hidden') {
      document.addEventListener('visibilitychange', visibilityRef.current, {
        once: true,
      });
    } else {
      setAnimatingRank(true);
      setShownRank(rank);
      setShownProgress(RANKS[getRank(rank)].steps);
    }
  }, timeoutRef.current);

  useEffect(() => {
    timeoutRef.current = 1500;
    animateRank();
    return () => {
      if (visibilityRef.current) {
        document.removeEventListener('visibilitychange', visibilityRef.current);
      }
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [onRankAnimationFinish] = useDebounce(
    () => setRankAnimationEnded(true),
    700,
  );

  return (
    <Modal
      onRequestClose={closeModal}
      className={className}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      style={{
        content: {
          '--rank-color': rankToColor(rank),
        } as CSSProperties,
      }}
      {...props}
    >
      <Modal.Header />
      <Modal.Body className="flex flex-col" style={{ overflow: 'visible' }}>
        <div
          className={`${styles.rankProgressContainer} relative z-0 -mt-4 flex items-center justify-center`}
        >
          {!user || !rankAnimationEnded ? (
            <RankProgress
              rank={shownRank}
              progress={shownProgress}
              fillByDefault
              showRankAnimation={animatingRank}
              className={styles.rankProgress}
              onRankAnimationFinish={onRankAnimationFinish}
            />
          ) : (
            <>
              <RadialProgress
                progress={RANKS[getRank(rank)].steps}
                steps={RANKS[getRank(rank)].steps}
                className={styles.radialProgress}
              />
              <img
                className={`${styles.profileImage} absolute inset-0 m-auto rounded-full object-cover`}
                src={user.image}
                alt="Your profile"
              />
              <Rank
                className={`${styles.newRankBadge} absolute inset-x-0 bottom-4 mx-auto rounded-full bg-theme-bg-tertiary`}
                rank={rank}
                colorByRank
              />
            </>
          )}
          <CSSTransition
            in={rankAnimationEnded}
            timeout={300}
            classNames="confetti-transition"
            mountOnEnter
            unmountOnExit
          >
            <RankConfetti
              className={`${styles.rankConfetti} absolute top-0 mx-auto h-full`}
              style={
                {
                  '--fill-color': rank <= RANKS.length && 'var(--rank-color)',
                } as CSSProperties
              }
            />
          </CSSTransition>
        </div>
        <h1 className="mt-2 text-center font-bold typo-callout">{title}</h1>
        <p className="mb-8 mt-1 text-center text-theme-label-secondary typo-callout">
          You earned the {RANKS[getRank(rank)].name?.toLowerCase()} rank
          {!user && (
            <>
              <br />
              <br />
              Add your new rank to your profile by signing up
            </>
          )}
        </p>
        {user ? (
          <div className="flex gap-4 self-center">
            <GoToDevCardButton>Generate Dev Card</GoToDevCardButton>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              onClick={closeModal}
            >
              Awesome!
            </Button>
          </div>
        ) : (
          <LoginButton className="mx-auto" />
        )}
        <Checkbox ref={inputRef} name="neverShow" className="mt-4 self-center">
          Never show this popup again
        </Checkbox>
      </Modal.Body>
    </Modal>
  );
}
