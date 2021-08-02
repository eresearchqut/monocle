import {RankedTester} from '@jsonforms/core';

import {
    InputBooleanCell,
    inputBooleanCellTester,
    InputDateCell,
    inputDateCellTester,
    InputNumberCell,
    inputNumberCellTester,
    InputTextCell,
    inputTextCellTester,
    InputTextareaCell,
    inputTextareaCellTester
} from './cells';

import {InputControl, inputControlTester} from './controls';

import {
    ArrayLayout,
    arrayLayoutTester,
    HorizontalLayout,
    horizontalLayoutTester,
    VerticalLayout,
    verticalLayoutTester
} from './layouts';

export * from './controls';
export * from './cells';
export * from './layouts';


export const renderers: { tester: RankedTester; renderer: any }[] = [
    {tester: arrayLayoutTester, renderer: ArrayLayout},
    {tester: horizontalLayoutTester, renderer: HorizontalLayout},
    {tester: inputControlTester, renderer: InputControl},
    {tester: verticalLayoutTester, renderer: VerticalLayout}
];

export const cells: { tester: RankedTester; cell: any }[] = [
    {tester: inputBooleanCellTester, cell: InputBooleanCell},
    {tester: inputDateCellTester, cell: InputDateCell},
    {tester: inputNumberCellTester, cell: InputNumberCell},
    {tester: inputTextCellTester, cell: InputTextCell},
    {tester: inputTextareaCellTester, cell: InputTextareaCell},
];


