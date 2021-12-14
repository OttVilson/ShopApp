import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";

export const pathsOfForm = (form: FormGroup): Path[] => {
    let paths: Path[] = [];

    processNode(form, [], paths);
    return paths;
}

export const getScalarValuesOfForm = (form: FormGroup): ScalarFormValue[] => {
    const paths = pathsOfForm(form).filter(path => path.nodeType === NodeType.SCALAR);
    const values: ScalarFormValue[] = [];

    paths.forEach(path => {
        let field = form.get(path.path)!;
        const value: ScalarFormValue = { path: path.path, value: field.value, pristine: field.pristine };
        values.push(value);
    });

    return values;
}

export const getScalarValueFromObject = (
    object: { [key: string]: any }, 
    path: (string | number)[]
): string | number | boolean | null | undefined  => {
    const value = path.reduce((acc, pathSegment) => isValueScalar(acc) ? acc : acc[pathSegment], object);

    if (isValueScalar(value))
        return value;
    else
        throw new Error('Reached unexpected non-scalar value in object.')
} 

export const leftDiffBetweenFormAndObject = (
    form: FormGroup, 
    object: { [key: string]: any }
): FormObjectDiff[] => {
    let diff: FormObjectDiff[] = [];
    let formValues = getScalarValuesOfForm(form);
    formValues.forEach(formValue => {
        let objectValue = getScalarValueFromObject(object, formValue.path);
        if (formValue.value !== objectValue)
            diff.push(composeDiffFormObject(formValue, objectValue));
    });

    return diff;
}

export const buildObjectFromDiff = (diff: FormObjectDiff[]) => {
    let object: { [key: string]: any };

}

const composeDiffFormObject = (
    formValue: ScalarFormValue, 
    objectValue: string | number | boolean | null | undefined
): FormObjectDiff => {
    return {
        path: formValue.path,
        pristine: formValue.pristine,
        formValue: formValue.value,
        objectValue: objectValue
    };
}

const isValueScalar = (value: any): value is string | number | boolean | null | undefined => {
    return value === null || 
            ['string', 'number', 'boolean', 'undefined'].indexOf(typeof value) !== -1;
}

const processNode = (control: AbstractControl, pathToNode: (string | number)[], paths: Path[]) => {
    const path: Path = getPath(control, pathToNode);
    paths.push(path);

    if (control instanceof FormGroup)
        Object.keys(control.controls)
            .forEach(child => processNode(control.get(child)!, [...pathToNode, child], paths));
    else if (control instanceof FormArray)
        control.controls.forEach((child, index) => processNode(child, [...pathToNode, index], paths));
}

const getPath = (control: AbstractControl, path: (string | number)[]): Path => {
    let nodeType: NodeType;
    if (control instanceof FormControl)
        nodeType = NodeType.SCALAR;
    else if (control instanceof FormGroup)
        nodeType = NodeType.OBJECT;
    else
        nodeType = NodeType.ARRAY;
    
    return { path, nodeType };
}

export enum NodeType {
    SCALAR = 'scalar',
    OBJECT = 'object',
    ARRAY = 'array'
}

export interface Path {
    path: (string | number)[],
    nodeType: NodeType
}

export interface ScalarFormValue {
    path: (string | number)[],
    value: string | number | boolean | null | undefined,
    pristine: boolean
}

export interface FormObjectDiff {
    path: (string | number)[],
    formValue: string | number | boolean | null | undefined,
    pristine: boolean,
    objectValue: string | number | boolean | null | undefined
}
