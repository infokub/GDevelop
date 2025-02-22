// @flow
import * as React from 'react';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

const styles = {
  row: {
    display: 'flex',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 4,
  },
};

type TreeTableRowProps = {|
  id?: string,
  children: React.Node,
  /* Allow to specify a different alignment than the default (centered). */
  alignItems?: ?'flex-start',
|};

export const TreeTableRow = (props: TreeTableRowProps) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <div
      id={props.id}
      style={{
        ...styles.row,
        alignItems: props.alignItems,
        backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
      }}
    >
      {props.children}
    </div>
  );
};

type TreeTableCellProps = {|
  style?: Object,
  expand?: boolean,
  children?: React.Node,
|};

export const TreeTableCell = (props: TreeTableCellProps) => (
  <div
    style={{
      ...styles.cell,
      flex: props.expand ? 1 : undefined,
      ...props.style,
    }}
  >
    {props.children}
  </div>
);
