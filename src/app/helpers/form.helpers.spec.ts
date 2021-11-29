import { FormBuilder, FormGroup } from "@angular/forms";
import { jsonPathsOfForm as pathsOfForm, NodeType, Path } from "./form.helpers";

fdescribe('Form helpers', () => {

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
            { path: ['first', '0'], nodeType: NodeType.SCALAR }
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
            { path: ['array', '0'], nodeType: NodeType.SCALAR },
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
            { path: ['array', '0'], nodeType: NodeType.OBJECT },
            { path: ['array', '0', 'groupScalar'], nodeType: NodeType.SCALAR },
            { path: ['array', '1'], nodeType: NodeType.ARRAY },
            { path: ['array', '1', '0'], nodeType: NodeType.SCALAR },
            { path: ['array', '2'], nodeType: NodeType.SCALAR }
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
            { path: ['first', '0'], nodeType: NodeType.OBJECT },
            { path: ['first', '0', 'third'], nodeType: NodeType.OBJECT },
            { path: ['first', '0', 'third', 'fourth'], nodeType: NodeType.ARRAY },
            { path: ['first', '0', 'third', 'fourth', '0'], nodeType: NodeType.SCALAR },
            { path: ['first', '0', 'third', 'fourth', '1'], nodeType: NodeType.OBJECT },
            { path: ['first', '0', 'third', 'fourth', '1', 'sixth'], nodeType: NodeType.SCALAR },
            { path: ['first', '1'], nodeType: NodeType.SCALAR },
            { path: ['first', '2'], nodeType: NodeType.SCALAR },
            { path: ['first', '3'], nodeType: NodeType.SCALAR },
            { path: ['first', '4'], nodeType: NodeType.OBJECT },
            { path: ['first', '4', 'horizontal'], nodeType: NodeType.SCALAR },
            { path: ['first', '5'], nodeType: NodeType.ARRAY },
            { path: ['first', '5', '0'], nodeType: NodeType.SCALAR }
        ];

        expect(paths).toEqual(expectedPaths);
    })

});