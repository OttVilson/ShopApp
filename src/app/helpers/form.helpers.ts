import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";

export const jsonPathsOfForm = (form: FormGroup): Path[] => {
    let paths: Path[] = [];

    processNode(form, [], paths);
    return paths;
}

const processNode = (control: AbstractControl, pathToNode: string[], paths: Path[]) => {
    const path: Path = getPath(control, pathToNode);
    paths.push(path);

    if (possiblyHasChildren(control))
        Object.keys(control.controls).forEach(child => processNode(control.get(child)!, [...pathToNode, child], paths));
}

const possiblyHasChildren = (control: AbstractControl): control is FormGroup | FormArray => {
    return control instanceof FormGroup || control instanceof FormArray;
}

const getPath = (control: AbstractControl, path: string[]): Path => {
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
    path: string[],
    nodeType: NodeType
}