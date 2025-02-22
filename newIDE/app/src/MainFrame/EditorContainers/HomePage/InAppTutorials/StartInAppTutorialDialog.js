// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../../../UI/Dialog';
import FlatButton from '../../../../UI/FlatButton';
import { Line, Column } from '../../../../UI/Grid';
import { ColumnStackLayout } from '../../../../UI/Layout';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import { getLanguageLabelForLocale } from '../../../../Utils/i18n/MessageByLocale';
import Text from '../../../../UI/Text';
import {
  FLING_GAME_IN_APP_TUTORIAL_ID,
  PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
  CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
  HEALTH_BAR_IN_APP_TUTORIAL_ID,
} from '../../../../Utils/GDevelopServices/InAppTutorial';

const styles = {
  imgContainer: {
    marginBottom: 16,
  },
};

type Props = {|
  open: boolean,
  tutorialId: string,
  onClose: () => void,
  tutorialCompletionStatus: 'notStarted' | 'started' | 'complete',
  isProjectOpened?: boolean,
  startTutorial: (scenario: 'resume' | 'startOver' | 'start') => Promise<void>,
|};

const fullTutorialContent = (
  <>
    <Text>
      <Trans>
        You're about to start the first chapter of this guided lesson.
      </Trans>
    </Text>
    <Text>
      <Trans>
        GDevelop will save your progress so you can take a break when you need
        it.
      </Trans>
    </Text>
  </>
);

const getGuidedLessonContent = ({
  learningKeys,
}: {
  learningKeys: React.Node[],
}) => (
  <>
    <Text>
      <Trans>You're about to start this guided lesson.</Trans>
    </Text>
    <Text>
      <Trans>
        A new project will be opened, so before beginning please ensure you have
        closed and saved your current project.
      </Trans>
    </Text>
    <Text>
      <Trans>In this tutorial you will learn:</Trans>
    </Text>
    {learningKeys.map((learningKey, index) => (
      <Text displayAsListItem noMargin key={index}>
        {learningKey}
      </Text>
    ))}
  </>
);

const titleAndContentByKey = {
  [FLING_GAME_IN_APP_TUTORIAL_ID]: {
    title: <Trans>Let's make a Fling Game</Trans>,
    content: fullTutorialContent,
  },
  [PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID]: {
    title: <Trans>Let's improve a scoring system</Trans>,
    content: getGuidedLessonContent({
      learningKeys: [
        <Trans>Making objects disappear or appear when colliding</Trans>,
        <Trans>Creating, modifying and accessing a scene variable</Trans>,
        <Trans>Updating a score accordingly</Trans>,
      ],
    }),
  },
  [CAMERA_PARALLAX_IN_APP_TUTORIAL_ID]: {
    title: <Trans>Let's improve the camera and the background</Trans>,
    content: getGuidedLessonContent({
      learningKeys: [
        <Trans>Add a background with parallax effect</Trans>,
        <Trans>Add a new layer</Trans>,
        <Trans>Add an extension</Trans>,
        <Trans>Use basic camera movements to follow the player</Trans>,
      ],
    }),
  },
  [HEALTH_BAR_IN_APP_TUTORIAL_ID]: {
    title: (
      <Trans>Let's communicate to the player the remaining health points</Trans>
    ),
    content: getGuidedLessonContent({
      learningKeys: [
        <Trans>Add a new layer</Trans>,
        <Trans>Use a prefab to display the player's health bar</Trans>,
      ],
    }),
  },
};

const StartInAppTutorialDialog = ({
  open,
  tutorialId,
  onClose,
  tutorialCompletionStatus,
  isProjectOpened,
  startTutorial,
}: Props) => {
  const resumeTutorial = () => startTutorial('resume');
  const startOverTutorial = () => startTutorial('startOver');
  const startTutorialForFirstTime = () => startTutorial('start');

  const { getInAppTutorialShortHeader } = React.useContext(
    InAppTutorialContext
  );

  const selectedInAppTutorialShortHeader = getInAppTutorialShortHeader(
    tutorialId
  );

  const availableLocales = selectedInAppTutorialShortHeader
    ? selectedInAppTutorialShortHeader.availableLocales
    : null;

  const dialogContentByCompletionStatus = {
    notStarted: {
      title: titleAndContentByKey[tutorialId].title,
      content: titleAndContentByKey[tutorialId].content,
      availableLocalesLabels: availableLocales
        ? availableLocales.map(locale => [
            locale,
            getLanguageLabelForLocale(locale),
          ])
        : null,
      primaryAction: {
        label: <Trans>Yes</Trans>,
        onClick: startTutorialForFirstTime,
      },
      secondaryAction: { label: <Trans>No</Trans>, onClick: onClose },
      tertiaryAction: null,
    },
    started: {
      title: <Trans>Welcome back!</Trans>,
      content: (
        <Text>
          <Trans>Let's finish your Fling Game, shall we?</Trans>
        </Text>
      ),
      primaryAction: {
        label: <Trans>Let's go</Trans>,
        onClick: resumeTutorial,
      },
      secondaryAction: {
        label: isProjectOpened ? (
          <Trans>No, close project</Trans>
        ) : (
          <Trans>No</Trans>
        ),
        onClick: onClose,
      },
      tertiaryAction: {
        label: <Trans>Restart tutorial</Trans>,
        onClick: startOverTutorial,
      },
    },
    complete: {
      title: <Trans>Restart the Tutorial</Trans>,
      content: (
        <>
          <Text>
            <Trans>You're about to restart this 3-chapter guided lesson.</Trans>
          </Text>
          <Text>
            <Trans>
              GDevelop will save your progress, so you can take a break if you
              need.
            </Trans>
          </Text>
        </>
      ),
      primaryAction: { label: <Trans>Yes</Trans>, onClick: startOverTutorial },
      secondaryAction: { label: <Trans>No</Trans>, onClick: onClose },
      tertiaryAction: null,
    },
  };

  const dialogContent =
    dialogContentByCompletionStatus[tutorialCompletionStatus];
  const {
    title,
    content,
    primaryAction,
    secondaryAction,
    tertiaryAction,
  } = dialogContent;

  const actions = [
    <FlatButton
      key="close"
      label={secondaryAction.label}
      onClick={secondaryAction.onClick}
    />,
    <DialogPrimaryButton
      key="start"
      label={primaryAction.label}
      primary
      onClick={primaryAction.onClick}
    />,
  ];
  const secondaryActions = tertiaryAction
    ? [
        <FlatButton
          key="other"
          label={tertiaryAction.label}
          onClick={tertiaryAction.onClick}
        />,
      ]
    : undefined;

  return (
    <Dialog
      title={title}
      actions={actions}
      secondaryActions={secondaryActions}
      open={open}
      onRequestClose={onClose}
      onApply={primaryAction.onClick}
      maxWidth="xs"
      cannotBeDismissed
    >
      <ColumnStackLayout noMargin>
        <Line alignItems="center" justifyContent="center" noMargin>
          <div style={styles.imgContainer}>
            <img alt="hero" src="res/hero.png" width={48} height={48} />
          </div>
        </Line>
        {content}
        {dialogContent.availableLocalesLabels ? (
          <Column noMargin>
            <Text>
              <Trans>
                This tutorial is available in the following languages:
              </Trans>
            </Text>
            {dialogContent.availableLocalesLabels.map(([locale, label]) => (
              <Text displayAsListItem noMargin key={locale}>
                {label}
              </Text>
            ))}
          </Column>
        ) : null}
        <Text>
          <Trans>Are you ready?</Trans>
        </Text>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default StartInAppTutorialDialog;
