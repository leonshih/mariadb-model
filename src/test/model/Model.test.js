const model = require('../../model/');
const Model = require('../../model/Model');
class UserModel extends Model {
  constructor() {
    super();
    this.table = 'user';
    this.tableColumns = {
      /** 需轉型成CHAR之欄位(因javascript無法處理bigint) */
      bigint: [
        'uid',
        'enterprise_uid',
        'created_by',
        'updated_by',
        'deleted_by',
      ],
      /** 其他欄位 */
      general: [
        'name',
        'type',
        'email',
        'mobile',
        'password',
        'password_updated_at',
        'authority',
        'enabled',
        'created_at',
        'updated_at',
        'deleted',
        'deleted_at',
      ],
    };
  }

  create(data) {
    return new User(data);
  }
}

class User {
  constructor(data) {
    this.uid = data.uid ?? null;
    this.name = data.name ?? null;
    this.type = data.type ?? null;
    this.email = data.email ?? null;
    this.mobile = data.mobile ?? null;
    this.enterpriseUid = data.enterpriseUid ?? null;
    this.password = data.password ?? null;
    this.passwordUpdatedAt = data.passwordUpdatedAt ?? null;
    this.authority = data.authority ?? null;
    this.enabled = data.enabled ?? true;
    this.createdAt = data.createdAt ?? new Date();
    this.createdBy = data.createdBy ?? null;
    this.updatedAt = data.updatedAt ?? null;
    this.updatedBy = data.updatedBy ?? null;
    this.deleted = data.deleted ?? 0;
    this.deletedAt = data.deletedAt ?? null;
    this.deletedBy = data.deletedBy ?? null;
  }
}

const userModel = new UserModel();

describe('mariadb connection', () => {
  it('should get a database connection', async () => {
    const conn = await userModel.getConnection();

    expect(conn.constructor.name).toBe('ConnectionPromise');
  });

  it('should create a connection and begin transaction', async () => {
    const conn = await userModel.getConnection();
    const transaction = await conn.beginTransaction();

    expect(transaction.constructor.name).toBe('OkPacket');
  });
});

describe('database transaction', () => {});

describe('generate SQL query string', () => {
  it('should create a SELECT query string that SELECT all params and should CAST bigint param to CHAR', () => {
    const selectQueryStr = userModel.getSelectQuery();

    expect(selectQueryStr).toBe(
      'SELECT CAST(user.uid AS CHAR) AS uid, ' +
        'CAST(user.enterprise_uid AS CHAR) AS enterprise_uid, ' +
        'CAST(user.created_by AS CHAR) AS created_by, ' +
        'CAST(user.updated_by AS CHAR) AS updated_by, ' +
        'CAST(user.deleted_by AS CHAR) AS deleted_by, ' +
        'user.name, ' +
        'user.type, ' +
        'user.email, ' +
        'user.mobile, ' +
        'user.password, ' +
        'user.password_updated_at, ' +
        'user.authority, ' +
        'user.enabled, ' +
        'user.created_at, ' +
        'user.updated_at, ' +
        'user.deleted, ' +
        'user.deleted_at ' +
        'FROM user'
    );
  });

  it('should create a SELECT query string that SELECT some params', () => {
    const projection = {
      params: ['uid', 'enterpriseUid', 'name', 'type'],
    };
    const selectQueryStr = userModel.getSelectQuery(projection);

    expect(selectQueryStr).toBe(
      'SELECT CAST(user.uid AS CHAR) AS uid, ' +
        'CAST(user.enterprise_uid AS CHAR) AS enterprise_uid, ' +
        'user.name, ' +
        'user.type ' +
        'FROM user'
    );
  });

  it('should create a SELECT query string that includes a table', () => {
    const projection = {
      params: ['uid', 'name', 'type'],
      includes: [
        {
          table: new model.EnterpriseModel(),
          params: ['uid', 'name'],
        },
      ],
    };

    const selectQueryStr = userModel.getSelectQuery(projection);

    expect(selectQueryStr).toBe(
      'SELECT CAST(user.uid AS CHAR) AS uid, ' +
        'user.name, ' +
        'user.type, ' +
        'CAST(enterprise.uid AS CHAR) AS enterprise_uid, ' +
        'enterprise.name AS enterprise_name ' +
        'FROM user ' +
        'LEFT JOIN enterprise ON user.enterprise_uid = enterprise.uid'
    );
  });

  it('should create a SELECT query string that includes two tables', () => {
    const projection = {
      params: ['uid', 'name', 'type'],
      includes: [
        {
          table: new model.EnterpriseModel(),
          params: ['uid', 'name'],
        },
        {
          table: new model.OptionModel(),
          params: ['uid', 'name'],
        },
      ],
    };

    const selectQueryStr = userModel.getSelectQuery(projection);

    expect(selectQueryStr).toBe(
      'SELECT CAST(user.uid AS CHAR) AS uid, ' +
        'user.name, ' +
        'user.type, ' +
        'CAST(enterprise.uid AS CHAR) AS enterprise_uid, ' +
        'enterprise.name AS enterprise_name, ' +
        'CAST(option.uid AS CHAR) AS option_uid, ' +
        'option.name AS option_name ' +
        'FROM user ' +
        'LEFT JOIN enterprise ON user.enterprise_uid = enterprise.uid ' +
        'LEFT JOIN option ON user.option_uid = option.uid'
    );
  });

  it('should create a WHERE query string', () => {
    const whereQueryStr = userModel.getWhereQuery(
      {
        enterpriseUid: '99790745107431484',
        name: 'testName',
      },
      {
        like: [{ param: 'type', value: 'admin' }],
      }
    );

    expect(whereQueryStr).toBe(
      ' WHERE 1=1 AND CAST(user.enterprise_uid AS CHAR) = ? AND user.name = ? AND user.type LIKE \'%admin%\' AND user.deleted = 0'
    );
  });

  it('should create a INSERT query string that insert an user', () => {
    const insertQueryStr = userModel.getInsertQuery({
      uid: '99790745107431485',
      enterpriseUid: '99790745107431484',
      name: 'testName',
      type: 'admin',
    });

    expect(insertQueryStr).toBe(
      'INSERT INTO user (uid,enterprise_uid,name,type) VALUES (?,?,?,?)'
    );
  });

  it('should create a INSERT query string that insert an array of user', () => {
    const insertQueryStr = userModel.getInsertQuery([
      {
        uid: '99790745107431485',
        enterpriseUid: '99790745107431484',
        name: 'testName',
        type: 'admin',
      },
      {
        uid: '99790745107431486',
        enterpriseUid: '99790745107431484',
        name: 'testName',
        type: 'admin',
      },
    ]);

    expect(insertQueryStr).toBe(
      'INSERT INTO user (uid,enterprise_uid,name,type) VALUES (?, ?, ?, ?)'
    );
  });
});
