import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { initializeApp } from "@firebase/app";
import { getToken } from "@firebase/app-check";
import { getScalarValuesOfForm, getScalarValueFromObject, 
    pathsOfForm, NodeType, Path, ScalarFormValue, leftDiffBetweenFormAndObject, FormObjectDiff } from "./form.helpers";

describe('Form helpers', () => {
describe('pathsOfForm', () => {
    let form: FormGroup;
    let fb: FormBuilder;
    let paths: Path[];
    let expectedPaths: Path[];
    const origin: Path = { path: [], nodeType: NodeType.OBJECT };

    beforeEach(() => {
        fb = new FormBuilder();
    })

    it('should consider FormGroup to be an object, and handle empty object', () => {
        form = fb.group({});
        paths = pathsOfForm(form);

        expectedPaths = [origin];

        expect(paths).toEqual(expectedPaths);
    })

    it('should consider FormControl to be a scalar (leaf)', () => {
        form = fb.group({
            'first': []
        });
        paths = pathsOfForm(form)
        
        expectedPaths = [
            origin,
            { path: ['first'], nodeType: NodeType.SCALAR }
        ];

        expect(paths).toEqual(expectedPaths);
    });

    it('should find an object within an object, and find a scalar from within the former', () => {
        form = fb.group({
            'first': fb.group({
                groupFirst: []
            })
        })
        paths = pathsOfForm(form);

        expectedPaths = [
            origin,
            { path: ['first'], nodeType: NodeType.OBJECT },
            { path: ['first', 'groupFirst'], nodeType: NodeType.SCALAR }
        ]; 

        expect(paths).toEqual(expectedPaths);
    });

    it('should consider FormArray to be an array, and handle an empty array', () => {
        form = fb.group({
            array: fb.array([])
        });
        paths = pathsOfForm(form);

        expectedPaths = [
            origin,
            { path: ['array'], nodeType: NodeType.ARRAY }
        ];

        expect(paths).toEqual(expectedPaths);
    })

    it('should consider FormArray to be an array, and find a scalar within it', () => {
        form = fb.group({
            first: fb.array([
                []
            ])
        });
        paths = pathsOfForm(form);

        expectedPaths = [
            origin,
            { path: ['first'], nodeType: NodeType.ARRAY },
            { path: ['first', 0], nodeType: NodeType.SCALAR }
        ];

        expect(paths).toEqual(expectedPaths);
    })

    it('should find an array and group and scalar from within group, and find a scalar from the first two; ' +
    'each branch should be exhausted before starting the next branch', () => {
        form = fb.group({
            array: fb.array([
                []
            ]),
            group: fb.group({
                scalar: []
            }),
            scalar: []
        });
        paths = pathsOfForm(form);

        expectedPaths = [
            origin,
            { path: ['array'], nodeType: NodeType.ARRAY },
            { path: ['array', 0], nodeType: NodeType.SCALAR },
            { path: ['group'], nodeType: NodeType.OBJECT },
            { path: ['group', 'scalar'], nodeType: NodeType.SCALAR },
            { path: ['scalar'], nodeType: NodeType.SCALAR }
        ];

        expect(paths).toEqual(expectedPaths);
    });

    it('should find a group, an array and a scalar from an array, and a scalar from the first two; ' +
    'a branch should be exhausted before moving to a next branch', () => {
        form = fb.group({
            array: fb.array([
                fb.group({
                    groupScalar: []
                }),
                fb.array([
                    []
                ]),
                []
            ])
        });
        paths = pathsOfForm(form);

        expectedPaths = [
            origin,
            { path: ['array'], nodeType: NodeType.ARRAY },
            { path: ['array', 0], nodeType: NodeType.OBJECT },
            { path: ['array', 0, 'groupScalar'], nodeType: NodeType.SCALAR },
            { path: ['array', 1], nodeType: NodeType.ARRAY },
            { path: ['array', 1, 0], nodeType: NodeType.SCALAR },
            { path: ['array', 2], nodeType: NodeType.SCALAR }
        ];

        expect(paths).toEqual(expectedPaths);
    });

    it('should be able to process forms of arbitrarily nested objects and arrays, ' + 
    'as an example up to 6 levels vertically and horizontally', () => {
        form = fb.group({
            first: fb.array([
                fb.group({
                    third: fb.group({
                        fourth: fb.array([
                            [],
                            fb.group({
                                sixth: []
                            })
                        ])
                    })
                }),
                [],
                [],
                [],
                fb.group({
                    horizontal: []
                }),
                fb.array([
                    []
                ])
            ])
        });
        paths = pathsOfForm(form);


        form = fb.group({
            first: fb.array([
                fb.array([
                    []
                ])
            ])
        });

        expectedPaths = [
            origin,
            { path: ['first'], nodeType: NodeType.ARRAY },
            { path: ['first', 0], nodeType: NodeType.OBJECT },
            { path: ['first', 0, 'third'], nodeType: NodeType.OBJECT },
            { path: ['first', 0, 'third', 'fourth'], nodeType: NodeType.ARRAY },
            { path: ['first', 0, 'third', 'fourth', 0], nodeType: NodeType.SCALAR },
            { path: ['first', 0, 'third', 'fourth', 1], nodeType: NodeType.OBJECT },
            { path: ['first', 0, 'third', 'fourth', 1, 'sixth'], nodeType: NodeType.SCALAR },
            { path: ['first', 1], nodeType: NodeType.SCALAR },
            { path: ['first', 2], nodeType: NodeType.SCALAR },
            { path: ['first', 3], nodeType: NodeType.SCALAR },
            { path: ['first', 4], nodeType: NodeType.OBJECT },
            { path: ['first', 4, 'horizontal'], nodeType: NodeType.SCALAR },
            { path: ['first', 5], nodeType: NodeType.ARRAY },
            { path: ['first', 5, 0], nodeType: NodeType.SCALAR }
        ];

        expect(paths).toEqual(expectedPaths);
    })
});

describe('getScalarValuesOfForm', () => {

    let form: FormGroup;
    let fb: FormBuilder;
    let formValues: ScalarFormValue[];
    let expectedValues: ScalarFormValue[];

    beforeEach(() => {
        fb = new FormBuilder();
    });

    it('should find scalar values from object, array, and scalar field', () => {
        form = fb.group({
            object: fb.group({
                objectScalar: 'objectScalarValue'
            }),
            array: fb.array([
                'arrayScalarValue'
            ]),
            scalar: 'scalarValue'
        });

        formValues = getScalarValuesOfForm(form);

        expectedValues = [
            { path: ['object', 'objectScalar'], value: 'objectScalarValue', pristine: true },
            { path: ['array', 0], value: 'arrayScalarValue', pristine: true },
            { path: ['scalar'], value: 'scalarValue', pristine: true }
        ];

        expect(formValues).toEqual(expectedValues);
    });

    it('should find dirty values from object, array, and scalar', () => {
        form = fb.group({
            scalar: 'scalarValue',
            array: fb.array([
                fb.group({}),
                'arrayScalarValue'
            ]),
            object: fb.group({
                objectArray: fb.array([]),
                objectScalar: 'objectScalarValue'
            }),
            pristine: 'pristineValue'
        });

        form.get('scalar')!.markAsDirty();
        form.get('array.1')!.markAsDirty();
        form.get('object.objectScalar')!.markAsDirty();

        formValues = getScalarValuesOfForm(form);

        expectedValues = [
            { path: ['scalar'], pristine: false, value: 'scalarValue' },
            { path: ['array', 1], pristine: false, value: 'arrayScalarValue' },
            { path: ['object', 'objectScalar'], pristine: false, value: 'objectScalarValue' },
            { path: ['pristine'], pristine: true, value: 'pristineValue' }
        ];

        expect(formValues).toEqual(expectedValues);
    });

    it('should recognize string, number, boolean, null, and undefined as scalar values', () => {
        form = fb.group({
            'string': '',
            'number': 2,
            'boolean': true,
            'null': null,
            'undefined': null
        });
        form.get('undefined')!.setValue(undefined);
        // https://github.com/angular/angular/blob/master/packages/forms/src/model.ts#L1253
        //  constructor(formState: any = null,

        formValues = getScalarValuesOfForm(form);

        expectedValues = [
            { path: ['string'], value: '', pristine: true },
            { path: ['number'], value: 2, pristine: true },
            { path: ['boolean'], value: true, pristine: true },
            { path: ['null'], value: null, pristine: true },
            { path: ['undefined'], value: undefined, pristine: true }
        ];

        expect(formValues).toEqual(expectedValues);
    })
});

describe('getScalarValueFromObject', () => {
    let object: { [key: string]: any };

    it('should find value from nested object, array, and scalar', () => {
        object = {
            'object': { 'objectScalar': 'objectScalarValue' },
            'array': [2],
            'scalar': 'scalarValue'
        };

        let objectValue = getScalarValueFromObject(object, ['object', 'objectScalar']);
        expect(objectValue).toEqual('objectScalarValue');
        let arrayValue = getScalarValueFromObject(object, ['array', '0']);
        expect(arrayValue).toEqual(2);
        let scalarValue = getScalarValueFromObject(object, ['scalar']);
        expect(scalarValue).toEqual('scalarValue');
    });

    it('should find string, number, boolean, null and undefined values from object', () => {
        object = {
            'string': 'stringValue',
            'number': [[3]],
            'boolean': [
                true
            ],
            'null': {
                'null': null
            },
            'undefined': undefined
        };

        let stringValue = getScalarValueFromObject(object, ['string']);
        expect(stringValue).toEqual('stringValue');
        let numberValue  = getScalarValueFromObject(object, ['number', '0', '0']);
        expect(numberValue).toEqual(3);
        let booleanValue = getScalarValueFromObject(object, ['boolean', '0']);
        expect(booleanValue).toEqual(true);
        let nullValue = getScalarValueFromObject(object, ['null', 'null']);
        expect(nullValue).toEqual(null);
        let undefinedValue = getScalarValueFromObject(object, ['undefined']);
        expect(undefinedValue).toEqual(undefined);
    });

    it('should find scalar values of arbitrarily deeply nested JSON object, ' + 
        'for example up to sixth level both horizontally and vertically', () => {

        object = {
            vfirst: {
                vsecond: [
                    'vthird',
                    {
                        vfourth: [
                            ['vsixth']
                        ] 
                    },
                    'hthird',
                    'hfourth',
                    'hfifth',
                    'hsixth'
                ]
            }
        };

        let vvalue = getScalarValueFromObject(object, ['vfirst', 'vsecond', '1', 'vfourth', '0', '0']);
        expect(vvalue).toEqual('vsixth');
        let hvalue1 = getScalarValueFromObject(object, ['vfirst', 'vsecond', '0']);
        expect(hvalue1).toEqual('vthird');
        let hvalue2 = getScalarValueFromObject(object, ['vfirst', 'vsecond', '2']);
        expect(hvalue2).toEqual('hthird');
        let hvalue3 = getScalarValueFromObject(object, ['vfirst', 'vsecond', '3']);
        expect(hvalue3).toEqual('hfourth');
        let hvalue4 = getScalarValueFromObject(object, ['vfirst', 'vsecond', '4']);
        expect(hvalue4).toEqual('hfifth');
        let hvalue5 = getScalarValueFromObject(object, ['vfirst', 'vsecond', '5']);
        expect(hvalue5).toEqual('hsixth');
    });

    it('should throw error in case a non-scalar node is reached by the end of the path', () => {
        object = {
            nestedGroup: {}
        };

        expect(() => getScalarValueFromObject(object, ['nestedGroup']))
            .toThrow(new Error('Reached unexpected non-scalar value in object.'));
    });

    it('should return undefined if the path is matched only partially in the object', () => {
        object = {
            array: [
                { presentPath: 'value'}
            ]
        };

        let adjacentValue = getScalarValueFromObject(object, ['object', 'array', '0', 'notPresentPath']);
        expect(adjacentValue).toEqual(undefined);
        let fartherValue = getScalarValueFromObject(object, 
            ['object', 'array', '0', 'notPresentPath', 'totallyNotPresent']);
        expect(fartherValue).toEqual(undefined);
    });
});

describe('leftDiffBetweenFormAndObject', () => {
    let form: FormGroup;
    let fb: FormBuilder;
    let object: { [key: string]: any };
    let diff: FormObjectDiff[];
    let expectedDiff: FormObjectDiff[];
    let formValue = 'formValue';
    let objectValue = 'objectValue';
    let pristine = true;

    beforeEach(() => {
        fb = new FormBuilder();
    });

    it('should output an empty array if the form and the object contain the same data', () => {
        form = fb.group({
            scalar: 'scalarValue',
            array: fb.array([
                'arrayValue'
            ]),
            object: fb.group({
                scalar: 'groupValue'
            })
        });
        object = {
            scalar: 'scalarValue',
            array: ['arrayValue'],
            object: {
                scalar: 'groupValue'
            }
        };

        diff = leftDiffBetweenFormAndObject(form, object);
        expectedDiff = []

        expect(diff).toEqual(expectedDiff);
    });

    it('should find difference between scalar values directly, in nested object and in nested array', () => {
        form = fb.group({
            scalar: 'formScalar',
            group: fb.group({
                'scalar': 'formGroupScalar'
            }),
            array: fb.array([
                'formArrayScalar'
            ])
        });
        object = {
            scalar: 'objectScalar',
            group: {
                'scalar': 'objectGroupScalar'
            },
            array: [
                'objectArrayScalar'
            ]
        };

        diff = leftDiffBetweenFormAndObject(form, object);
        expectedDiff = [
            { path: ['scalar'], pristine, formValue: 'formScalar', objectValue: 'objectScalar' },
            { path: ['group', 'scalar'], pristine, formValue: 'formGroupScalar', objectValue: 'objectGroupScalar' },
            { path: ['array', 0], pristine, formValue: 'formArrayScalar', objectValue: 'objectArrayScalar' }
        ];

        expect(diff).toEqual(expectedDiff);
    });

    it('should find differences including null, numeric, string, boolean and undefined values', () => {
        form = fb.group({
            string: 'formString',
            number: 1,
            boolean: true,
            null: null,
            undefined: null
        });
        form.get('undefined')!.setValue(undefined);

        object = {
            string: 'objectString',
            number: 2,
            boolean: false,
            null: undefined,
            undefined: null
        };

        diff = leftDiffBetweenFormAndObject(form, object);
        expectedDiff = [
            { path: ['string'], pristine, formValue: 'formString', objectValue: 'objectString' },
            { path: ['number'], pristine, formValue: 1, objectValue: 2 },
            { path: ['boolean'], pristine, formValue: true, objectValue: false },
            { path: ['null'], pristine, formValue: null, objectValue: undefined },
            { path: ['undefined'], pristine, formValue: undefined, objectValue: null }
        ];

        expect(diff).toEqual(expectedDiff);
    });

    it('should find differences between string, number, boolean, null and undefined values ' +
    'also when the type differs in the form and in the object', () => {
        form = fb.group({
            string: 'string',
            number: 1,
            boolean: true,
            null: null,
            undefined: null
        });
        form.get('undefined')!.setValue(undefined);

        object = {
            string: undefined,
            number: 'string',
            boolean: 1,
            null: true,
            undefined: null
        };

        diff = leftDiffBetweenFormAndObject(form, object);
        expectedDiff = [
            { path: ['string'], pristine, formValue: 'string', objectValue: undefined },
            { path: ['number'], pristine, formValue: 1, objectValue: 'string' },
            { path: ['boolean'], pristine, formValue: true, objectValue: 1 },
            { path: ['null'], pristine, formValue: null, objectValue: true },
            { path: ['undefined'], pristine, formValue: undefined, objectValue: null }
        ];

        expect(diff).toEqual(expectedDiff);
    });

    it('should find differences between arbitrarily deeply nested scalar values, e.g. up to level 6', () => {
        form = fb.group({
            first: fb.group({
                second: fb.array([
                    fb.array([
                        fb.group({
                            fifth: fb.array([
                                'correct',
                                formValue
                            ])
                        })
                    ])
                ])
            })
        });
        object = {
            first: {
                second: [
                    [
                        {
                            fifth: [
                                'correct',
                                objectValue
                            ]
                        }
                    ]
                ]
            }
        };

        diff = leftDiffBetweenFormAndObject(form, object);
        expectedDiff = [
            { path: ['first', 'second', 0, 0, 'fifth', 1], pristine, formValue, objectValue }
        ];

        expect(diff).toEqual(expectedDiff);
    });

    it('should indicate the pristiness of the form value in case of a difference', () => {
        form = fb.group({
            pristine: 'pristine',
            dirty: formValue
        });
        object = {
            pristine: 'pristine',
            dirty: objectValue
        };

        form.get('dirty')?.markAsDirty();

        diff = leftDiffBetweenFormAndObject(form, object);
        expectedDiff = [
            { path: ['dirty'], pristine: false, formValue, objectValue }
        ];

        expect(diff).toEqual(expectedDiff);
    });

    it('should mark undefined the leaves of the form paths that do not exist in the object, ' +
        'and thus consider these as differences.', () => {

        form = fb.group({
            existing: fb.group({
                present: 'present',
                'existing-difference': formValue
            }),
            'non-existing-group': fb.group({
                'not-present': 'not-present'
            }),
            'non-existing-array': fb.array([
                'not-present'
            ])
        });
        object = {
            existing: {
                present: 'present',
                'existing-difference': objectValue
            }
        };

        diff = leftDiffBetweenFormAndObject(form, object);
        expectedDiff = [
            { path: ['existing', 'existing-difference'], pristine, formValue, objectValue },
            { path: ['non-existing-group', 'not-present'], pristine, 
                formValue: 'not-present', objectValue: undefined },
            { path: ['non-existing-array', 0], pristine, formValue: 'not-present', objectValue: undefined }
        ];

        expect(diff).toEqual(expectedDiff);
    });

    it('should ignore empty objects (FormGroups) and arrays (FormArrays) of the form, ' + 
        'as these don\'t have scalar values (FormControls)', () => {

        form = fb.group({
            emptyGroup: fb.group({}),
            emptyArray: fb.array([])
        });
        object = {};

        diff = leftDiffBetweenFormAndObject(form, object);
        expectedDiff = [];

        expect(diff).toEqual(expectedDiff);
    });
});
});