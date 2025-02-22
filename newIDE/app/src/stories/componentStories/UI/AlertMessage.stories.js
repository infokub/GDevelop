// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import AlertMessage from '../../../UI/AlertMessage';

export default {
  title: 'AlertMessage',
  component: AlertMessage,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AlertMessage>Hello World, this is an alert text</AlertMessage>
);

export const Info = () => (
  <AlertMessage kind="info">
    Hello World, this is an info alert text
  </AlertMessage>
);

export const Warning = () => (
  <AlertMessage kind="warning">
    Hello World, this is a warning alert text
  </AlertMessage>
);

export const Error = () => (
  <AlertMessage kind="error">
    Hello World, this is an error alert text
  </AlertMessage>
);

export const InfoWithButton = () => (
  <AlertMessage kind="info" onHide={() => {}}>
    Hello World, this is an alert text
  </AlertMessage>
);

export const InfoWithLongText = () => (
  <AlertMessage kind="info">
    Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at cibo
    erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat nostrum eos
    ne, elit virtute appetere cu sea. Ut nec erat maluisset argumentum, duo
    integre propriae ut. Sed cu eius sonet verear, ne sit legendos senserit. Ne
    mel mundi perpetua dissentiunt. Nec ei nusquam inimicus.
  </AlertMessage>
);

export const InfoLongTextWithButton = () => (
  <AlertMessage kind="info" onHide={() => {}}>
    Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at cibo
    erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat nostrum eos
    ne, elit virtute appetere cu sea. Ut nec erat maluisset argumentum, duo
    integre propriae ut. Sed cu eius sonet verear, ne sit legendos senserit. Ne
    mel mundi perpetua dissentiunt. Nec ei nusquam inimicus.
  </AlertMessage>
);

export const InfoLongTextWithIcon = () => (
  <AlertMessage
    kind="info"
    renderLeftIcon={() => (
      <img
        src="res/tutorial_icons/tween-behavior.jpg"
        alt=""
        style={{
          maxWidth: 128,
          maxHeight: 128,
        }}
      />
    )}
    onHide={() => {}}
  >
    Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at cibo
    erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat nostrum eos
    ne, elit virtute appetere cu sea. Ut nec erat maluisset argumentum, duo
    integre propriae ut. Sed cu eius sonet verear, ne sit legendos senserit. Ne
    mel mundi perpetua dissentiunt. Nec ei nusquam inimicus.
  </AlertMessage>
);
