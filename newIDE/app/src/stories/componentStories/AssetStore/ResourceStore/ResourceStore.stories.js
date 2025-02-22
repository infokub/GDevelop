// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { ResourceStoreStateProvider } from '../../../../AssetStore/ResourceStore/ResourceStoreContext';
import { ResourceStore } from '../../../../AssetStore/ResourceStore';

export default {
  title: 'AssetStore/ResourceStore',
  component: ResourceStore,
  decorators: [paperDecorator, muiDecorator],
};

export const ImageResource = () => (
  <FixedHeightFlexContainer height={400}>
    <ResourceStoreStateProvider>
      <ResourceStore onChoose={action('onChoose')} resourceKind="image" />
    </ResourceStoreStateProvider>
  </FixedHeightFlexContainer>
);

export const AudioResource = () => (
  <FixedHeightFlexContainer height={400}>
    <ResourceStoreStateProvider>
      <ResourceStore onChoose={action('onChoose')} resourceKind="audio" />
    </ResourceStoreStateProvider>
  </FixedHeightFlexContainer>
);

export const FontResource = () => (
  <FixedHeightFlexContainer height={400}>
    <ResourceStoreStateProvider>
      <ResourceStore onChoose={action('onChoose')} resourceKind="font" />
    </ResourceStoreStateProvider>
  </FixedHeightFlexContainer>
);

export const SvgResource = () => (
  <FixedHeightFlexContainer height={400}>
    <ResourceStoreStateProvider>
      <ResourceStore onChoose={action('onChoose')} resourceKind="svg" />
    </ResourceStoreStateProvider>
  </FixedHeightFlexContainer>
);
