const enterpriseModel = new (require('../../model/EnterpriseModel'))();

describe('enterprise model', () => {
    it('should create an enterprise instance', () => {
        const enterprise = enterpriseModel.create({});

        expect(enterprise.constructor.name).toBe('Enterprise');
    })
});