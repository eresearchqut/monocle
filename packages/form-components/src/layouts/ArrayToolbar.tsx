import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

export interface ArrayLayoutToolbarProps {
  label: string;
  errors: string;
  path: string;
  addItem(path: string, data: any): () => void;
  createDefault(): any;
}



export const ArrayLayoutToolbar = React.memo(
  ({
    label,
    errors,
    addItem,
    path,
    createDefault
  }: ArrayLayoutToolbarProps) => {

    const right = (
        <React.Fragment>
          <Button label="{`Add to ${label}`}" icon="pi pi-plus" className="p-mr-2" onClick={() => addItem(path, createDefault())} aria-label={`Add to ${label}`}/>
        </React.Fragment>
    );

    return (
        // <Typography variant={'h6'}>{label}</Typography>
        //<ValidationIcon id='tooltip-validation' errorMessages={errors} />

      <Toolbar right={right} />



    );
  }
);
