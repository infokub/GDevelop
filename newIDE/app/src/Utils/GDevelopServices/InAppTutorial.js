// @flow

import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import optionalRequire from '../OptionalRequire';
import { type MessageDescriptor } from '../i18n/MessageDescriptor.flow';
import { type MessageByLocale } from '../i18n/MessageByLocale';
import Window from '../Window';
const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('path');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

export const FLING_GAME_IN_APP_TUTORIAL_ID = 'flingGame';
export const PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID = 'plinkoMultiplier';
export const CAMERA_PARALLAX_IN_APP_TUTORIAL_ID = 'cameraParallax';
export const HEALTH_BAR_IN_APP_TUTORIAL_ID = 'healthBar';

export const allInAppTutorialIds = [
  FLING_GAME_IN_APP_TUTORIAL_ID,
  PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
  CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
  HEALTH_BAR_IN_APP_TUTORIAL_ID,
];

export type InAppTutorialShortHeader = {|
  id: string,
  contentUrl: string,
  availableLocales: Array<string>,
  initialTemplateUrl?: string,
  initialProjectData?: { [key: string]: string },
|};

export type EditorIdentifier =
  | 'Scene'
  | 'EventsSheet'
  | 'Home'
  | 'ExternalEvents'
  | 'ExternalLayout'
  | 'Extension'
  | 'Resources';

export type TranslatedText =
  | {| messageDescriptor: MessageDescriptor |}
  | {| messageByLocale: MessageByLocale |};

type InAppTutorialFlowStepDOMChangeTrigger =
  | {| presenceOfElement: string |}
  | {| absenceOfElement: string |};

export type InAppTutorialFlowStepTrigger =
  | InAppTutorialFlowStepDOMChangeTrigger
  | {| editorIsActive: string |}
  | {| valueHasChanged: true |}
  | {| valueEquals: string |}
  | {| instanceAddedOnScene: string, instancesCount?: number |}
  | {| previewLaunched: true |}
  | {| clickOnTooltipButton: TranslatedText |};

export type InAppTutorialFlowStepFormattedTrigger =
  | InAppTutorialFlowStepDOMChangeTrigger
  | {| valueEquals: string |}
  | {| valueHasChanged: true |}
  | {| instanceAddedOnScene: string, instancesCount?: number |}
  | {| previewLaunched: true |}
  | {| clickOnTooltipButton: string |};

export type InAppTutorialTooltip = {|
  standalone?: true,
  placement?: 'bottom' | 'left' | 'right' | 'top',
  title?: TranslatedText,
  description?: TranslatedText,
  image?: { dataUrl: string, width?: string },
|};

export type InAppTutorialFormattedTooltip = {|
  ...InAppTutorialTooltip,
  title?: string,
  description?: string,
|};

export type InAppTutorialDialog = {|
  content: Array<
    TranslatedText | {| image: {| imageSource: string, linkHref?: string |} |}
  >,
|};

export type InAppTutorialFlowStep = {|
  elementToHighlightId?: string,
  id?: string,
  isTriggerFlickering?: true,
  isCheckpoint?: true,
  deprecated?: true,
  nextStepTrigger?: InAppTutorialFlowStepTrigger,
  shortcuts?: Array<{|
    stepId: string,
    // TODO: Adapt provider to make it possible to use other triggers as shortcuts
    trigger: InAppTutorialFlowStepDOMChangeTrigger,
  |}>,
  dialog?: InAppTutorialDialog,
  mapProjectData?: {
    [key: string]: 'projectLastSceneName' | string, // string represents accessors with parameters such as lastSceneObjectName:{sceneName}
  },
  tooltip?: InAppTutorialTooltip,
  skippable?: true,
  isOnClosableDialog?: true,
|};

export type InAppTutorialFlowFormattedStep = {|
  ...InAppTutorialFlowStep,
  tooltip?: InAppTutorialFormattedTooltip,
  nextStepTrigger?: InAppTutorialFlowStepFormattedTrigger,
|};

export type InAppTutorial = {|
  id: string,
  flow: Array<InAppTutorialFlowStep>,
  editorSwitches: {
    [stepId: string]: {| editor: EditorIdentifier, scene?: string |},
  },
  endDialog: InAppTutorialDialog,
  availableLocales?: Array<string>,
|};

const readJSONFile = async (filepath: string): Promise<Object> => {
  if (!fsPromises) throw new Error('Filesystem is not supported.');

  try {
    const data = await fsPromises.readFile(filepath, { encoding: 'utf8' });
    const dataObject = JSON.parse(data);
    return dataObject;
  } catch (ex) {
    throw new Error(filepath + ' is a corrupted/malformed file.');
  }
};

const fetchLocalFileIfDesktop = async (filename: string): Promise<?Object> => {
  const shouldRetrieveTutorialsLocally = !!remote && !Window.isDev();
  if (!shouldRetrieveTutorialsLocally) return null;

  const appPath = app ? app.getAppPath() : process.cwd();
  // If on desktop released version, find json in resources.
  // This allows making it available offline, and also to fix a version of the
  // tutorials (so that it's not broken by a new version of GDevelop).
  const filePath = path.join(
    appPath,
    '..', // If on dev env, replace with '../../app/resources' to test.
    `inAppTutorials/${filename}.json`
  );
  const data = await readJSONFile(filePath);
  return data;
};

export const fetchInAppTutorialShortHeaders = async (): Promise<
  Array<InAppTutorialShortHeader>
> => {
  try {
    const inAppTutorialShortHeadersStoredLocally = await fetchLocalFileIfDesktop(
      'inAppTutorialShortHeaders'
    );
    if (inAppTutorialShortHeadersStoredLocally)
      return inAppTutorialShortHeadersStoredLocally;
  } catch (error) {
    console.warn(
      'Could not read the short headers stored locally. Trying to fetch the API.'
    );
  }

  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/in-app-tutorial-short-header`
  );
  return response.data;
};

export const fetchInAppTutorial = async (
  shortHeader: InAppTutorialShortHeader
): Promise<InAppTutorial> => {
  try {
    const inAppTutorialStoredLocally = await fetchLocalFileIfDesktop(
      shortHeader.id
    );
    if (inAppTutorialStoredLocally) return inAppTutorialStoredLocally;
  } catch (error) {
    console.warn(
      'Could not read the in app tutorial stored locally. Trying to fetch the API.'
    );
  }

  const response = await axios.get(shortHeader.contentUrl);
  return response.data;
};

export const isMiniTutorial = (tutorialId: string) =>
  [
    PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
    CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
    HEALTH_BAR_IN_APP_TUTORIAL_ID,
  ].includes(tutorialId);
