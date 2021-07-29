import {RankedTester} from '@jsonforms/core';

import {
    InputTextCell,
    inputTextCellTester,
    InputTextareaCell,
    inputTextareaCellTester
} from './cells';

import {InputControl, inputControlTester} from './controls';

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
    {tester: inputControlTester, renderer: InputControl},
    {tester: verticalLayoutTester, renderer: VerticalLayout},
    {tester: horizontalLayoutTester, renderer: HorizontalLayout}
];

export const cells: { tester: RankedTester; cell: any }[] = [
    {tester: inputTextCellTester, cell: InputTextCell},
    {tester: inputTextareaCellTester, cell: InputTextareaCell},
];


