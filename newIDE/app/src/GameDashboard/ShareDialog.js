// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Column } from '../UI/Grid';
import InfoBar from '../UI/Messages/InfoBar';
import SocialShareButtons from '../UI/ShareDialog/SocialShareButtons';
import ShareLink from '../UI/ShareDialog/ShareLink';

import { type Game, getGameUrl } from '../Utils/GDevelopServices/Game';
import AlertMessage from '../UI/AlertMessage';
import ShareButton from '../UI/ShareDialog/ShareButton';

type Props = {| game: Game, onClose: () => void |};

const ShareDialog = ({ game, onClose }: Props) => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState(false);
  const [showAlertMessage, setShowAlertMessage] = React.useState(false);
  const gameUrl = getGameUrl(game);

  if (!gameUrl) return null;
  return (
    <Dialog
      title={<Trans>Share your game</Trans>}
      open
      id="game-card-share-dialog"
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
    >
      <Column>
        <ShareLink url={gameUrl} />
        {navigator.share ? (
          <ShareButton url={gameUrl} />
        ) : (
          <SocialShareButtons url={gameUrl} />
        )}
      </Column>
      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
      {showAlertMessage && (
        <AlertMessage kind="error" onHide={() => setShowAlertMessage(false)}>
          <Trans>
            An error occured while generating the game url with the currently
            set game slug.
          </Trans>
        </AlertMessage>
      )}
    </Dialog>
  );
};

export default ShareDialog;
