// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { TableRow, TableRowColumn } from '../../../../UI/Table';
import IconButton from '../../../../UI/IconButton';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import SemiControlledTextField from '../../../../UI/SemiControlledTextField';
import Text from '../../../../UI/Text';
import { roundTo } from '../../../../Utils/Mathematics';
import { Column } from '../../../../UI/Grid';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import styles from './styles';

const POINT_COORDINATE_PRECISION = 4;

type Props = {|
  pointName: string,
  nameError?: boolean,
  onChangePointName?: (newName: string) => void,
  onRemove?: ?(ev: any) => void,
  onEdit?: ?(ev: any) => void,
  onClick: (pointName: string) => void,
  onPointerEnter: (pointName: ?string) => void,
  onPointerLeave: (pointName: ?string) => void,
  selected: boolean,
  pointX: number,
  pointY: number,
  onChangePointX: (value: number) => void,
  onChangePointY: (value: number) => void,
  isAutomatic?: boolean,
|};

const PointRow = ({ pointX, pointY, ...props }: Props) => {
  const muiTheme = React.useContext(GDevelopThemeContext);
  return (
    <TableRow
      style={{
        backgroundColor: props.selected
          ? muiTheme.listItem.selectedBackgroundColor
          : muiTheme.list.itemsBackgroundColor,
      }}
      onClick={() => props.onClick(props.pointName)}
      onPointerEnter={() => props.onPointerEnter(props.pointName)}
      onPointerLeave={props.onPointerLeave}
    >
      <TableRowColumn style={styles.nameColumn}>
        <SemiControlledTextField
          margin="none"
          inputStyle={
            props.selected
              ? { color: muiTheme.listItem.selectedTextColor }
              : undefined
          }
          value={props.pointName}
          id={props.pointName}
          fullWidth
          errorText={props.nameError ? 'This name is already taken' : undefined}
          disabled={!props.onChangePointName}
          commitOnBlur
          onChange={props.onChangePointName || (newName => {})}
        />
      </TableRowColumn>
      <TableRowColumn style={styles.coordinateColumn} padding="none">
        <Column>
          {!props.isAutomatic ? (
            <SemiControlledTextField
              margin="none"
              inputStyle={
                props.selected
                  ? { color: muiTheme.listItem.selectedTextColor }
                  : undefined
              }
              value={roundTo(pointX, POINT_COORDINATE_PRECISION).toString()}
              type="number"
              id="point-x"
              onChange={value => {
                const valueAsNumber = parseFloat(value);
                if (!isNaN(valueAsNumber)) props.onChangePointX(valueAsNumber);
              }}
              onBlur={event => {
                props.onChangePointX(
                  parseFloat(event.currentTarget.value) || 0
                );
              }}
            />
          ) : (
            <Text noMargin>
              <Trans>(auto)</Trans>
            </Text>
          )}
        </Column>
      </TableRowColumn>
      <TableRowColumn style={styles.coordinateColumn} padding="none">
        <Column>
          {!props.isAutomatic ? (
            <SemiControlledTextField
              margin="none"
              inputStyle={
                props.selected
                  ? { color: muiTheme.listItem.selectedTextColor }
                  : undefined
              }
              value={roundTo(pointY, POINT_COORDINATE_PRECISION).toString()}
              type="number"
              id="point-y"
              onChange={value => {
                const valueAsNumber = parseFloat(value);
                if (!isNaN(valueAsNumber)) props.onChangePointY(valueAsNumber);
              }}
              onBlur={event => {
                props.onChangePointY(
                  parseFloat(event.currentTarget.value) || 0
                );
              }}
            />
          ) : (
            <Text noMargin>
              <Trans>(auto)</Trans>
            </Text>
          )}
        </Column>
      </TableRowColumn>
      <TableRowColumn style={styles.toolColumn}>
        {!!props.onRemove && (
          <IconButton size="small" onClick={props.onRemove}>
            <Delete />
          </IconButton>
        )}
        {!!props.onEdit && (
          <IconButton size="small" onClick={props.onEdit}>
            <Edit />
          </IconButton>
        )}
      </TableRowColumn>
    </TableRow>
  );
};

export default PointRow;
