// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import ResourcesList from '../ResourcesList';
import ResourcePropertiesEditor, {
  type ResourcePropertiesEditorInterface,
} from './ResourcePropertiesEditor';
import Toolbar from './Toolbar';
import EditorMosaic from '../UI/EditorMosaic';
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import {
  type ResourceManagementProps,
  type ResourceKind,
} from '../ResourcesList/ResourceSource';
import { getResourceFilePathStatus } from '../ResourcesList/ResourceUtils';

const gd: libGDevelop = global.gd;

const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;
const path = optionalRequire('path');
const styles = {
  container: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
};

type State = {|
  selectedResource: ?gdResource,
|};

type Props = {|
  setToolbar: React.Node => void,
  project: gdProject,
  onDeleteResource: (resource: gdResource, cb: (boolean) => void) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,
  resourceManagementProps: ResourceManagementProps,
|};

const initialMosaicEditorNodes = {
  direction: 'row',
  first: 'properties',
  second: 'resources-list',
  splitPercentage: 66,
};

export default class ResourcesEditor extends React.Component<Props, State> {
  static defaultProps = {
    setToolbar: () => {},
  };

  editorMosaic: ?EditorMosaic = null;
  _propertiesEditor: ?ResourcePropertiesEditorInterface = null;
  _resourcesList: ?ResourcesList = null;
  resourcesLoader = ResourcesLoader;
  state = {
    selectedResource: null,
  };

  refreshResourcesList() {
    if (this._resourcesList) this._resourcesList.forceUpdate();
  }

  updateToolbar = () => {
    const openedEditorNames = this.editorMosaic
      ? this.editorMosaic.getOpenedEditorNames()
      : [];

    this.props.setToolbar(
      <Toolbar
        onOpenProjectFolder={this.openProjectFolder}
        onToggleProperties={this.toggleProperties}
        isPropertiesShown={openedEditorNames.includes('properties')}
        canDelete={!!this.state.selectedResource}
        onDeleteSelection={() =>
          this.deleteResource(this.state.selectedResource)
        }
      />
    );
  };

  deleteResource = (resource: ?gdResource) => {
    const { project, onDeleteResource } = this.props;
    if (!resource) return;

    const answer = Window.showConfirmDialog(
      "Are you sure you want to remove this resource? This can't be undone."
    );
    if (!answer) return;

    onDeleteResource(resource, doRemove => {
      if (!doRemove || !resource) return;

      project.getResourcesManager().removeResource(resource.getName());
      this.setState(
        {
          selectedResource: null,
        },
        () => {
          // Force update of the resources list as otherwise it could render
          // resource that was just deleted.
          if (this._resourcesList) this._resourcesList.forceUpdateList();
          this.updateToolbar();
        }
      );
    });
  };

  _removeUnusedResources = (resourceKind: ResourceKind) => {
    const { project } = this.props;
    const selectedResourceName = this.state.selectedResource
      ? this.state.selectedResource.getName()
      : null;

    const removedResourceNames = gd.ProjectResourcesAdder.getAllUseless(
      project,
      resourceKind
    ).toJSArray();
    console.info(
      `Removing ${
        removedResourceNames.length
      } unused ${resourceKind} resource(s):`,
      removedResourceNames
    );

    gd.ProjectResourcesAdder.removeAllUseless(project, resourceKind);

    // The selectedResource might be *invalid* now if it was removed.
    // Be sure to drop the reference to it if that's the case.
    if (removedResourceNames.includes(selectedResourceName)) {
      this._onResourceSelected(null);
    }

    // Force update of the resources list as otherwise it could render
    // resources that were just deleted.
    if (this._resourcesList) {
      this._resourcesList.forceUpdateList();
    }
  };

  _removeAllResourcesWithInvalidPath = () => {
    const { project } = this.props;
    const selectedResourceName = this.state.selectedResource
      ? this.state.selectedResource.getName()
      : null;

    const resourcesManager = project.getResourcesManager();
    const removedResourceNames = resourcesManager
      .getAllResourceNames()
      .toJSArray()
      .filter(resourceName => {
        return getResourceFilePathStatus(project, resourceName) === 'error';
      });

    removedResourceNames.forEach(resourceName => {
      resourcesManager.removeResource(resourceName);
      console.info('Removed due to invalid path: ' + resourceName);
    });

    // The selectedResource might be *invalid* now if it was removed.
    // Be sure to drop the reference to it if that's the case.
    if (removedResourceNames.includes(selectedResourceName)) {
      this._onResourceSelected(null);
    }

    // Force update of the resources list as otherwise it could render
    // resources that were just deleted.
    if (this._resourcesList) {
      this._resourcesList.forceUpdateList();
    }
  };

  openProjectFolder = () => {
    const project = this.props.project;
    if (shell) shell.openPath(path.dirname(project.getProjectFile()));
  };

  toggleProperties = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.toggleEditor('properties', 'start', 66, 'column');
  };

  _onResourceSelected = (selectedResource: ?gdResource) => {
    this.setState(
      {
        selectedResource,
      },
      () => {
        if (this._propertiesEditor) this._propertiesEditor.forceUpdate();
        this.updateToolbar();
      }
    );
  };

  render() {
    const { project, onRenameResource, resourceManagementProps } = this.props;
    const { selectedResource } = this.state;

    const editors = {
      properties: {
        type: 'secondary',
        title: t`Properties`,
        renderEditor: () => (
          <ResourcePropertiesEditor
            key={selectedResource ? selectedResource.ptr : undefined}
            resources={selectedResource ? [selectedResource] : []}
            project={project}
            resourcesLoader={this.resourcesLoader}
            ref={propertiesEditor =>
              (this._propertiesEditor = propertiesEditor)
            }
            onResourcePathUpdated={() => {
              if (this._resourcesList) {
                this._resourcesList.checkMissingPaths();
              }
            }}
            resourceManagementProps={resourceManagementProps}
          />
        ),
      },
      'resources-list': {
        type: 'primary',
        noTitleBar: true,
        renderEditor: () => (
          <ResourcesList
            project={project}
            onDeleteResource={this.deleteResource}
            onRenameResource={onRenameResource}
            onSelectResource={this._onResourceSelected}
            selectedResource={selectedResource}
            ref={resourcesList => (this._resourcesList = resourcesList)}
            onRemoveUnusedResources={this._removeUnusedResources}
            onRemoveAllResourcesWithInvalidPath={
              this._removeAllResourcesWithInvalidPath
            }
          />
        ),
      },
    };

    return (
      <div style={styles.container}>
        <PreferencesContext.Consumer>
          {({ getDefaultEditorMosaicNode, setDefaultEditorMosaicNode }) => (
            <EditorMosaic
              editors={editors}
              ref={editorMosaic => (this.editorMosaic = editorMosaic)}
              initialNodes={
                getDefaultEditorMosaicNode('resources-editor') ||
                initialMosaicEditorNodes
              }
              onOpenedEditorsChanged={this.updateToolbar}
              onPersistNodes={node =>
                setDefaultEditorMosaicNode('resources-editor', node)
              }
            />
          )}
        </PreferencesContext.Consumer>
      </div>
    );
  }
}
