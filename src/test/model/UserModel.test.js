const userModel = new (require('../../model/UserModel'))();

describe('user model', () => {
    it('should create a user instance', () => {
        const user = userModel.create({});

        expect(user.constructor.name).toBe('User');
    })
});