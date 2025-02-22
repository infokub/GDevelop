// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Line, Column } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import Window from '../../../../Utils/Window';
import { Trans } from '@lingui/macro';
import PublishIcon from '@material-ui/icons/Publish';
import TranslateIcon from '@material-ui/icons/Translate';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import { type HomeTab } from '../HomePageMenu';
import {
  type TutorialCategory,
  type Tutorial,
} from '../../../../Utils/GDevelopServices/Tutorial';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { isMobile } from '../../../../Utils/Platform';
import SectionContainer, { SectionRow } from '../SectionContainer';
import FlatButton from '../../../../UI/FlatButton';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { CardWidget, SMALL_WIDGET_SIZE } from '../CardWidget';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { makeStyles } from '@material-ui/core/styles';
import ImageTileRow from '../../../../UI/ImageTileRow';
import { formatTutorialToImageTileComponent, TUTORIAL_CATEGORY_TEXTS } from '.';
import ArrowRight from '@material-ui/icons/ArrowRight';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import GuidedLessons from '../InAppTutorials/GuidedLessons';

const useStyles = makeStyles({
  tile: {
    width: '100%',
  },
});

const getHelpItemsColumnsFromWidth = (
  width: WidthType,
  showTourHelpItem: boolean
) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 3;
    case 'large':
    default:
      return showTourHelpItem ? 4 : 3;
  }
};

const getTutorialsColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 2;
    case 'medium':
      return 3;
    case 'large':
    default:
      return 5;
  }
};

const HELP_ITEMS_MAX_COLUMNS = getHelpItemsColumnsFromWidth('large', true);
const styles = {
  grid: {
    textAlign: 'center',
    maxWidth: (SMALL_WIDGET_SIZE + 2 * 5) * HELP_ITEMS_MAX_COLUMNS, // Avoid tiles taking too much space on large screens.
  },
  helpItem: {
    padding: 10,
    flex: 1,
    display: 'flex',
  },
};

type Props = {|
  onStartTutorial: () => void,
  onCreateProject: (?ExampleShortHeader) => void,
  onTabChange: (tab: HomeTab) => void,
  onOpenHelpFinder: () => void,
  onSelectCategory: (?TutorialCategory) => void,
  tutorials: Array<Tutorial>,
  selectInAppTutorial: (tutorialId: string) => void,
|};

const MainPage = ({
  onStartTutorial,
  onCreateProject,
  onTabChange,
  onOpenHelpFinder,
  onSelectCategory,
  tutorials,
  selectInAppTutorial,
}: Props) => {
  const classes = useStyles();
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  const windowWidth = useResponsiveWindowWidth();
  const shouldShowInAppTutorialButtons = !isMobile() && windowWidth !== 'small';
  const helpItems: {
    title: React.Node,
    description: React.Node,
    action: () => void,
    disabled?: boolean,
  }[] = [
    shouldShowInAppTutorialButtons
      ? {
          title: <Trans>Guided Tour</Trans>,
          description: (
            <Trans>
              Learn the fundamentals of the editor with our assisted tutorial.
            </Trans>
          ),
          action: () => {
            onStartTutorial();
          },
          disabled: !!currentlyRunningInAppTutorial,
        }
      : undefined,
    {
      title: <Trans>Documentation</Trans>,
      description: <Trans>Find the complete documentation on everything</Trans>,
      action: onOpenHelpFinder,
    },
    {
      title: <Trans>Examples</Trans>,
      description: <Trans>Have look at existing games from the inside</Trans>,
      action: onCreateProject,
    },
    {
      title: <Trans>Community</Trans>,
      description: <Trans>Ask your questions to the community</Trans>,
      action: () => onTabChange('community'),
    },
  ].filter(Boolean);

  const renderTutorialsRow = (category: TutorialCategory) => (
    <I18n>
      {({ i18n }) => (
        <ImageTileRow
          title={TUTORIAL_CATEGORY_TEXTS[category].title}
          description={TUTORIAL_CATEGORY_TEXTS[category].description}
          items={tutorials
            .filter(tutorial => tutorial.category === category)
            .map(tutorial =>
              formatTutorialToImageTileComponent(i18n, tutorial)
            )}
          onShowAll={() => onSelectCategory(category)}
          showAllIcon={<ArrowRight fontSize="small" />}
          getColumnsFromWidth={getTutorialsColumnsFromWidth}
          getLimitFromWidth={getTutorialsColumnsFromWidth}
        />
      )}
    </I18n>
  );

  return (
    <SectionContainer title={<Trans>Help and guides</Trans>}>
      <SectionRow>
        <Line noMargin>
          <GridList
            cols={getHelpItemsColumnsFromWidth(
              windowWidth,
              shouldShowInAppTutorialButtons
            )}
            style={styles.grid}
            cellHeight="auto"
            spacing={10}
          >
            {helpItems.map((helpItem, index) => (
              <GridListTile key={index} classes={{ tile: classes.tile }}>
                <CardWidget
                  onClick={helpItem.action}
                  key={index}
                  size="large"
                  disabled={helpItem.disabled}
                  useDefaultDisabledStyle
                >
                  <div style={styles.helpItem}>
                    <ColumnStackLayout
                      expand
                      justifyContent="center"
                      useFullHeight
                    >
                      <Text noMargin size="block-title">
                        {helpItem.title}
                      </Text>
                      <Text noMargin size="body" color="secondary">
                        {helpItem.description}
                      </Text>
                    </ColumnStackLayout>
                  </div>
                </CardWidget>
              </GridListTile>
            ))}
          </GridList>
        </Line>
      </SectionRow>
      {shouldShowInAppTutorialButtons && (
        <SectionRow>
          <Text noMargin size="section-title">
            <Trans>Guided lessons</Trans>
          </Text>
          <GuidedLessons selectInAppTutorial={selectInAppTutorial} />
        </SectionRow>
      )}
      <>
        <SectionRow>
          <Line noMargin>
            <Text size="title">
              <Trans>Courses</Trans>
            </Text>
          </Line>
          <Line noMargin>
            <Text noMargin>
              <Trans>Learn everything about GDevelop from the ground up</Trans>
            </Text>
          </Line>
        </SectionRow>
        <SectionRow>{renderTutorialsRow('official-beginner')}</SectionRow>
        <SectionRow>{renderTutorialsRow('official-intermediate')}</SectionRow>
        <SectionRow>{renderTutorialsRow('official-advanced')}</SectionRow>
        <SectionRow>
          <LineStackLayout
            justifyContent="space-between"
            alignItems="center"
            noMargin
            expand
          >
            <Column noMargin>
              <Text size="title">
                <Trans>Guides and tutorials</Trans>
              </Text>
            </Column>
            <LineStackLayout noMargin>
              {windowWidth === 'large' && (
                <FlatButton
                  onClick={() => {
                    Window.openExternalURL(
                      'https://github.com/GDevelopApp/GDevelop-examples/issues/new/choose'
                    );
                  }}
                  primary
                  leftIcon={<PublishIcon />}
                  label={<Trans>Submit your project as an example</Trans>}
                />
              )}
              {windowWidth === 'large' && (
                <FlatButton
                  onClick={() => {
                    Window.openExternalURL(
                      'https://airtable.com/shrv295oHlsuS69el'
                    );
                  }}
                  primary
                  leftIcon={<TranslateIcon />}
                  label={
                    <Trans>Submit a tutorial translated in your language</Trans>
                  }
                />
              )}
            </LineStackLayout>
          </LineStackLayout>
          <Line noMargin>
            <Text noMargin>
              <Trans>Learn by doing</Trans>
            </Text>
          </Line>
        </SectionRow>
        <SectionRow>{renderTutorialsRow('full-game')}</SectionRow>
        <SectionRow>{renderTutorialsRow('game-mechanic')}</SectionRow>
      </>
    </SectionContainer>
  );
};

export default MainPage;
