import {RankedTester} from '@jsonforms/core';

import {
    InputBooleanCell,
    inputBooleanCellTester,
    InputDateCell,
    inputDateCellTester,
    InputNumberCell,
    inputNumberCellTester,
    InputTextareaCell,
    inputTextareaCellTester,
    InputTextCell,
    inputTextCellTester
} from './cells';

import {InputBooleanControl, inputBooleanControlTester, InputControl, inputControlTester, SvgMapControl, svgMapControlTester} from './controls';

import {ArrayLayout, arrayLayoutTester, HorizontalLayout, horizontalLayoutTester, VerticalLayout, verticalLayoutTester, AnyOfLayout, anyOfLayoutTester} from './layouts';

export * from './controls';
export * from './cells';
export * from './layouts';

export const renderers: { tester: RankedTester; renderer: any }[] = [
    {tester: arrayLayoutTester, renderer: ArrayLayout},
    {tester: horizontalLayoutTester, renderer: HorizontalLayout},
    {tester: inputControlTester, renderer: InputControl},
    {tester: inputBooleanControlTester, renderer: InputBooleanControl},
    {tester: svgMapControlTester, renderer: SvgMapControl},
    {tester: verticalLayoutTester, renderer: VerticalLayout},
    {tester: anyOfLayoutTester, renderer: AnyOfLayout}
];

export const cells: { tester: RankedTester; cell: any }[] = [
    {tester: inputBooleanCellTester, cell: InputBooleanCell},
    {tester: inputDateCellTester, cell: InputDateCell},
    {tester: inputNumberCellTester, cell: InputNumberCell},
    {tester: inputTextCellTester, cell: InputTextCell},
    {tester: inputTextareaCellTester, cell: InputTextareaCell}
];