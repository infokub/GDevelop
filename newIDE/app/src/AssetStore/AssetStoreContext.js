// @flow
import * as React from 'react';
import { type Filters } from '../Utils/GDevelopServices/Filters';
import {
  type AssetShortHeader,
  type PublicAssetPacks,
  type Author,
  type License,
  type Environment,
  listAllPublicAssets,
  listAllAuthors,
  listAllLicenses,
} from '../Utils/GDevelopServices/Asset';
import {
  listListedPrivateAssetPacks,
  type PrivateAssetPackListingData,
} from '../Utils/GDevelopServices/Shop';
import { useSearchItem, SearchFilter } from '../UI/Search/UseSearchItem';
import {
  TagAssetStoreSearchFilter,
  AnimatedAssetStoreSearchFilter,
  ObjectTypeAssetStoreSearchFilter,
  ColorAssetStoreSearchFilter,
  LicenseAssetStoreSearchFilter,
  DimensionAssetStoreSearchFilter,
} from './AssetStoreSearchFilter';
import {
  type NavigationState,
  type AssetStorePageState,
  useNavigation,
  assetStoreHomePageState,
} from './AssetStoreNavigator';
import { type ChosenCategory } from '../UI/Search/FiltersChooser';
import shuffle from 'lodash/shuffle';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  getAssetPackFromUserFriendlySlug,
  getPrivateAssetPackListingData,
} from './AssetStoreUtils';
import useAlertDialog from '../UI/Alert/useAlertDialog';

const defaultSearchText = '';

export type AssetFiltersState = {|
  animatedFilter: AnimatedAssetStoreSearchFilter,
  setAnimatedFilter: AnimatedAssetStoreSearchFilter => void,
  viewpointFilter: TagAssetStoreSearchFilter,
  setViewpointFilter: TagAssetStoreSearchFilter => void,
  dimensionFilter: DimensionAssetStoreSearchFilter,
  setDimensionFilter: DimensionAssetStoreSearchFilter => void,
  objectTypeFilter: ObjectTypeAssetStoreSearchFilter,
  setObjectTypeFilter: ObjectTypeAssetStoreSearchFilter => void,
  colorFilter: ColorAssetStoreSearchFilter,
  setColorFilter: ColorAssetStoreSearchFilter => void,
  licenseFilter: LicenseAssetStoreSearchFilter,
  setLicenseFilter: LicenseAssetStoreSearchFilter => void,
|};

type AssetStoreState = {|
  filters: ?Filters,
  publicAssetPacks: ?PublicAssetPacks,
  privateAssetPacks: ?Array<PrivateAssetPackListingData>,
  assetPackRandomOrdering: ?Array<number>,
  authors: ?Array<Author>,
  licenses: ?Array<License>,
  environment: Environment,
  setEnvironment: Environment => void,
  searchResults: ?Array<AssetShortHeader>,
  fetchAssetsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  assetFiltersState: AssetFiltersState,
  navigationState: NavigationState,
  currentPage: AssetStorePageState,
  useSearchItem: (
    searchText: string,
    chosenCategory: ?ChosenCategory,
    chosenFilters: ?Set<string>,
    searchFilters: Array<SearchFilter<AssetShortHeader>>
  ) => ?Array<AssetShortHeader>,
  setInitialPackUserFriendlySlug: (initialPackUserFriendlySlug: string) => void,
|};

export const AssetStoreContext = React.createContext<AssetStoreState>({
  filters: null,
  publicAssetPacks: null,
  privateAssetPacks: null,
  assetPackRandomOrdering: null,
  authors: null,
  licenses: null,
  environment: 'live',
  setEnvironment: () => {},
  searchResults: null,
  fetchAssetsAndFilters: () => {},
  error: null,
  searchText: '',
  setSearchText: () => {},
  assetFiltersState: {
    animatedFilter: new AnimatedAssetStoreSearchFilter(),
    setAnimatedFilter: filter => {},
    viewpointFilter: new TagAssetStoreSearchFilter(),
    setViewpointFilter: filter => {},
    dimensionFilter: new DimensionAssetStoreSearchFilter(),
    setDimensionFilter: filter => {},
    objectTypeFilter: new ObjectTypeAssetStoreSearchFilter(),
    setObjectTypeFilter: filter => {},
    colorFilter: new ColorAssetStoreSearchFilter(),
    setColorFilter: filter => {},
    licenseFilter: new LicenseAssetStoreSearchFilter(),
    setLicenseFilter: filter => {},
  },
  navigationState: {
    getCurrentPage: () => assetStoreHomePageState,
    backToPreviousPage: () => assetStoreHomePageState,
    openHome: () => assetStoreHomePageState,
    clearHistory: () => {},
    openSearchResultPage: () => {},
    openTagPage: tag => {},
    openAssetCategoryPage: category => {},
    openPackPage: assetPack => {},
    openDetailPage: assetShortHeader => {},
    openPrivateAssetPackInformationPage: privateAssetPackListingData => {},
  },
  currentPage: assetStoreHomePageState,
  useSearchItem: (searchText, chosenCategory, chosenFilters, searchFilters) =>
    null,
  setInitialPackUserFriendlySlug: (initialPackUserFriendlySlug: string) => {},
});

type AssetStoreStateProviderProps = {|
  children: React.Node,
|};

const getAssetShortHeaderSearchTerms = (assetShortHeader: AssetShortHeader) => {
  return (
    assetShortHeader.name +
    '\n' +
    assetShortHeader.shortDescription +
    '\n' +
    assetShortHeader.tags.join(', ')
  );
};

const getAssetPackRandomOrdering = (length: number): Array<number> => {
  const array = new Array(length).fill(0).map((_, index) => index);

  return shuffle(array);
};

export const AssetStoreStateProvider = ({
  children,
}: AssetStoreStateProviderProps) => {
  const [assetShortHeadersById, setAssetShortHeadersById] = React.useState<?{
    [string]: AssetShortHeader,
  }>(null);
  const [
    publicAssetShortHeaders,
    setPublicAssetShortHeaders,
  ] = React.useState<?Array<AssetShortHeader>>(null);
  const { receivedAssetShortHeaders, receivedAssetPacks } = React.useContext(
    AuthenticatedUserContext
  );
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [
    publicAssetPacks,
    setPublicAssetPacks,
  ] = React.useState<?PublicAssetPacks>(null);
  const [
    assetPackRandomOrdering,
    setAssetPackRandomOrdering,
  ] = React.useState<?Array<number>>(null);
  const [
    privateAssetPacks,
    setPrivateAssetPacks,
  ] = React.useState<?Array<PrivateAssetPackListingData>>(null);
  const [authors, setAuthors] = React.useState<?Array<Author>>(null);
  const [licenses, setLicenses] = React.useState<?Array<License>>(null);
  const [environment, setEnvironment] = React.useState<Environment>('live');
  const [error, setError] = React.useState<?Error>(null);
  const initialPackUserFriendlySlug = React.useRef<?string>(null);
  const initialPackOpened = React.useRef<boolean>(false);
  const { showAlert } = useAlertDialog();

  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const navigationState = useNavigation();

  const [
    animatedFilter,
    setAnimatedFilter,
  ] = React.useState<AnimatedAssetStoreSearchFilter>(
    new AnimatedAssetStoreSearchFilter()
  );
  const [
    viewpointFilter,
    setViewpointFilter,
  ] = React.useState<TagAssetStoreSearchFilter>(
    new TagAssetStoreSearchFilter()
  );
  const [
    dimensionFilter,
    setDimensionFilter,
  ] = React.useState<DimensionAssetStoreSearchFilter>(
    new DimensionAssetStoreSearchFilter()
  );
  const [
    objectTypeFilter,
    setObjectTypeFilter,
  ] = React.useState<ObjectTypeAssetStoreSearchFilter>(
    new ObjectTypeAssetStoreSearchFilter()
  );
  const [
    colorFilter,
    setColorFilter,
  ] = React.useState<ColorAssetStoreSearchFilter>(
    new ColorAssetStoreSearchFilter()
  );
  const [
    licenseFilter,
    setLicenseFilter,
  ] = React.useState<LicenseAssetStoreSearchFilter>(
    new LicenseAssetStoreSearchFilter()
  );
  // When one of the filter change, we need to rebuild the array
  // for the search.
  const searchFilters = React.useMemo<Array<SearchFilter<AssetShortHeader>>>(
    () => [
      animatedFilter,
      viewpointFilter,
      dimensionFilter,
      objectTypeFilter,
      colorFilter,
      licenseFilter,
    ],
    [
      animatedFilter,
      viewpointFilter,
      dimensionFilter,
      objectTypeFilter,
      colorFilter,
      licenseFilter,
    ]
  );

  const fetchAssetsAndFilters = React.useCallback(
    () => {
      (async () => {
        setError(null);

        try {
          const {
            publicAssetShortHeaders,
            publicFilters,
            publicAssetPacks,
          } = await listAllPublicAssets({ environment });
          const authors = await listAllAuthors({ environment });
          const licenses = await listAllLicenses({ environment });
          const privateAssetPacks = await listListedPrivateAssetPacks();

          console.info(
            `Loaded ${
              publicAssetShortHeaders ? publicAssetShortHeaders.length : 0
            } assets from the asset store.`
          );
          setPublicAssetPacks(publicAssetPacks);
          setPublicAssetShortHeaders(publicAssetShortHeaders);
          setFilters(publicFilters);
          setAuthors(authors);
          setLicenses(licenses);
          setPrivateAssetPacks(privateAssetPacks);
        } catch (error) {
          console.error(
            `Unable to load the assets from the asset store:`,
            error
          );
          setError(error);
        }
      })();
    },
    [environment]
  );

  // When the public assets or the private assets are loaded, regenerate the
  // list of all assets by ids.
  React.useEffect(
    () => {
      const assetShortHeadersById = {};
      if (publicAssetShortHeaders) {
        publicAssetShortHeaders.forEach(assetShortHeader => {
          assetShortHeadersById[assetShortHeader.id] = assetShortHeader;
        });
      }
      if (receivedAssetShortHeaders) {
        receivedAssetShortHeaders.forEach(assetShortHeader => {
          assetShortHeadersById[assetShortHeader.id] = assetShortHeader;
        });
      }
      if (Object.keys(assetShortHeadersById).length > 0) {
        setAssetShortHeadersById(assetShortHeadersById);
      }
    },
    [publicAssetShortHeaders, receivedAssetShortHeaders]
  );

  // When the asset packs (public and received private packs) are loaded,
  // open the asset pack with the slug that was asked to be initially loaded.
  React.useEffect(
    () => {
      if (initialPackOpened.current) {
        // The pack was already opened, don't re-open it again even
        // if the effect run again.
        return;
      }

      const userFriendlySlug = initialPackUserFriendlySlug.current;
      if (
        publicAssetPacks &&
        receivedAssetPacks &&
        privateAssetPacks &&
        userFriendlySlug
      ) {
        initialPackOpened.current = true;

        // Try to first find a public or received asset pack.
        const assetPack = getAssetPackFromUserFriendlySlug({
          publicAssetPacks,
          receivedAssetPacks,
          userFriendlySlug,
        });

        if (assetPack) {
          navigationState.openPackPage(assetPack);
          return;
        }

        // Otherwise, try to open the information page of a pack not yet bought.
        const privateAssetPack = getPrivateAssetPackListingData({
          privateAssetPacks,
          userFriendlySlug,
        });

        if (privateAssetPack) {
          navigationState.openPrivateAssetPackInformationPage(privateAssetPack);
          return;
        }

        showAlert({
          title: `Asset pack not found`,
          message: `The link to the asset pack you've followed seems outdated. Why not take a look at the other packs in the asset store?`,
        });
      }
    },
    [
      publicAssetPacks,
      receivedAssetPacks,
      privateAssetPacks,
      navigationState,
      showAlert,
    ]
  );

  React.useEffect(
    () => {
      // the callback fetchAssetsAndFilters depends on the environment,
      // so it will be called again if the environment changes.
      fetchAssetsAndFilters();
    },
    [fetchAssetsAndFilters]
  );

  // Randomize asset packs when number of asset packs and private asset packs change
  const assetPackCount = publicAssetPacks
    ? publicAssetPacks.starterPacks.length
    : undefined;
  const privateAssetPackCount = privateAssetPacks
    ? privateAssetPacks.length
    : undefined;
  React.useEffect(
    () => {
      if (assetPackCount === undefined || privateAssetPackCount === undefined) {
        return;
      }
      setAssetPackRandomOrdering(
        getAssetPackRandomOrdering(assetPackCount + privateAssetPackCount)
      );
    },
    [assetPackCount, privateAssetPackCount]
  );

  const currentPage = navigationState.getCurrentPage();
  const { chosenCategory, chosenFilters } = currentPage.filtersState;
  const searchResults: ?Array<AssetShortHeader> = useSearchItem(
    assetShortHeadersById,
    getAssetShortHeaderSearchTerms,
    searchText,
    chosenCategory,
    chosenFilters,
    searchFilters
  );

  const setInitialPackUserFriendlySlug = React.useCallback(
    (newInitialPackUserFriendlySlug: string) => {
      initialPackUserFriendlySlug.current = newInitialPackUserFriendlySlug;
    },
    []
  );

  const assetStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchAssetsAndFilters,
      filters,
      publicAssetPacks,
      privateAssetPacks,
      assetPackRandomOrdering,
      authors,
      licenses,
      environment,
      setEnvironment,
      error,
      navigationState,
      currentPage,
      searchText,
      setSearchText,
      assetFiltersState: {
        animatedFilter,
        setAnimatedFilter,
        viewpointFilter,
        setViewpointFilter,
        dimensionFilter,
        setDimensionFilter,
        objectTypeFilter,
        setObjectTypeFilter,
        colorFilter,
        setColorFilter,
        licenseFilter,
        setLicenseFilter,
      },
      useSearchItem: (
        searchText,
        chosenCategory,
        chosenFilters,
        searchFilters
      ) =>
        useSearchItem(
          assetShortHeadersById,
          getAssetShortHeaderSearchTerms,
          searchText,
          chosenCategory,
          chosenFilters,
          searchFilters
        ),
      setInitialPackUserFriendlySlug,
    }),
    [
      searchResults,
      fetchAssetsAndFilters,
      filters,
      publicAssetPacks,
      privateAssetPacks,
      assetPackRandomOrdering,
      authors,
      licenses,
      environment,
      setEnvironment,
      error,
      navigationState,
      currentPage,
      searchText,
      animatedFilter,
      viewpointFilter,
      dimensionFilter,
      objectTypeFilter,
      colorFilter,
      licenseFilter,
      setLicenseFilter,
      assetShortHeadersById,
      setInitialPackUserFriendlySlug,
    ]
  );

  return (
    <AssetStoreContext.Provider value={assetStoreState}>
      {children}
    </AssetStoreContext.Provider>
  );
};
