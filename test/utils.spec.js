import { createStepArgument } from '../lib/utils'

describe('utils', () => {
    describe('createStepArgument', () => {
        // because should(arg).be.undefined() throws TypeError
        it('Works without argument', () => {
            ({ result: createStepArgument({}) }).should.be.eql({ result: undefined })
        })

        it('Works with unexpected type', () => {
            ({ result: createStepArgument({ argument: {type: 'smth'} }) }).should.be.eql({ result: undefined })
        })

        it('Works with DataTable', () => {
            createStepArgument({
                argument: {
                    type: 'DataTable',
                    rows: [
                        {cells: [{value: 1}, {value: 2}]},
                        {cells: [{value: 3}, {value: 4}]},
                        {cells: [{value: 5}, {value: 6}]}
                    ]
                }
            }).should.be.eql([{
                rows: [{
                    cells: [1, 2]
                }, {
                    cells: [3, 4]
                }, {
                    cells: [5, 6]
                }]
            }])
        })

        it('Works with DocString', () => {
            createStepArgument({
                argument: {
                    type: 'DocString',
                    content: 'some string content'
                }
            }).should.be.eql('some string content')
        })
    })
})
