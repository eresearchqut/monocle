import { RankedTester } from '@jsonforms/core';

import {
  InputCell,
  inputCellTester
} from './cells';


import {
  HorizontalLayout,
  horizontalLayoutTester,
  VerticalLayout,
  verticalLayoutTester
} from './layouts';


export * from './controls';
export * from './cells';
export * from './layouts';

export const renderers: { tester: RankedTester; renderer: any }[] = [
  { tester: verticalLayoutTester, renderer: VerticalLayout },
  { tester: horizontalLayoutTester, renderer: HorizontalLayout }
];

export const cells: { tester: RankedTester; cell: any }[] = [
  { tester: inputCellTester, cell: InputCell },
];
