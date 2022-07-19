const optionModel = new (require('../../model/OptionModel'))();

describe('option model', () => {
    it('should create an option instance', () => {
        const option = optionModel.create({});

        expect(option.constructor.name).toBe('Option');
    })
});