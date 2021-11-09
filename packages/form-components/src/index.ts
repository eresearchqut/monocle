import { RankedTester } from '@jsonforms/core';

import {
  InputAddressCell,
  inputAddressCellTester,
  InputBooleanCell,
  inputBooleanCellTester,
  InputCalendarCell,
  inputCalendarCellTester,
  InputCheckboxGroupCell,
  inputCheckboxGroupCellTester,
  InputCountryCell,
  inputCountryCellTester,
  InputMarkdownCell,
  inputMarkdownCellTester,
  InputMultilineTextCell,
  inputMultilineTextCellTester,
  InputMultiselectCell,
  inputMultiselectCellTester,
  InputNumberCell,
  inputNumberCellTester,
  InputRadioGroupCell,
  inputRadioGroupCellTester,
  InputRangeCell,
  inputRangeCellTester,
  InputSelectCell,
  inputSelectCellTester,
  InputSignatureCell,
  inputSignatureCellTester,
  InputTextCell,
  inputTextCellTester,
} from './cells';

import {
  InputBooleanControl,
  inputBooleanControlTester,
  InputControl,
  inputControlTester,
  SvgMapControl,
  svgMapControlTester,
} from './controls';
import {
  CategorizationLayout,
  categorizationLayoutTester,
  CategoryLayout,
  categoryLayoutTester,
  HorizontalLayout,
  horizontalLayoutTester,
  VerticalLayout,
  verticalLayoutTester,
} from './layouts';

export * from './controls';
export * from './cells';
export * from './layouts';

export const renderers: { tester: RankedTester; renderer: any }[] = [
  { tester: horizontalLayoutTester, renderer: HorizontalLayout },
  { tester: inputControlTester, renderer: InputControl },
  { tester: inputBooleanControlTester, renderer: InputBooleanControl },
  { tester: svgMapControlTester, renderer: SvgMapControl },
  { tester: verticalLayoutTester, renderer: VerticalLayout },
  { tester: categorizationLayoutTester, renderer: CategorizationLayout },
  { tester: categoryLayoutTester, renderer: CategoryLayout },
];

export const cells: { tester: RankedTester; cell: any }[] = [
  { tester: inputAddressCellTester, cell: InputAddressCell },
  { tester: inputCheckboxGroupCellTester, cell: InputCheckboxGroupCell },
  { tester: inputCountryCellTester, cell: InputCountryCell },

  { tester: inputBooleanCellTester, cell: InputBooleanCell },
  { tester: inputCalendarCellTester, cell: InputCalendarCell },
  { tester: inputNumberCellTester, cell: InputNumberCell },
  { tester: inputSelectCellTester, cell: InputSelectCell },
  { tester: inputRadioGroupCellTester, cell: InputRadioGroupCell },
  { tester: inputRangeCellTester, cell: InputRangeCell },
  { tester: inputTextCellTester, cell: InputTextCell },
  { tester: inputMarkdownCellTester, cell: InputMarkdownCell },
  { tester: inputMultilineTextCellTester, cell: InputMultilineTextCell },
  { tester: inputMultiselectCellTester, cell: InputMultiselectCell },
  { tester: inputSignatureCellTester, cell: InputSignatureCell },
];
