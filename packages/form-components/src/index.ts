import {RankedTester} from '@jsonforms/core';

import {
    InputMultiselectCell,
    inputMultiselectCellTester,
    InputBooleanCell,
    inputBooleanCellTester,
    InputCheckboxGroupCell,
    inputCheckboxGroupCellTester,
    InputCalendarCell,
    inputCalendarCellTester,
    InputNumberCell,
    inputNumberCellTester,
    InputRadioGroupCell,
    inputRadioGroupCellTester,
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
    InputSignatureCell,
    inputSignatureCellTester
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
    {tester: inputCheckboxGroupCellTester, cell: InputCheckboxGroupCell},
    {tester: inputBooleanCellTester, cell: InputBooleanCell},
    {tester: inputCalendarCellTester, cell: InputCalendarCell},
    {tester: inputNumberCellTester, cell: InputNumberCell},
    {tester: inputSelectCellTester, cell: InputSelectCell},
    {tester: inputRadioGroupCellTester, cell: InputRadioGroupCell},
    {tester: inputRangeCellTester, cell: InputRangeCell},
    {tester: inputTextCellTester, cell: InputTextCell},
    {tester: inputMarkdownCellTester, cell: InputMarkdownCell},
    {tester: inputMultilineTextCellTester, cell: InputMultilineTextCell},
    {tester: inputMultiselectCellTester, cell: InputMultiselectCell},
    {tester: inputSignatureCellTester, cell: InputSignatureCell}
];