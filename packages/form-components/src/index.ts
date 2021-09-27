import {RankedTester} from '@jsonforms/core';

import {
    InputBooleanCell,
    inputBooleanCellTester,
    InputDateCell,
    inputDateCellTester,
    InputNumberCell,
    inputNumberCellTester,
    InputSelectCell,
    inputSelectCellTester,
    InputTextareaCell,
    inputTextareaCellTester,
    InputTextCell,
    inputTextCellTester,

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
    {tester: inputDateCellTester, cell: InputDateCell},
    {tester: inputNumberCellTester, cell: InputNumberCell},
    {tester: inputSelectCellTester, cell: InputSelectCell},
    {tester: inputTextCellTester, cell: InputTextCell},
    {tester: inputTextareaCellTester, cell: InputTextareaCell}
];