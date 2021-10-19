import {RankedTester} from '@jsonforms/core';

import {
    InputBooleanCell,
    inputBooleanCellTester,
    InputCalendarCell,
    inputCalendarCellTester,
    InputNumberCell,
    inputNumberCellTester,
    InputRadioCell,
    inputRadioCellTester,
    InputRangeCell,
    inputRangeCellTester,
    InputSelectCell,
    inputSelectCellTester,
    InputTextCell,
    inputTextCellTester,
    InputMultilineTextCell,
    inputMultilineTextCellTester,
    InputMarkdownCell,
    inputMarkdownCellTester,
} from './cells';;


import {InputBooleanControl, inputBooleanControlTester, InputControl, inputControlTester, SvgMapControl, svgMapControlTester} from './controls';

import {HorizontalLayout, horizontalLayoutTester, VerticalLayout, verticalLayoutTester, CategorizationLayout, categorizationLayoutTester, CategoryLayout, categoryLayoutTester} from './layouts';

export * from './controls';
export * from './cells';
export * from './layouts';

export const renderers: { tester: RankedTester; renderer: any }[] = [
    {tester: horizontalLayoutTester, renderer: HorizontalLayout},
    {tester: inputControlTester, renderer: InputControl},
    {tester: inputBooleanControlTester, renderer: InputBooleanControl},
    {tester: svgMapControlTester, renderer: SvgMapControl},
    {tester: verticalLayoutTester, renderer: VerticalLayout},
    {tester: categorizationLayoutTester, renderer: CategorizationLayout},
    {tester: categoryLayoutTester, renderer: CategoryLayout},
];

export const cells: { tester: RankedTester; cell: any }[] = [
    {tester: inputBooleanCellTester, cell: InputBooleanCell},
    {tester: inputCalendarCellTester, cell: InputCalendarCell},
    {tester: inputNumberCellTester, cell: InputNumberCell},
    {tester: inputSelectCellTester, cell: InputSelectCell},
    {tester: inputRadioCellTester, cell: InputRadioCell},
    {tester: inputRangeCellTester, cell: InputRangeCell},
    {tester: inputTextCellTester, cell: InputTextCell},
    {tester: inputMarkdownCellTester, cell: InputMarkdownCell},
    {tester: inputMultilineTextCellTester, cell: InputMultilineTextCell}
];